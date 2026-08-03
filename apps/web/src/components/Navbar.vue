<template>
  <header class="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
    <div class="flex items-center gap-6">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <BookOpen class="w-5 h-5 text-white" />
        </div>
        <div>
          <span class="text-xl font-bold tracking-tight gradient-text">StoryCraft</span>
          <span class="text-[10px] uppercase tracking-wider block text-slate-400 font-mono">Monorepo v6.2</span>
        </div>
      </router-link>

      <div class="h-6 w-px bg-slate-800"></div>

      <!-- Project Selector -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 font-medium">当前作品:</span>
        <div class="w-52">
          <n-select
            v-model:value="selectedProjectId"
            :options="projectOptions"
            placeholder="选择小说作品"
            size="small"
            @update:value="onProjectChange"
          />
        </div>
      </div>
    </div>

    <!-- Right Stats & API Switcher & Actions -->
    <div class="flex items-center gap-4">
      <div v-if="projectStore.currentProject" class="hidden md:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
        <div>
          <span class="text-slate-400">字数: </span>
          <span class="font-semibold text-indigo-400 font-mono">{{ projectStore.currentProject.total_words?.toLocaleString() || 0 }}</span>
          <span class="text-slate-500"> / {{ (projectStore.currentProject.target_words / 10000).toFixed(0) }}万字</span>
        </div>
        <div class="h-4 w-px bg-slate-800"></div>
        <div>
          <span class="text-slate-400">已写章节: </span>
          <span class="font-semibold text-purple-400 font-mono">{{ projectStore.currentProject.chapters_count || 0 }} 章</span>
        </div>
      </div>

      <!-- Multi-API Quick Selector Dropdown -->
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
        <Cpu class="w-3.5 h-3.5 text-emerald-400" />
        <select
          v-model="selectedApiId"
          @change="onApiChange"
          class="bg-transparent text-emerald-300 font-mono font-semibold focus:outline-none cursor-pointer">
          <option v-for="api in projectStore.apiProviders" :key="api.id" :value="api.id" class="bg-slate-900 text-slate-200 font-sans">
            {{ api.name }} ({{ api.model }})
          </option>
        </select>
      </div>

      <!-- Doctor Status Badge -->
      <router-link to="/doctor" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
        :class="doctorBadgeClass">
        <Activity class="w-3.5 h-3.5" />
        <span>体检: {{ projectStore.doctorStatus?.health_score || '--' }}分</span>
      </router-link>

      <router-link to="/wizard" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium shadow-md shadow-indigo-500/20 transition-all">
        <Plus class="w-4 h-4" />
        <span>新书 AI 初始化</span>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NSelect } from 'naive-ui';
import { BookOpen, Activity, Plus, Cpu } from 'lucide-vue-next';

const projectStore = useProjectStore();
const selectedProjectId = ref<string | null>(null);
const selectedApiId = ref<string | null>(null);

const projectOptions = computed(() => {
  return projectStore.projects.map((p) => ({
    label: `${p.title} (${p.genre})`,
    value: p.id,
  }));
});

const doctorBadgeClass = computed(() => {
  const score = projectStore.doctorStatus?.health_score || 100;
  if (score >= 80) return 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40';
  if (score >= 60) return 'bg-amber-950/30 border-amber-800/50 text-amber-400 hover:bg-amber-900/40';
  return 'bg-rose-950/30 border-rose-800/50 text-rose-400 hover:bg-rose-900/40';
});

function onProjectChange(id: string) {
  projectStore.selectProject(id);
}

function onApiChange() {
  if (selectedApiId.value) {
    projectStore.switchActiveApi(selectedApiId.value);
  }
}

watch(
  () => projectStore.currentProjectId,
  (newId) => { selectedProjectId.value = newId; },
  { immediate: true }
);

watch(
  () => projectStore.activeApiId,
  (newApiId) => { selectedApiId.value = newApiId; },
  { immediate: true }
);

onMounted(() => {
  projectStore.fetchProjects();
  projectStore.fetchApiProviders();
});
</script>
