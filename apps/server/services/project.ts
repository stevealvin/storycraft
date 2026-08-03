import path from 'path';
import fs from 'fs-extra';
import { db } from './db.js';
import { CONFIG } from '../config.js';

export interface CreateProjectInput {
  title: string;
  genre: string;
  target_words?: number;
  premise?: string;
  golden_finger?: string;
  power_system?: string;
  world_setting?: string;
  master_outline?: string;
}

export function getProjectDir(projectId: string): string {
  return path.join(CONFIG.projectsDir, projectId);
}

export function createProject(input: CreateProjectInput) {
  const projectId = 'proj_' + Date.now().toString(36);
  const projDir = getProjectDir(projectId);

  fs.ensureDirSync(path.join(projDir, '正文'));
  fs.ensureDirSync(path.join(projDir, '大纲'));
  fs.ensureDirSync(path.join(projDir, '设定集'));
  fs.ensureDirSync(path.join(projDir, '审查报告'));
  fs.ensureDirSync(path.join(projDir, '.story-system', 'commits'));
  fs.ensureDirSync(path.join(projDir, '.webnovel', 'backups'));

  const now = new Date().toISOString();
  const targetWords = input.target_words || 1000000;

  const stmt = db.prepare(`
    INSERT INTO projects (id, title, genre, target_words, total_words, current_volume, premise, golden_finger, power_system, world_setting, master_outline, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, 1, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  stmt.run(
    projectId,
    input.title,
    input.genre,
    targetWords,
    input.premise || '',
    input.golden_finger || '',
    input.power_system || '',
    input.world_setting || '',
    input.master_outline || '',
    now,
    now
  );

  if (input.master_outline) {
    fs.writeFileSync(path.join(projDir, '大纲', '总纲.md'), `# 《${input.title}》总纲\n\n${input.master_outline}`, 'utf-8');
  }

  if (input.world_setting || input.power_system) {
    const settingContent = `# 《${input.title}》设定集\n\n## 力量体系\n${input.power_system || '暂未生成'}\n\n## 世界观背景\n${input.world_setting || '暂未生成'}`;
    fs.writeFileSync(path.join(projDir, '设定集', '世界观与力量体系.md'), settingContent, 'utf-8');
  }

  const stateData = {
    project_id: projectId,
    title: input.title,
    genre: input.genre,
    current_chapter: 0,
    total_words: 0,
    last_updated: now,
    characters_count: 0,
    foreshadowings_count: 0
  };
  fs.writeJsonSync(path.join(projDir, '.webnovel', 'state.json'), stateData, { spaces: 2 });

  return getProjectById(projectId);
}

export function getProjectById(projectId: string) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) return null;

  const charCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE project_id = ?').get(projectId) as any;
  const chapCount = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE project_id = ?').get(projectId) as any;
  const volCount = db.prepare('SELECT COUNT(*) as count FROM volumes WHERE project_id = ?').get(projectId) as any;
  const foresCount = db.prepare('SELECT COUNT(*) as count FROM foreshadowings WHERE project_id = ? AND status != "已回收"').get(projectId) as any;
  const totalWords = db.prepare('SELECT SUM(word_count) as total FROM chapters WHERE project_id = ?').get(projectId) as any;

  return {
    ...project,
    characters_count: charCount?.count || 0,
    chapters_count: chapCount?.count || 0,
    volumes_count: volCount?.count || 0,
    open_foreshadowings_count: foresCount?.count || 0,
    total_words: totalWords?.total || project.total_words || 0
  };
}

export function listProjects() {
  const projects = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as any[];
  return projects.map((p) => getProjectById(p.id));
}

export function deleteProject(projectId: string) {
  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  const projDir = getProjectDir(projectId);
  if (fs.existsSync(projDir)) {
    fs.removeSync(projDir);
  }
  return { success: true };
}

export function seedSampleProjectIfEmpty() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any)?.c || 0;
  if (count > 0) return;

  console.log('🌱 Seeding sample novel project 《太初因果帝尊》...');
  const proj = createProject({
    title: '太初因果帝尊',
    genre: '修仙',
    target_words: 2000000,
    premise: '主角叶尘重回少时，觉醒太初因果符。凡涉及打压、诅咒与偷袭的因果攻击，皆可十倍反转增益己身。在弱肉强食的仙界逆天改命，登顶因果大道。',
    golden_finger: '太初因果符：因果反转、伤害吸收转化为境界修为、因果溯源。',
    power_system: '练气、筑基、金丹、元婴、化神、炼虚、合体、大乘、渡劫',
    world_setting: '太初界分东荒、西漠、南岭、北原与中州大域。天元宗乃东荒大宗，与万魂魔殿争霸三千年。',
    master_outline: '起：天元宗外门崛起与破局；承：南荒古帝秘境争霸；转：万魂魔殿宗门大决战；合：融合天道与超脱渡劫。'
  });

  db.prepare(`
    INSERT INTO characters (id, project_id, name, role, status, cultivation, faction, description)
    VALUES 
    (?, ?, '叶尘', '主角', '活跃', '筑基初期', '天元宗外门', '重回少年时代的仙尊，性格果断冷静，怀抱太初因果符。'),
    (?, ?, '姜洛璃', '配角', '活跃', '筑基后期', '天元宗内门', '天元宗第一女天骄，身怀琉璃圣体，对叶尘的隐秘实力感到惊奇。'),
    (?, ?, '陆天绝', '反派', '活跃', '金丹初期', '天元宗执法堂', '嫉贤妒能的执法堂长老，暗中与魔道勾结，屡次欲置叶尘于死地。')
  `).run('char_1', proj.id, 'char_2', proj.id, 'char_3', proj.id);

  db.prepare(`
    INSERT INTO chapters (id, project_id, volume_num, chapter_num, title, outline, content, word_count, status, review_score)
    VALUES 
    (?, ?, 1, 1, '重返少年，因果反转！', '叶尘在偏殿醒来，面对外门执事的刁难与逼迫，激活太初因果符，当场反转因果威压。', '太初历三万六千年，天元宗偏殿。\n\n叶尘缓缓睁开双眼，冰冷的青石地板上传来刺骨的寒意。四周雕梁画栋，空气中弥漫着淡淡的檀香与劣质灵药的味道。\n\n“我竟真的重回三千年前，天元宗外门偏殿之时？！”\n\n叶尘眼中闪过一抹极其深邃的光芒。前世他登临至尊之位，却在渡劫最后一关被挚友叛徒偷袭，功亏一溃。如今重活一世，所有的遗憾与仇恨，都将亲手抹平！\n\n就在此时，神识深处一阵剧烈震颤，一枚散发着苍茫古朴气息的暗金色符箓赫然悬浮——太初因果符！\n\n【提示：检测到敌意威压攻击，太初因果反转启动！】\n【敌意威压转化为纯净精气，修为+500！】', 420, 'draft', 92),
    (?, ?, 1, 2, '执法堂逼迫，当场突破！', '陆天绝长老派人前来搜查，叶尘借助因果反转吸收雷霆惩戒之力，当场踏入筑基二重。', '第2章大纲预设剧情：执法堂扣押名额，叶尘从容破局...', '', 0, 'planned', 0),
    (?, ?, 1, 3, '秘境名额，一剑惊世！', '大比赛场，叶尘一剑击败外门第一高手，震撼全场。', '第3章大纲预设剧情：外门大比斩获第一...', '', 0, 'planned', 0)
  `).run('chap_1', proj.id, 'chap_2', proj.id, 'chap_3', proj.id);

  db.prepare(`
    INSERT INTO foreshadowings (id, project_id, title, description, status, planted_chapter, impact_level)
    VALUES (?, ?, '执法堂暗通万魂魔殿的密信', '叶尘在偏殿搜出的黑色玉简，记录了陆天绝与魔道的交易。', '待回收', 1, '核心大伏笔')
  `).run('fores_1', proj.id);
}

seedSampleProjectIfEmpty();
