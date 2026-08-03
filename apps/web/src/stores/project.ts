import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Project {
  id: string;
  title: string;
  genre: string;
  target_words: number;
  total_words: number;
  current_volume: number;
  premise: string;
  golden_finger: string;
  power_system: string;
  world_setting: string;
  master_outline: string;
  status: string;
  created_at: string;
  updated_at: string;
  characters_count?: number;
  chapters_count?: number;
  volumes_count?: number;
  open_foreshadowings_count?: number;
}

export interface ApiProvider {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  is_active: boolean;
  created_at: string;
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const currentProjectId = ref<string | null>(null);
  const loading = ref(false);
  const doctorStatus = ref<{ health_score: number; status: string; checks: any[] } | null>(null);

  // Multi-API State
  const apiProviders = ref<ApiProvider[]>([]);
  const activeApiId = ref<string | null>(null);

  const currentProject = computed(() => {
    return projects.value.find((p) => p.id === currentProjectId.value) || projects.value[0] || null;
  });

  const activeApiConfig = computed(() => {
    return apiProviders.value.find(a => a.id === activeApiId.value) || apiProviders.value[0] || null;
  });

  async function fetchProjects() {
    loading.value = true;
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      projects.value = data;
      if (!currentProjectId.value && data.length > 0) {
        currentProjectId.value = data[0].id;
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchApiProviders() {
    try {
      const res = await fetch('/api/config/providers');
      const data = await res.json();
      apiProviders.value = data.providers || [];
      activeApiId.value = data.active_id || null;
    } catch (err) {
      console.error('Failed to fetch API providers:', err);
    }
  }

  async function switchActiveApi(id: string) {
    try {
      const res = await fetch(`/api/config/providers/${id}/activate`, { method: 'POST' });
      if (res.ok) {
        activeApiId.value = id;
        await fetchApiProviders();
      }
    } catch (err) {
      console.error('Failed to activate API provider:', err);
    }
  }

  async function addApiProvider(input: { name: string; baseUrl: string; model: string; apiKey: string }) {
    const res = await fetch('/api/config/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const newApi = await res.json();
    await fetchApiProviders();
    return newApi;
  }

  async function updateApiProvider(id: string, input: Partial<ApiProvider>) {
    await fetch(`/api/config/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    await fetchApiProviders();
  }

  async function deleteApiProvider(id: string) {
    await fetch(`/api/config/providers/${id}`, { method: 'DELETE' });
    await fetchApiProviders();
  }

  async function selectProject(id: string) {
    currentProjectId.value = id;
    await fetchProjectDoctor(id);
  }

  async function fetchProjectDoctor(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}/doctor`, { method: 'POST' });
      doctorStatus.value = await res.json();
    } catch (err) {
      console.error('Failed to fetch doctor status:', err);
    }
  }

  async function createProject(input: { title: string; genre: string; target_words?: number; premise?: string }) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const newProj = await res.json();
    await fetchProjects();
    currentProjectId.value = newProj.id;
    return newProj;
  }

  async function deleteProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    await fetchProjects();
    if (currentProjectId.value === id) {
      currentProjectId.value = projects.value[0]?.id || null;
    }
  }

  return {
    projects,
    currentProjectId,
    currentProject,
    loading,
    doctorStatus,
    apiProviders,
    activeApiId,
    activeApiConfig,
    fetchProjects,
    fetchApiProviders,
    switchActiveApi,
    addApiProvider,
    updateApiProvider,
    deleteApiProvider,
    selectProject,
    fetchProjectDoctor,
    createProject,
    deleteProject,
  };
});
