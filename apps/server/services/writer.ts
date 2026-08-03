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

  let prevChapterSummary = '无前文（开篇）';
  if (chapterNum > 1) {
    const prevChap = db.prepare('SELECT title, content, outline FROM chapters WHERE project_id = ? AND chapter_num = ?').get(projectId, chapterNum - 1) as any;
    if (prevChap && prevChap.content) {
      prevChapterSummary = `上一章《${prevChap.title}》末尾剧情：\n${prevChap.content.slice(-800)}`;
    }
  }

  const characters = db.prepare('SELECT name, role, cultivation, status, description FROM characters WHERE project_id = ? AND status = "活跃"').all(projectId) as any[];
  const openForeshadowings = db.prepare('SELECT title, description, status FROM foreshadowings WHERE project_id = ? AND status != "已回收"').all(projectId) as any[];

  const draftPrompt = `
你是一位顶级网络小说白金作家。请根据以下大纲与前文上下文，创作第 ${chapterNum} 章的正文。

【作品信息】
作品名称：《${project.title}》
作品题材：${project.genre}
核心设定/金手指：${project.golden_finger || '无'}
世界观/力量体系：${project.power_system || '无'}

【前文上下文】
${prevChapterSummary}

【本章大纲】
章节名称：${chapter.title}
本章细纲：${chapter.outline || '自主发挥核心破局剧情'}
${customPrompt ? `特别要求：${customPrompt}` : ''}

【主要登场角色与现状】
${characters.map((c) => `- ${c.name} (${c.role}, ${c.cultivation}): ${c.description}`).join('\n')}

【关联伏笔】
${openForeshadowings.map((f) => `- ${f.title}: ${f.description}`).join('\n')}

【写作规范与沉浸感要求】
1. 字数要求：请写出一篇完整、生动、饱论的章节正文（字数在 2500 至 4000 字左右）。
2. 视角与节奏：画面感强，多用动作、心理描写与紧凑对话，少用生硬说明。
3. 爽点与追读：突出本章的核心冲突与情绪高潮，章尾务必留有引人入胜的断章悬念/追读钩子。
4. 人设一致：主角与配角言行要严格符合已有性格与智商逻辑。
5. 去除AI感：切忌无病呻吟与泛滥的高频AI修饰词。直接输出小说正文内容，不要输出标题，不要包含任何前言或总结！
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
  const chapFileName = `第${chapterNum.toString().padStart(3, '0')}章_${chapter.title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
  const chapFilePath = path.join(projDir, '正文', chapFileName);
  fs.writeFileSync(chapFilePath, `# ${chapter.title}\n\n${cleanContent}`, 'utf-8');

  let reviewResult = null;
  if (autoReview) {
    reviewResult = await reviewChapter(projectId, chapterNum);
    const reviewFileName = `第${chapterNum.toString().padStart(3, '0')}章_审查报告.md`;
    fs.writeFileSync(path.join(projDir, '审查报告', reviewFileName), reviewResult.report_markdown, 'utf-8');
  }

  const factExtractionPrompt = `
请分析以下小说第 ${chapterNum} 章正文，提取本章中发生的所有核心事实变动（角色状态变化、突破升阶、获得了什么宝物、新埋下的伏笔或已回收的旧伏笔）。

【第 ${chapterNum} 章正文】:
${cleanContent}

请输出 JSON 格式：
{
  "updated_characters": [
    { "name": "角色名", "new_cultivation": "新境界/能力", "status_change": "状态变化描述", "notes": "发生事件" }
  ],
  "new_foreshadowings": [
    { "title": "新伏笔标题", "description": "伏笔内容描述", "impact_level": "核心大伏笔/中等伏笔/小伏笔" }
  ],
  "resolved_foreshadowings": [
    "已回收伏笔标题"
  ],
  "summary": "本章事实一句话摘要"
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
        VALUES (?, ?, ?, ?, '待回收', ?, ?)
      `);
      for (const nForeshadowing of facts.new_foreshadowings) {
        fStmt.run(`fores_${projectId}_${Date.now()}_${Math.random()}`, projectId, nForeshadowing.title, nForeshadowing.description, chapterNum, nForeshadowing.impact_level || '中等伏笔');
      }
    }

    if (facts.resolved_foreshadowings) {
      const rStmt = db.prepare('UPDATE foreshadowings SET status = "已回收", resolved_chapter = ? WHERE project_id = ? AND title = ?');
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
