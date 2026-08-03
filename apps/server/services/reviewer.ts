import { chatCompletionJson } from './llm.js';
import { db } from './db.js';

export interface ReviewResult {
  score: number;
  cool_points_score: number;
  consistency_score: number;
  pacing_score: number;
  retention_score: number;
  blocking_issues: string[];
  warnings: string[];
  suggestions: string[];
  report_markdown: string;
}

export async function reviewChapter(projectId: string, chapterNum: number): Promise<ReviewResult> {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) throw new Error('Project not found');

  const chapter = db.prepare('SELECT * FROM chapters WHERE project_id = ? AND chapter_num = ?').get(projectId, chapterNum) as any;
  if (!chapter || !chapter.content) throw new Error(`Chapter ${chapterNum} not found or content is empty`);

  const characters = db.prepare('SELECT name, role, cultivation, status, description FROM characters WHERE project_id = ?').all(projectId) as any[];
  const foreshadowings = db.prepare('SELECT title, description, status FROM foreshadowings WHERE project_id = ? AND status != "已回收"').all(projectId) as any[];

  const prompt = `
你是一位极其严苛的网文白金资深主编与质检审查员。请对网文《${project.title}》（题材：${project.genre}）的第 ${chapterNum} 章（${chapter.title}）进行多维质量审查。

【本章正文】:
${chapter.content}

【项目设定与角色集】:
${JSON.stringify(characters, null, 2)}

【当前未回收的伏笔】:
${JSON.stringify(foreshadowings, null, 2)}

【本章大纲预设】:
${chapter.outline}

请从以下五个维度进行全方位深度审查：
1. **爽点与看点 (Cool Points & Payoffs)**：是否有情绪释放、装逼打脸、破局逆袭或惊艳反转？
2. **设定与一致性 (Consistency & No-OOC)**：角色言行是否符合人设？战力/境界是否乱崩？世界规则是否冲突？
3. **节奏与张力 (Pacing & Tension)**：文字是否拖沓？场景过渡是否流畅？起伏张力如何？
4. **章尾留存钩子 (Reader Retention)**：章尾是否有强悬念、期待感或勾人追读的断章点？
5. **AI感防范 (Anti-AI Writing)**：语言是否充斥AI高频词（如“眼神中闪过一抹”、“宛如”、“不得不说”等），是否生硬说明？

请输出 JSON 格式：
{
  "score": 85,
  "cool_points_score": 88,
  "consistency_score": 90,
  "pacing_score": 82,
  "retention_score": 85,
  "blocking_issues": ["严重阻断问题列表，无则为空数组"],
  "warnings": ["次要警告/需注意细节"],
  "suggestions": ["修稿改进建议"],
  "report_markdown": "# 第${chapterNum}章 质量审查报告\\n\\n### 综合评分：85/100\\n...（详细 Markdown 审查报告）"
}
`;

  const review = await chatCompletionJson<ReviewResult>(
    [{ role: 'user', content: prompt }],
    { temperature: 0.4 }
  );

  db.prepare(`
    UPDATE chapters 
    SET review_score = ?, review_report = ?, updated_at = CURRENT_TIMESTAMP
    WHERE project_id = ? AND chapter_num = ?
  `).run(review.score, JSON.stringify(review), projectId, chapterNum);

  db.prepare(`
    INSERT OR REPLACE INTO pacing_data (id, project_id, chapter_num, tension_score, cool_point_density, retention_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `pacing_${projectId}_${chapterNum}`,
    projectId,
    chapterNum,
    Math.round(review.pacing_score / 10),
    Math.round(review.cool_points_score / 10),
    Math.round(review.retention_score / 10),
    review.suggestions.slice(0, 2).join('; ')
  );

  return review;
}
