import path from 'path';
import fs from 'fs-extra';
import { db } from './db.js';
import { getProjectDir } from './project.js';
import { chatCompletion } from './llm.js';

export interface DoctorCheckItem {
  name: string;
  category: 'directory' | 'database' | 'foreshadowings' | 'reviews' | 'api';
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export async function runDoctor(projectId: string) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) throw new Error('Project not found');

  const projDir = getProjectDir(projectId);
  const checks: DoctorCheckItem[] = [];

  const requiredDirs = ['正文', '大纲', '设定集', '审查报告', '.story-system/commits', '.webnovel/backups'];
  let missingDirsCount = 0;
  for (const d of requiredDirs) {
    const fullPath = path.join(projDir, d);
    if (!fs.existsSync(fullPath)) {
      missingDirsCount++;
      fs.ensureDirSync(fullPath);
    }
  }

  if (missingDirsCount === 0) {
    checks.push({ name: '目录完整性', category: 'directory', status: 'pass', message: '所有必需的工作区目录均完整存在' });
  } else {
    checks.push({ name: '目录完整性', category: 'directory', status: 'warn', message: `修复了 ${missingDirsCount} 个缺失的子目录` });
  }

  const chapters = db.prepare('SELECT chapter_num, status, word_count, review_score FROM chapters WHERE project_id = ?').all(projectId) as any[];
  const characters = db.prepare('SELECT count(*) as c FROM characters WHERE project_id = ?').get(projectId) as any;

  checks.push({
    name: '数据库与状态树',
    category: 'database',
    status: 'pass',
    message: `包含 ${chapters.length} 章大纲/正文，${characters?.c || 0} 位记录角色`
  });

  const openForeshadowings = db.prepare('SELECT title, planted_chapter FROM foreshadowings WHERE project_id = ? AND status != "已回收"').all(projectId) as any[];
  const resolvedForeshadowings = db.prepare('SELECT title FROM foreshadowings WHERE project_id = ? AND status = "已回收"').all(projectId) as any[];

  if (openForeshadowings.length > 15) {
    checks.push({
      name: '伏笔收发健康度',
      category: 'foreshadowings',
      status: 'warn',
      message: `有 ${openForeshadowings.length} 个悬挂未回收的伏笔，建议在后续章节中规划回收`
    });
  } else {
    checks.push({
      name: '伏笔收发健康度',
      category: 'foreshadowings',
      status: 'pass',
      message: `伏笔状态正常（已回收 ${resolvedForeshadowings.length} 个，待回收 ${openForeshadowings.length} 个）`
    });
  }

  const unreviewedCount = chapters.filter(c => c.status === 'draft' && (!c.review_score || c.review_score === 0)).length;
  if (unreviewedCount > 0) {
    checks.push({
      name: '章节质量审查覆盖',
      category: 'reviews',
      status: 'warn',
      message: `尚有 ${unreviewedCount} 章正文未完成多维质量审查`
    });
  } else {
    checks.push({
      name: '章节质量审查覆盖',
      category: 'reviews',
      status: 'pass',
      message: '已写的正文章节均已完成审查'
    });
  }

  try {
    const testResponse = await chatCompletion([{ role: 'user', content: 'Ping' }], { max_tokens: 5 });
    if (testResponse) {
      checks.push({
        name: 'LLM API 接口连接',
        category: 'api',
        status: 'pass',
        message: 'LLM 接口响应正常，能够进行模型推理与状态提取'
      });
    }
  } catch (err: any) {
    checks.push({
      name: 'LLM API 接口连接',
      category: 'api',
      status: 'fail',
      message: `API 连接失败: ${err?.message || err}`
    });
  }

  const passCount = checks.filter(c => c.status === 'pass').length;
  const healthScore = Math.round((passCount / checks.length) * 100);

  return {
    health_score: healthScore,
    status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
    checks: checks,
    timestamp: new Date().toISOString()
  };
}
