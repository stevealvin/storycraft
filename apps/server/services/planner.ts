import { chatCompletionJson } from './llm.js';
import { db } from './db.js';

export async function generatePremise(input: { genre: string; userConcept?: string }) {
  const prompt = `
你一位资深网络小说白金主编。请为一部【${input.genre}】题材的网络小说设计全新的立意、金手指与核心爽点。
${input.userConcept ? `作者初步构想：${input.userConcept}` : ''}

请输出 JSON 格式：
{
  "titles": ["备选书名1", "备选书名2", "备选书名3"],
  "selected_title": "推荐主书名",
  "premise": "作品核心简介（150-200字，突出品质感、核心冲突与主角动机）",
  "golden_finger": "金手指/核心能力名称与运行逻辑（明确爽点来源）",
  "selling_points": ["看点1", "看点2", "看点3"]
}
`;

  return await chatCompletionJson(
    [{ role: 'user', content: prompt }],
    { temperature: 0.8 }
  );
}

export async function generateCharacters(input: { genre: string; title: string; premise: string; golden_finger?: string }) {
  const prompt = `
为网文《${input.title}》（题材：${input.genre}）设计主要角色人设矩阵。
作品立意：${input.premise}
金手指：${input.golden_finger || '无'}

请设计 3-5 位核心登场角色（包含主角、女主/重要盟友、核心对手/反派）：
输出 JSON 格式：
{
  "characters": [
    {
      "name": "角色姓名",
      "role": "主角 / 配角 / 反派",
      "cultivation": "初始境界/能力等级",
      "faction": "所属势力",
      "description": "性格特征、核心动机与人设看点（100字）",
      "relationship_notes": "与主角的关系"
    }
  ]
}
`;

  return await chatCompletionJson(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7 }
  );
}

export async function generateWorldbuilding(input: { genre: string; title: string; premise: string }) {
  const prompt = `
为网文《${input.title}》（题材：${input.genre}）设计世界观与力量体系。
作品立意：${input.premise}

请输出 JSON 格式：
{
  "power_system": "清晰的力量境界划分（从低到高，例如：练气、筑基...）及突破条件",
  "world_setting": "世界观地理、核心大势力、天道规则与时代背景说明"
}
`;

  return await chatCompletionJson(
    [{ role: 'user', content: prompt }],
    { temperature: 0.6 }
  );
}

export async function generateMasterOutline(input: { genre: string; title: string; premise: string; power_system: string }) {
  const prompt = `
为网文《${input.title}》（题材：${input.genre}）规划全书四幕式架构（起、承、转、合）总纲。
作品立意：${input.premise}
力量体系：${input.power_system}

请输出 JSON 格式：
{
  "act_1_rising": "第一幕：起（新手村崛起、建立金手指期待感、解决首个生死危局）",
  "act_2_expansion": "第二幕：承（地图展开、势力争霸、核心大伏笔铺设）",
  "act_3_climax": "第三幕：转（宗门/世界级大危机降临、惨烈转折、核心破局）",
  "act_4_resolution": "第四幕：合（终极决战、融道超脱、完美收尾）",
  "master_outline": "全书总纲整理 Markdown 文本"
}
`;

  return await chatCompletionJson(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7 }
  );
}

export async function planVolumeChapters(projectId: string, volumeNum: number = 1, chapterCount: number = 10) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) throw new Error('Project not found');

  const existingChaptersCount = (db.prepare('SELECT COUNT(*) as count FROM chapters WHERE project_id = ?').get(projectId) as any)?.count || 0;
  const startChapNum = existingChaptersCount + 1;

  const characters = db.prepare('SELECT name, role, cultivation, description FROM characters WHERE project_id = ?').all(projectId) as any[];

  const prompt = `
请为网文《${project.title}》（题材：${project.genre}）规划第 ${volumeNum} 卷的章节细纲。
作品立意：${project.premise}
力量体系：${project.power_system}
已有角色：${JSON.stringify(characters)}

请生成从第 ${startChapNum} 章到第 ${startChapNum + chapterCount - 1} 章（共 ${chapterCount} 章）的章节细纲。
每章需包含：
1. 章节标题（极其吸睛的网文风格标题）
2. 细纲内容（包含场景、核心冲突、爽点爆发、章尾追读钩子与预埋伏笔）

请输出 JSON 格式：
{
  "volume_title": "第${volumeNum}卷 卷名",
  "volume_summary": "本卷核心剧情主线与高潮结局说明",
  "chapters": [
    {
      "chapter_num": ${startChapNum},
      "title": "章节标题",
      "outline": "本章细纲说明（150字）"
    }
  ]
}
`;

  const result = await chatCompletionJson<{ volume_title: string; volume_summary: string; chapters: any[] }>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7 }
  );

  const volId = `vol_${projectId}_${volumeNum}`;
  db.prepare(`
    INSERT OR REPLACE INTO volumes (id, project_id, volume_num, title, summary, status)
    VALUES (?, ?, ?, ?, ?, 'in_progress')
  `).run(volId, projectId, volumeNum, result.volume_title || `第${volumeNum}卷`, result.volume_summary || '');

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO chapters (id, project_id, volume_num, chapter_num, title, outline, content, word_count, status, review_score)
    VALUES (?, ?, ?, ?, ?, ?, '', 0, 'planned', 0)
  `);

  for (const chap of result.chapters) {
    const chapId = `chap_${projectId}_${chap.chapter_num}`;
    stmt.run(chapId, projectId, volumeNum, chap.chapter_num, chap.title, chap.outline);
  }

  return db.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_num ASC').all(projectId);
}
