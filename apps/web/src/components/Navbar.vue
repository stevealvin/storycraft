<template>
  <header class="h-14 px-5 rounded-2xl flex items-center justify-between backdrop-blur-2xl transition-all duration-300 shadow-lg"
    :class="themeStore.isDark ? 'bg-slate-900/80 shadow-slate-950/60 text-slate-100' : 'bg-white/80 shadow-slate-200/50 text-slate-900'">
    <div class="flex items-center gap-5">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
          <BookOpen class="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <span class="text-lg font-bold tracking-tight gradient-text">StoryCraft</span>
          <span class="text-[9px] font-medium uppercase tracking-wider block" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">Web Novel AI Engine v6.2</span>
        </div>
      </router-link>

      <div class="w-1.5 h-1.5 rounded-full" :class="themeStore.isDark ? 'bg-slate-700' : 'bg-slate-300'"></div>

      <!-- Project Selector -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-600'">当前作品:</span>
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
    <div class="flex items-center gap-3">
      <div v-if="projectStore.currentProject" class="hidden md:flex items-center gap-3 px-3 py-1 rounded-xl text-xs transition-colors"
        :class="themeStore.isDark ? 'bg-slate-950/60 text-slate-300' : 'bg-slate-100 text-slate-700'">
        <div>
          <span :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">字数: </span>
          <span class="font-semibold text-indigo-500 font-mono">{{ projectStore.currentProject.total_words?.toLocaleString() || 0 }}</span>
          <span :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'"> / {{ (projectStore.currentProject.target_words / 10000).toFixed(0) }}万字</span>
        </div>
        <div class="w-1 h-1 rounded-full" :class="themeStore.isDark ? 'bg-slate-700' : 'bg-slate-300'"></div>
        <div>
          <span :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">已写章节: </span>
          <span class="font-semibold text-purple-500 font-mono">{{ projectStore.currentProject.chapters_count || 0 }} 章</span>
        </div>
      </div>

      <!-- Multi-API Quick Selector Dropdown -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-mono hidden xl:inline" :class="themeStore.isDark ? 'text-emerald-400' : 'text-emerald-600'">模型:</span>
        <div class="w-40">
          <n-select
            v-model:value="selectedApiId"
            :options="apiOptions"
            placeholder="选择 API 模型"
            size="small"
            @update:value="onApiChange"
          />
        </div>
      </div>

      <!-- Theme Switcher Button -->
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button circle size="small" secondary @click="themeStore.toggleTheme">
            <template #icon>
              <Sun v-if="themeStore.isDark" class="w-3.5 h-3.5 text-amber-400" />
              <Moon v-else class="w-3.5 h-3.5 text-indigo-600" />
            </template>
          </n-button>
        </template>
        切换为{{ themeStore.isDark ? '白色主题' : '深色主题' }}
      </n-tooltip>

      <!-- Doctor Status Badge -->
      <router-link to="/doctor">
        <n-tag :type="doctorTagType" round size="small" class="cursor-pointer hover:opacity-80">
          <template #icon>
            <Activity class="w-3 h-3" />
          </template>
          体检: {{ projectStore.doctorStatus?.health_score || '--' }}分
        </n-tag>
      </router-link>

      <router-link to="/wizard">
        <n-button type="primary" size="small" secondary icon-placement="left">
          <template #icon>
            <Plus class="w-3.5 h-3.5" />
          </template>
          AI 初始化
        </n-button>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useThemeStore } from '@/stores/theme';
import { NSelect, NButton, NTag, NTooltip } from 'naive-ui';
import { BookOpen, Activity, Plus, Sun, Moon } from 'lucide-vue-next';

const projectStore = useProjectStore();
const themeStore = useThemeStore();
const selectedProjectId = ref<string | null>(null);
const selectedApiId = ref<string | null>(null);

const projectOptions = computed(() => {
  return projectStore.projects.map((p) => ({
    label: `${p.title} (${p.genre})`,
    value: p.id,
  }));
});

const apiOptions = computed(() => {
  return projectStore.apiProviders.map((api) => ({
    label: `${api.name} (${api.model})`,
    value: api.id,
  }));
});

const doctorTagType = computed(() => {
  const score = projectStore.doctorStatus?.health_score || 100;
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
});

function onProjectChange(id: string) {
  projectStore.selectProject(id);
}

function onApiChange(id: string) {
  if (id) {
    projectStore.switchActiveApi(id);
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
