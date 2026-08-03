import { db } from './db.js';
import { chatCompletion } from './llm.js';

export async function queryProjectState(projectId: string, query: string) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) throw new Error('Project not found');

  const keyword = `%${query}%`;

  const matchedChars = db.prepare(`
    SELECT name, role, cultivation, status, faction, description 
    FROM characters 
    WHERE project_id = ? AND (name LIKE ? OR description LIKE ? OR cultivation LIKE ?)
  `).all(projectId, keyword, keyword, keyword) as any[];

  const matchedForeshadowings = db.prepare(`
    SELECT title, description, status, planted_chapter, resolved_chapter, impact_level
    FROM foreshadowings
    WHERE project_id = ? AND (title LIKE ? OR description LIKE ?)
  `).all(projectId, keyword, keyword) as any[];

  const matchedChapters = db.prepare(`
    SELECT chapter_num, title, outline, status, word_count, review_score
    FROM chapters
    WHERE project_id = ? AND (title LIKE ? OR outline LIKE ? OR content LIKE ?)
  `).all(projectId, keyword, keyword, keyword) as any[];

  const contextText = `
【关于角色匹配】:
${matchedChars.map(c => `- ${c.name} (${c.role}, ${c.cultivation}): ${c.description}`).join('\n') || '无匹配角色'}

【关于伏笔匹配】:
${matchedForeshadowings.map(f => `- ${f.title} (${f.status}, 埋于第${f.planted_chapter}章): ${f.description}`).join('\n') || '无匹配伏笔'}

【关于章节匹配】:
${matchedChapters.map(c => `- 第${c.chapter_num}章《${c.title}》(${c.status}, 评分:${c.review_score}): ${c.outline}`).join('\n') || '无匹配章节'}
`;

  const aiAnswerPrompt = `
用户提出了关于小说《${project.title}》的查询：
"${query}"

以下是从项目数据库和索引中召回的信息：
${contextText}

请综合上述召回事实，为作者做出精准、全面且结构清晰的解答。
`;

  const aiAnswer = await chatCompletion([{ role: 'user', content: aiAnswerPrompt }], { temperature: 0.5 });

  return {
    query: query,
    matched_characters: matchedChars,
    matched_foreshadowings: matchedForeshadowings,
    matched_chapters: matchedChapters,
    ai_answer: aiAnswer
  };
}
