import path from 'path';
import fs from 'fs-extra';
import { chatCompletion, chatCompletionJson } from './llm.js';
import { db } from './db.js';
import { reviewChapter } from './reviewer.js';
import { getProjectDir } from './project.js';

export interface WriteChapterOptions {
  projectId: string;
  chapterNum: number;
  customPrompt?: string;
  autoReview?: boolean;
}

export async function writeChapterPipeline(options: WriteChapterOptions) {
  const { projectId, chapterNum, customPrompt, autoReview = true } = options;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) throw new Error('Project not found');

  const chapter = db.prepare('SELECT * FROM chapters WHERE project_id = ? AND chapter_num = ?').get(projectId, chapterNum) as any;
  if (!chapter) throw new Error(`Chapter ${chapterNum} not found in outline`);

  let prevChapterSummary = '???(??)';
  if (chapterNum > 1) {
    const prevChap = db.prepare('SELECT title, content, outline FROM chapters WHERE project_id = ? AND chapter_num = ?').get(projectId, chapterNum - 1) as any;
    if (prevChap && prevChap.content) {
      prevChapterSummary = `????${prevChap.title}?????:\n${prevChap.content.slice(-800)}`;
    }
  }

  const characters = db.prepare('SELECT name, role, cultivation, status, description FROM characters WHERE project_id = ? AND status = "??"').all(projectId) as any[];
  const openForeshadowings = db.prepare('SELECT title, description, status FROM foreshadowings WHERE project_id = ? AND status != "???"').all(projectId) as any[];

  const draftPrompt = `
????????????????????????????,??? ${chapterNum} ?????

??????
????:?${project.title}?
????:${project.genre}
????/???:${project.golden_finger || '?'}
???/????:${project.power_system || '?'}

???????
${prevChapterSummary}

??????
????:${chapter.title}
????:${chapter.outline || '??????????'}
${customPrompt ? `????:${customPrompt}` : ''}

???????????
${characters.map((c) => `- ${c.name} (${c.role}, ${c.cultivation}): ${c.description}`).join('\n')}

??????
${openForeshadowings.map((f) => `- ${f.title}: ${f.description}`).join('\n')}

????????????
1. ????:??????????????????(??? 2500 ? 4000 ???)?
2. ?????:????,??????????????,???????
3. ?????:??????????????,???????????????/?????
4. ????:??????????????????????
5. ??AI?:????????????AI??????????????,??????,???????????!
`;

  const draftText = await chatCompletion([
    { role: 'user', content: draftPrompt }
  ], { temperature: 0.8, max_tokens: 4500 });

  const cleanContent = draftText.trim();
  const wordCount = cleanContent.length;

  db.prepare(`
    UPDATE chapters 
    SET content = ?, word_count = ?, status = 'draft', updated_at = CURRENT_TIMESTAMP
    WHERE project_id = ? AND chapter_num = ?
  `).run(cleanContent, wordCount, projectId, chapterNum);

  const totalWordsResult = db.prepare('SELECT SUM(word_count) as total FROM chapters WHERE project_id = ?').get(projectId) as any;
  db.prepare('UPDATE projects SET total_words = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(totalWordsResult?.total || wordCount, projectId);

  const projDir = getProjectDir(projectId);
  const chapFileName = `?${chapterNum.toString().padStart(3, '0')}?_${chapter.title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
  const chapFilePath = path.join(projDir, '??', chapFileName);
  fs.writeFileSync(chapFilePath, `# ${chapter.title}\n\n${cleanContent}`, 'utf-8');

  let reviewResult = null;
  if (autoReview) {
    reviewResult = await reviewChapter(projectId, chapterNum);
    const reviewFileName = `?${chapterNum.toString().padStart(3, '0')}?_????.md`;
    fs.writeFileSync(path.join(projDir, '????', reviewFileName), reviewResult.report_markdown, 'utf-8');
  }

  const factExtractionPrompt = `
???????? ${chapterNum} ???,????????????????(??????????????????????????????????)?

?? ${chapterNum} ????:
${cleanContent}

??? JSON ??:
{
  "updated_characters": [
    { "name": "???", "new_cultivation": "???/??", "status_change": "??????", "notes": "????" }
  ],
  "new_foreshadowings": [
    { "title": "?????", "description": "??????", "impact_level": "?????/????/???" }
  ],
  "resolved_foreshadowings": [
    "???????"
  ],
  "summary": "?????????"
}
`;

  try {
    const facts = await chatCompletionJson<any>([{ role: 'user', content: factExtractionPrompt }], { temperature: 0.3 });

    if (facts.updated_characters) {
      for (const uChar of facts.updated_characters) {
        if (uChar.new_cultivation) {
          db.prepare('UPDATE characters SET cultivation = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND name = ?')
            .run(uChar.new_cultivation, projectId, uChar.name);
        }
      }
    }

    if (facts.new_foreshadowings) {
      const fStmt = db.prepare(`
        INSERT INTO foreshadowings (id, project_id, title, description, status, planted_chapter, impact_level)
        VALUES (?, ?, ?, ?, '???', ?, ?)
      `);
      for (const nForeshadowing of facts.new_foreshadowings) {
        fStmt.run(`fores_${projectId}_${Date.now()}_${Math.random()}`, projectId, nForeshadowing.title, nForeshadowing.description, chapterNum, nForeshadowing.impact_level || '????');
      }
    }

    if (facts.resolved_foreshadowings) {
      const rStmt = db.prepare('UPDATE foreshadowings SET status = "???", resolved_chapter = ? WHERE project_id = ? AND title = ?');
      for (const rTitle of facts.resolved_foreshadowings) {
        rStmt.run(chapterNum, projectId, rTitle);
      }
    }

    const commitHash = 'commit_' + Date.now().toString(36);
    const commitData = {
      commit_hash: commitHash,
      chapter_num: chapterNum,
      title: chapter.title,
      word_count: wordCount,
      timestamp: new Date().toISOString(),
      facts: facts
    };
    fs.writeJsonSync(path.join(projDir, '.story-system', 'commits', `${commitHash}.json`), commitData, { spaces: 2 });
    db.prepare('UPDATE chapters SET commit_hash = ? WHERE project_id = ? AND chapter_num = ?').run(commitHash, projectId, chapterNum);

  } catch (err) {
    console.error('Fact extraction failed non-fatally:', err);
  }

  return {
    chapter_num: chapterNum,
    title: chapter.title,
    word_count: wordCount,
    content: cleanContent,
    review: reviewResult
  };
}
