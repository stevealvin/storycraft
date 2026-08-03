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

  const requiredDirs = ['??', '??', '???', '????', '.story-system/commits', '.webnovel/backups'];
  let missingDirsCount = 0;
  for (const d of requiredDirs) {
    const fullPath = path.join(projDir, d);
    if (!fs.existsSync(fullPath)) {
      missingDirsCount++;
      fs.ensureDirSync(fullPath);
    }
  }

  if (missingDirsCount === 0) {
    checks.push({ name: '?????', category: 'directory', status: 'pass', message: '???????????????' });
  } else {
    checks.push({ name: '?????', category: 'directory', status: 'warn', message: `??? ${missingDirsCount} ???????` });
  }

  const chapters = db.prepare('SELECT chapter_num, status, word_count, review_score FROM chapters WHERE project_id = ?').all(projectId) as any[];
  const characters = db.prepare('SELECT count(*) as c FROM characters WHERE project_id = ?').get(projectId) as any;

  checks.push({
    name: '???????',
    category: 'database',
    status: 'pass',
    message: `?? ${chapters.length} ???/??,${characters?.c || 0} ?????`
  });

  const openForeshadowings = db.prepare('SELECT title, planted_chapter FROM foreshadowings WHERE project_id = ? AND status != "???"').all(projectId) as any[];
  const resolvedForeshadowings = db.prepare('SELECT title FROM foreshadowings WHERE project_id = ? AND status = "???"').all(projectId) as any[];

  if (openForeshadowings.length > 15) {
    checks.push({
      name: '???????',
      category: 'foreshadowings',
      status: 'warn',
      message: `? ${openForeshadowings.length} ?????????,????????????`
    });
  } else {
    checks.push({
      name: '???????',
      category: 'foreshadowings',
      status: 'pass',
      message: `??????(??? ${resolvedForeshadowings.length} ?,??? ${openForeshadowings.length} ?)`
    });
  }

  const unreviewedCount = chapters.filter(c => c.status === 'draft' && (!c.review_score || c.review_score === 0)).length;
  if (unreviewedCount > 0) {
    checks.push({
      name: '????????',
      category: 'reviews',
      status: 'warn',
      message: `?? ${unreviewedCount} ????????????`
    });
  } else {
    checks.push({
      name: '????????',
      category: 'reviews',
      status: 'pass',
      message: '?????????????'
    });
  }

  try {
    const testResponse = await chatCompletion([{ role: 'user', content: 'Ping' }], { max_tokens: 5 });
    if (testResponse) {
      checks.push({
        name: 'LLM API ????',
        category: 'api',
        status: 'pass',
        message: 'LLM ??????,?????????????'
      });
    }
  } catch (err: any) {
    checks.push({
      name: 'LLM API ????',
      category: 'api',
      status: 'fail',
      message: `API ????: ${err?.message || err}`
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
