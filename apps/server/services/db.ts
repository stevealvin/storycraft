import path from 'path';
import fs from 'fs-extra';
import { CONFIG } from '../config.js';

fs.ensureDirSync(CONFIG.dataDir);
fs.ensureDirSync(CONFIG.projectsDir);

const dbJsonPath = path.join(CONFIG.dataDir, 'store.json');

export interface ApiConfigItem {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  is_active: boolean;
  created_at: string;
}

interface Schema {
  projects: any[];
  volumes: any[];
  chapters: any[];
  characters: any[];
  entity_relations: any[];
  foreshadowings: any[];
  pacing_data: any[];
  project_memory: any[];
  api_configs: ApiConfigItem[];
}

let data: Schema = {
  projects: [],
  volumes: [],
  chapters: [],
  characters: [],
  entity_relations: [],
  foreshadowings: [],
  pacing_data: [],
  project_memory: [],
  api_configs: []
};

if (fs.existsSync(dbJsonPath)) {
  try {
    const loaded = fs.readJsonSync(dbJsonPath);
    data = { ...data, ...loaded };
    if (!data.api_configs) data.api_configs = [];
  } catch {
  }
}

if (data.api_configs.length === 0) {
  data.api_configs.push({
    id: 'api_default_deepseek',
    name: 'DeepSeek Pro (Winfull Cloud)',
    baseUrl: 'https://api.winfull.cloud-ip.cc/v1',
    model: 'deepseek-v4-pro',
    apiKey: 'sk-4AsPtdjfiy4PW67Q8rDkVIpO1w1oWhFDgT0w6rTAtCHjQkiF',
    is_active: true,
    created_at: new Date().toISOString()
  });
}

function saveDB() {
  fs.writeJsonSync(dbJsonPath, data, { spaces: 2 });
}

export function getApiConfigs(): ApiConfigItem[] {
  return data.api_configs;
}

export function getActiveApiConfig(): ApiConfigItem {
  const active = data.api_configs.find(a => a.is_active);
  if (active) return active;
  if (data.api_configs.length > 0) {
    data.api_configs[0].is_active = true;
    saveDB();
    return data.api_configs[0];
  }
  const defaultApi: ApiConfigItem = {
    id: 'api_default',
    name: 'DeepSeek Pro',
    baseUrl: 'https://api.winfull.cloud-ip.cc/v1',
    model: 'deepseek-v4-pro',
    apiKey: 'sk-4AsPtdjfiy4PW67Q8rDkVIpO1w1oWhFDgT0w6rTAtCHjQkiF',
    is_active: true,
    created_at: new Date().toISOString()
  };
  data.api_configs.push(defaultApi);
  saveDB();
  return defaultApi;
}

export function addApiConfig(input: { name: string; baseUrl: string; model: string; apiKey: string }): ApiConfigItem {
  const newConfig: ApiConfigItem = {
    id: 'api_' + Date.now().toString(36),
    name: input.name,
    baseUrl: input.baseUrl,
    model: input.model,
    apiKey: input.apiKey,
    is_active: data.api_configs.length === 0,
    created_at: new Date().toISOString()
  };
  data.api_configs.push(newConfig);
  saveDB();
  return newConfig;
}

export function updateApiConfig(id: string, input: Partial<ApiConfigItem>): ApiConfigItem | null {
  const item = data.api_configs.find(a => a.id === id);
  if (!item) return null;
  if (input.name) item.name = input.name;
  if (input.baseUrl) item.baseUrl = input.baseUrl;
  if (input.model) item.model = input.model;
  if (input.apiKey) item.apiKey = input.apiKey;
  saveDB();
  return item;
}

export function deleteApiConfig(id: string): boolean {
  if (data.api_configs.length <= 1) return false;
  const wasActive = data.api_configs.find(a => a.id === id)?.is_active;
  data.api_configs = data.api_configs.filter(a => a.id !== id);
  if (wasActive && data.api_configs.length > 0) {
    data.api_configs[0].is_active = true;
  }
  saveDB();
  return true;
}

export function setActiveApiConfig(id: string): ApiConfigItem | null {
  const target = data.api_configs.find(a => a.id === id);
  if (!target) return null;
  data.api_configs.forEach(a => a.is_active = (a.id === id));
  saveDB();
  return target;
}

export const db = {
  exec(sql: string) { saveDB(); },
  prepare(sql: string) {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    return {
      all(...params: any[]): any[] {
        if (cleanSql.includes('FROM projects')) {
          if (cleanSql.includes('WHERE id = ?')) return data.projects.filter(p => p.id === params[0]);
          return [...data.projects];
        }
        if (cleanSql.includes('FROM chapters')) {
          if (cleanSql.includes('WHERE project_id = ? AND chapter_num = ?')) {
            return data.chapters.filter(c => c.project_id === params[0] && c.chapter_num === Number(params[1]));
          }
          if (cleanSql.includes('WHERE project_id = ?')) {
            const res = data.chapters.filter(c => c.project_id === params[0]);
            if (cleanSql.includes('ORDER BY chapter_num ASC')) res.sort((a, b) => a.chapter_num - b.chapter_num);
            return res;
          }
        }
        if (cleanSql.includes('FROM characters')) {
          if (cleanSql.includes('WHERE project_id = ? AND status = "活跃"')) return data.characters.filter(c => c.project_id === params[0] && c.status === '活跃');
          if (cleanSql.includes('WHERE project_id = ? AND (name LIKE ?')) {
            const kw = String(params[1] || '').replace(/%/g, '').toLowerCase();
            return data.characters.filter(c => c.project_id === params[0] && (c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw) || c.cultivation.toLowerCase().includes(kw)));
          }
          if (cleanSql.includes('WHERE project_id = ?')) return data.characters.filter(c => c.project_id === params[0]);
        }
        if (cleanSql.includes('FROM foreshadowings')) {
          if (cleanSql.includes('WHERE project_id = ? AND status != "已回收"')) return data.foreshadowings.filter(f => f.project_id === params[0] && f.status !== '已回收');
          if (cleanSql.includes('WHERE project_id = ? AND (title LIKE ?')) {
            const kw = String(params[1] || '').replace(/%/g, '').toLowerCase();
            return data.foreshadowings.filter(f => f.project_id === params[0] && (f.title.toLowerCase().includes(kw) || f.description.toLowerCase().includes(kw)));
          }
          if (cleanSql.includes('WHERE project_id = ?')) return data.foreshadowings.filter(f => f.project_id === params[0]);
        }
        if (cleanSql.includes('FROM entity_relations')) return data.entity_relations.filter(r => r.project_id === params[0]);
        if (cleanSql.includes('FROM pacing_data')) return data.pacing_data.filter(p => p.project_id === params[0]);
        return [];
      },

      get(...params: any[]): any {
        if (cleanSql.includes('SELECT COUNT(*) as c FROM projects')) return { c: data.projects.length };
        if (cleanSql.includes('SELECT * FROM projects WHERE id = ?')) return data.projects.find(p => p.id === params[0]) || null;
        if (cleanSql.includes('SELECT * FROM volumes WHERE project_id = ? AND volume_num = ?')) return data.volumes.find(v => v.project_id === params[0] && v.volume_num === Number(params[1])) || null;
        if (cleanSql.includes('SELECT * FROM chapters WHERE project_id = ? AND chapter_num = ?')) return data.chapters.find(c => c.project_id === params[0] && c.chapter_num === Number(params[1])) || null;
        if (cleanSql.includes('SELECT * FROM characters WHERE id = ?')) return data.characters.find(c => c.id === params[0]) || null;
        if (cleanSql.includes('SELECT * FROM foreshadowings WHERE id = ?')) return data.foreshadowings.find(f => f.id === params[0]) || null;
        if (cleanSql.includes('SELECT COUNT(*) as count FROM characters')) return { count: data.characters.filter(c => c.project_id === params[0]).length };
        if (cleanSql.includes('SELECT COUNT(*) as count FROM chapters') || cleanSql.includes('SELECT COUNT(*) as c FROM chapters')) return { count: data.chapters.filter(c => c.project_id === params[0]).length, c: data.chapters.filter(c => c.project_id === params[0]).length };
        if (cleanSql.includes('SELECT COUNT(*) as count FROM volumes')) return { count: data.volumes.filter(v => v.project_id === params[0]).length };
        if (cleanSql.includes('SELECT COUNT(*) as count FROM foreshadowings')) return { count: data.foreshadowings.filter(f => f.project_id === params[0] && f.status !== '已回收').length };
        if (cleanSql.includes('SELECT SUM(word_count) as total FROM chapters')) {
          const sum = data.chapters.filter(c => c.project_id === params[0]).reduce((acc, curr) => acc + (curr.word_count || 0), 0);
          return { total: sum };
        }
        const res = this.all(...params);
        return res[0] || null;
      },

      run(...params: any[]) {
        if (cleanSql.includes('INSERT INTO projects')) {
          data.projects.push({
            id: params[0], title: params[1], genre: params[2], target_words: params[3], total_words: 0, current_volume: 1,
            premise: params[4], golden_finger: params[5], power_system: params[6], world_setting: params[7], master_outline: params[8],
            status: 'active', created_at: params[9], updated_at: params[10]
          });
        } else if (cleanSql.includes('UPDATE projects SET total_words')) {
          const proj = data.projects.find(p => p.id === params[1]);
          if (proj) { proj.total_words = params[0]; proj.updated_at = new Date().toISOString(); }
        } else if (cleanSql.includes('DELETE FROM projects')) {
          data.projects = data.projects.filter(p => p.id !== params[0]);
          data.chapters = data.chapters.filter(c => c.project_id !== params[0]);
          data.characters = data.characters.filter(c => c.project_id !== params[0]);
          data.foreshadowings = data.foreshadowings.filter(f => f.project_id !== params[0]);
        } else if (cleanSql.includes('INSERT INTO volumes') || cleanSql.includes('INSERT OR REPLACE INTO volumes')) {
          const idx = data.volumes.findIndex(v => v.id === params[0]);
          const volObj = { id: params[0], project_id: params[1], volume_num: params[2], title: params[3], summary: params[4], status: params[5] || 'planned' };
          if (idx >= 0) data.volumes[idx] = volObj; else data.volumes.push(volObj);
        } else if (cleanSql.includes('INSERT OR REPLACE INTO chapters') || cleanSql.includes('INSERT INTO chapters')) {
          const idx = data.chapters.findIndex(c => c.id === params[0]);
          const chapObj = {
            id: params[0], project_id: params[1], volume_num: params[2], chapter_num: params[3], title: params[4], outline: params[5],
            content: params[6] || '', word_count: params[7] || 0, status: params[8] || 'planned', review_score: params[9] || 0,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          };
          if (idx >= 0) data.chapters[idx] = { ...data.chapters[idx], ...chapObj }; else data.chapters.push(chapObj);
        } else if (cleanSql.includes('UPDATE chapters SET review_score')) {
          const chap = data.chapters.find(c => c.project_id === params[2] && c.chapter_num === Number(params[3]));
          if (chap) { chap.review_score = params[0]; chap.review_report = params[1]; chap.updated_at = new Date().toISOString(); }
        } else if (cleanSql.includes('UPDATE chapters SET content')) {
          const chap = data.chapters.find(c => c.project_id === params[2] && c.chapter_num === Number(params[3]));
          if (chap) { chap.content = params[0]; chap.word_count = params[1]; chap.status = 'draft'; chap.updated_at = new Date().toISOString(); }
        } else if (cleanSql.includes('UPDATE chapters SET commit_hash')) {
          const chap = data.chapters.find(c => c.project_id === params[1] && c.chapter_num === Number(params[2]));
          if (chap) chap.commit_hash = params[0];
        } else if (cleanSql.includes('UPDATE chapters SET title = COALESCE')) {
          const chap = data.chapters.find(c => c.project_id === params[4] && c.chapter_num === Number(params[5]));
          if (chap) {
            if (params[0] !== undefined && params[0] !== null) chap.title = params[0];
            if (params[1] !== undefined && params[1] !== null) chap.outline = params[1];
            if (params[2] !== undefined && params[2] !== null) chap.content = params[2];
            if (params[3] !== undefined && params[3] !== null) chap.word_count = params[3];
            chap.updated_at = new Date().toISOString();
          }
        } else if (cleanSql.includes('INSERT INTO characters')) {
          data.characters.push({
            id: params[0], project_id: params[1], name: params[2], role: params[3], status: params[4], cultivation: params[5],
            faction: params[6], description: params[7], relationship_notes: params[8] || ''
          });
        } else if (cleanSql.includes('UPDATE characters SET cultivation')) {
          const char = data.characters.find(c => c.project_id === params[1] && c.name === params[2]);
          if (char) char.cultivation = params[0];
        } else if (cleanSql.includes('UPDATE characters SET name = COALESCE')) {
          const char = data.characters.find(c => c.id === params[7]);
          if (char) {
            if (params[0]) char.name = params[0]; if (params[1]) char.role = params[1]; if (params[2]) char.status = params[2];
            if (params[3]) char.cultivation = params[3]; if (params[4]) char.faction = params[4]; if (params[5]) char.description = params[5]; if (params[6]) char.relationship_notes = params[6];
          }
        } else if (cleanSql.includes('DELETE FROM characters')) {
          data.characters = data.characters.filter(c => c.id !== params[0]);
        } else if (cleanSql.includes('INSERT INTO foreshadowings')) {
          data.foreshadowings.push({
            id: params[0], project_id: params[1], title: params[2], description: params[3], status: params[4] || '待回收',
            planted_chapter: params[5], target_chapter: params[6] || null, impact_level: params[7] || '中等伏笔'
          });
        } else if (cleanSql.includes('UPDATE foreshadowings SET status = "已回收"')) {
          const f = data.foreshadowings.find(x => x.project_id === params[1] && x.title === params[2]);
          if (f) { f.status = '已回收'; f.resolved_chapter = params[0]; }
        } else if (cleanSql.includes('UPDATE foreshadowings SET title = COALESCE')) {
          const f = data.foreshadowings.find(x => x.id === params[6]);
          if (f) {
            if (params[0]) f.title = params[0]; if (params[1]) f.description = params[1]; if (params[2]) f.status = params[2];
            if (params[3]) f.planted_chapter = params[3]; if (params[4]) f.resolved_chapter = params[4]; if (params[5]) f.impact_level = params[5];
          }
        } else if (cleanSql.includes('INSERT OR REPLACE INTO pacing_data')) {
          const idx = data.pacing_data.findIndex(p => p.id === params[0]);
          const pObj = { id: params[0], project_id: params[1], chapter_num: params[2], tension_score: params[3], cool_point_density: params[4], retention_score: params[5], notes: params[6] };
          if (idx >= 0) data.pacing_data[idx] = pObj; else data.pacing_data.push(pObj);
        } else if (cleanSql.includes('INSERT INTO entity_relations')) {
          data.entity_relations.push({ id: params[0], project_id: params[1], source_character: params[2], target_character: params[3], relation_type: params[4], description: params[5] });
        }

        saveDB();
        return { changes: 1 };
      }
    };
  }
};
