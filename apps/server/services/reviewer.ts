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
????????:
${matchedChars.map(c => `- ${c.name} (${c.role}, ${c.cultivation}): ${c.description}`).join('\n') || '?????'}

????????:
${matchedForeshadowings.map(f => `- ${f.title} (${f.status}, ???${f.planted_chapter}?): ${f.description}`).join('\n') || '?????'}

????????:
${matchedChapters.map(c => `- ?${c.chapter_num}??${c.title}?(${c.status}, ??:${c.review_score}): ${c.outline}`).join('\n') || '?????'}
`;

  const aiAnswerPrompt = `
??????????${project.title}????:
"${query}"

??????????????????:
${contextText}

?????????,???????????????????
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
