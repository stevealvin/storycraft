import { Hono } from 'hono';
import { db, getApiConfigs, getActiveApiConfig, addApiConfig, updateApiConfig, deleteApiConfig, setActiveApiConfig } from '../services/db.js';
import { createProject, listProjects, getProjectById, deleteProject } from '../services/project.js';
import { generatePremise, generateCharacters, generateWorldbuilding, generateMasterOutline, planVolumeChapters } from '../services/planner.js';
import { writeChapterPipeline } from '../services/writer.js';
import { reviewChapter } from '../services/reviewer.js';
import { runDoctor } from '../services/doctor.js';
import { queryProjectState } from '../services/rag.js';
import { chatCompletion } from '../services/llm.js';

export const apiRouter = new Hono();

// Active API Config
apiRouter.get('/config', (c) => {
  return c.json(getActiveApiConfig());
});

// Multi-API Provider Management Endpoints
apiRouter.get('/config/providers', (c) => {
  return c.json({
    active_id: getActiveApiConfig().id,
    providers: getApiConfigs()
  });
});

apiRouter.post('/config/providers', async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.baseUrl || !body.model || !body.apiKey) {
    return c.json({ error: 'Missing required API fields' }, 400);
  }
  const newProvider = addApiConfig(body);
  return c.json(newProvider);
});

apiRouter.put('/config/providers/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const updated = updateApiConfig(id, body);
  if (!updated) return c.json({ error: 'Provider not found' }, 404);
  return c.json(updated);
});

apiRouter.delete('/config/providers/:id', (c) => {
  const id = c.req.param('id');
  const success = deleteApiConfig(id);
  if (!success) return c.json({ error: 'Cannot delete active or last remaining provider' }, 400);
  return c.json({ success: true });
});

apiRouter.post('/config/providers/:id/activate', (c) => {
  const id = c.req.param('id');
  const activated = setActiveApiConfig(id);
  if (!activated) return c.json({ error: 'Provider not found' }, 404);
  return c.json({ success: true, active: activated });
});

apiRouter.post('/config/test', async (c) => {
  try {
    const body = await c.req.json();
    const testResult = await chatCompletion([{ role: 'user', content: '?? API ??' }], {
      baseUrl: body.baseUrl,
      model: body.model,
      apiKey: body.apiKey,
      max_tokens: 10
    });
    return c.json({ success: true, response: testResult });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message || String(err) }, 500);
  }
});

// Genre List & Presets
apiRouter.get('/genres', (c) => {
  const genres = [
    { name: '??', description: '???? + ???? + ???? + ????' },
    { name: '???', description: '???? + ???? + ???? + ????' },
    { name: '????', description: '???? + ???? + ???? + ????' },
    { name: '????', description: '???? + ???? + ???? + ????' },
    { name: '??', description: '???? + AI?? + ???? + ????' },
    { name: '????', description: '???? + ???? + ???? + ????' },
    { name: '??', description: '???? + ???? + ???? + ????' },
    { name: '???', description: '???? + ???? + ???? + ????' },
    { name: '????', description: '???? + ???? + ???? + ????' },
    { name: '???', description: '???? + ???? + ???? + ????' },
    { name: '??', description: '???? + ???? + ???? + ????' },
    { name: '??', description: '???? + ???? + ???? + ????' },
    { name: '????', description: '???? + ?????? + ?????' },
    { name: '??', description: '???? + ????? + ???? + ????' },
    { name: '????', description: '???? + ???? + ???? + ????' }
  ];
  return c.json(genres);
});

// Projects CRUD
apiRouter.get('/projects', (c) => {
  const projects = listProjects();
  return c.json(projects);
});

apiRouter.post('/projects', async (c) => {
  const body = await c.req.json();
  const project = createProject(body);
  return c.json(project);
});

apiRouter.get('/projects/:id', (c) => {
  const id = c.req.param('id');
  const project = getProjectById(id);
  if (!project) return c.json({ error: 'Project not found' }, 404);
  return c.json(project);
});

apiRouter.delete('/projects/:id', (c) => {
  const id = c.req.param('id');
  deleteProject(id);
  return c.json({ success: true });
});

// Init Wizard LLM endpoints
apiRouter.post('/projects/:id/wizard/premise', async (c) => {
  const body = await c.req.json();
  const res = await generatePremise(body);
  return c.json(res);
});

apiRouter.post('/projects/:id/wizard/characters', async (c) => {
  const body = await c.req.json();
  const res = await generateCharacters(body);
  return c.json(res);
});

apiRouter.post('/projects/:id/wizard/world', async (c) => {
  const body = await c.req.json();
  const res = await generateWorldbuilding(body);
  return c.json(res);
});

apiRouter.post('/projects/:id/wizard/master-outline', async (c) => {
  const body = await c.req.json();
  const res = await generateMasterOutline(body);
  return c.json(res);
});

// Volumes & Chapters Planning
apiRouter.post('/projects/:id/volumes/plan', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const chapters = await planVolumeChapters(id, body.volume_num || 1, body.chapter_count || 10);
  return c.json(chapters);
});

// Chapters
apiRouter.get('/projects/:id/chapters', (c) => {
  const id = c.req.param('id');
  const chapters = db.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_num ASC').all(id);
  return c.json(chapters);
});

apiRouter.get('/projects/:id/chapters/:chapNum', (c) => {
  const id = c.req.param('id');
  const chapNum = parseInt(c.req.param('chapNum'), 10);
  const chapter = db.prepare('SELECT * FROM chapters WHERE project_id = ? AND chapter_num = ?').get(id, chapNum);
  if (!chapter) return c.json({ error: 'Chapter not found' }, 404);
  return c.json(chapter);
});

apiRouter.put('/projects/:id/chapters/:chapNum', async (c) => {
  const id = c.req.param('id');
  const chapNum = parseInt(c.req.param('chapNum'), 10);
  const body = await c.req.json();

  db.prepare(`
    UPDATE chapters 
    SET title = COALESCE(?, title), outline = COALESCE(?, outline), content = COALESCE(?, content), word_count = COALESCE(?, word_count), updated_at = CURRENT_TIMESTAMP
    WHERE project_id = ? AND chapter_num = ?
  `).run(body.title, body.outline, body.content, body.content ? body.content.length : undefined, id, chapNum);

  const totalWords = db.prepare('SELECT SUM(word_count) as total FROM chapters WHERE project_id = ?').get(id) as any;
  db.prepare('UPDATE projects SET total_words = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(totalWords?.total || 0, id);

  const updated = db.prepare('SELECT * FROM chapters WHERE project_id = ? AND chapter_num = ?').get(id, chapNum);
  return c.json(updated);
});

apiRouter.post('/projects/:id/chapters/:chapNum/write', async (c) => {
  const id = c.req.param('id');
  const chapNum = parseInt(c.req.param('chapNum'), 10);
  const body = await c.req.json().catch(() => ({}));

  try {
    const result = await writeChapterPipeline({
      projectId: id,
      chapterNum: chapNum,
      customPrompt: body.customPrompt,
      autoReview: body.autoReview ?? true
    });
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err?.message || String(err) }, 500);
  }
});

apiRouter.post('/projects/:id/chapters/:chapNum/review', async (c) => {
  const id = c.req.param('id');
  const chapNum = parseInt(c.req.param('chapNum'), 10);

  try {
    const review = await reviewChapter(id, chapNum);
    return c.json(review);
  } catch (err: any) {
    return c.json({ error: err?.message || String(err) }, 500);
  }
});

// Characters
apiRouter.get('/projects/:id/characters', (c) => {
  const id = c.req.param('id');
  const characters = db.prepare('SELECT * FROM characters WHERE project_id = ? ORDER BY role DESC, created_at ASC').all(id);
  return c.json(characters);
});

apiRouter.post('/projects/:id/characters', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const charId = 'char_' + Date.now().toString(36);

  db.prepare(`
    INSERT INTO characters (id, project_id, name, role, status, cultivation, faction, description, relationship_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(charId, id, body.name, body.role || '??', body.status || '??', body.cultivation || '??', body.faction || '??', body.description || '', body.relationship_notes || '');

  return c.json(db.prepare('SELECT * FROM characters WHERE id = ?').get(charId));
});

apiRouter.put('/projects/:id/characters/:charId', async (c) => {
  const charId = c.req.param('charId');
  const body = await c.req.json();

  db.prepare(`
    UPDATE characters
    SET name = COALESCE(?, name), role = COALESCE(?, role), status = COALESCE(?, status),
        cultivation = COALESCE(?, cultivation), faction = COALESCE(?, faction),
        description = COALESCE(?, description), relationship_notes = COALESCE(?, relationship_notes)
    WHERE id = ?
  `).run(body.name, body.role, body.status, body.cultivation, body.faction, body.description, body.relationship_notes, charId);

  return c.json(db.prepare('SELECT * FROM characters WHERE id = ?').get(charId));
});

apiRouter.delete('/projects/:id/characters/:charId', (c) => {
  const charId = c.req.param('charId');
  db.prepare('DELETE FROM characters WHERE id = ?').run(charId);
  return c.json({ success: true });
});

// Entity Relations
apiRouter.get('/projects/:id/relations', (c) => {
  const id = c.req.param('id');
  const relations = db.prepare('SELECT * FROM entity_relations WHERE project_id = ?').all(id);
  return c.json(relations);
});

apiRouter.post('/projects/:id/relations', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const relId = 'rel_' + Date.now().toString(36);

  db.prepare(`
    INSERT INTO entity_relations (id, project_id, source_character, target_character, relation_type, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(relId, id, body.source_character, body.target_character, body.relation_type, body.description || '');

  return c.json(db.prepare('SELECT * FROM entity_relations WHERE id = ?').get(relId));
});

// Foreshadowings
apiRouter.get('/projects/:id/foreshadowings', (c) => {
  const id = c.req.param('id');
  const foreshadowings = db.prepare('SELECT * FROM foreshadowings WHERE project_id = ? ORDER BY planted_chapter ASC').all(id);
  return c.json(foreshadowings);
});

apiRouter.post('/projects/:id/foreshadowings', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const fId = 'fores_' + Date.now().toString(36);

  db.prepare(`
    INSERT INTO foreshadowings (id, project_id, title, description, status, planted_chapter, target_chapter, impact_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(fId, id, body.title, body.description || '', body.status || '???', body.planted_chapter || 1, body.target_chapter || null, body.impact_level || '????');

  return c.json(db.prepare('SELECT * FROM foreshadowings WHERE id = ?').get(fId));
});

apiRouter.put('/projects/:id/foreshadowings/:fId', async (c) => {
  const fId = c.req.param('fId');
  const body = await c.req.json();

  db.prepare(`
    UPDATE foreshadowings
    SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status),
        planted_chapter = COALESCE(?, planted_chapter), resolved_chapter = COALESCE(?, resolved_chapter), impact_level = COALESCE(?, impact_level)
    WHERE id = ?
  `).run(body.title, body.description, body.status, body.planted_chapter, body.resolved_chapter, body.impact_level, fId);

  return c.json(db.prepare('SELECT * FROM foreshadowings WHERE id = ?').get(fId));
});

// Pacing Data
apiRouter.get('/projects/:id/pacing', (c) => {
  const id = c.req.param('id');
  const pacing = db.prepare('SELECT * FROM pacing_data WHERE project_id = ? ORDER BY chapter_num ASC').all(id);
  return c.json(pacing);
});

// Doctor
apiRouter.post('/projects/:id/doctor', async (c) => {
  const id = c.req.param('id');
  try {
    const report = await runDoctor(id);
    return c.json(report);
  } catch (err: any) {
    return c.json({ error: err?.message || String(err) }, 500);
  }
});

// Query RAG
apiRouter.post('/projects/:id/query', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  try {
    const res = await queryProjectState(id, body.query || '');
    return c.json(res);
  } catch (err: any) {
    return c.json({ error: err?.message || String(err) }, 500);
  }
});
