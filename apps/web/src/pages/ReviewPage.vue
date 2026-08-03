<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck class="w-6 h-6 text-emerald-400" />
          <span>多维章节质量审查 (/webnovel-review)</span>
        </h1>
        <p class="text-slate-400 text-sm mt-1">从爽点、一致性、OOC、节奏张力、追读力与 Anti-AI 6大维度评估章节，拦截 Blocking 阻断问题。</p>
      </div>

      <div class="flex items-center gap-3">
        <select v-model="selectedChapNum" class="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-3 py-2 focus:outline-none">
          <option v-for="c in chapters" :key="c.id" :value="c.chapter_num">
            第 {{ c.chapter_num }} 章：{{ c.title }}
          </option>
        </select>

        <button @click="runReview" :disabled="loading"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <ShieldCheck v-else class="w-4 h-4" />
          <span>运行深度多维审查</span>
        </button>
      </div>
    </div>

    <div v-if="reviewResult" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-slate-100">第 {{ selectedChapNum }} 章 审查诊断报告</h2>
          <p class="text-xs text-slate-400 mt-1">评估时间: {{ new Date().toLocaleString() }}</p>
        </div>

        <div class="text-center">
          <div class="text-4xl font-extrabold font-mono text-emerald-400">{{ reviewResult.score }}</div>
          <div class="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">综合质量得分</div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
          <div class="text-slate-400 text-xs">爽点看点</div>
          <div class="text-2xl font-bold font-mono text-indigo-400">{{ reviewResult.cool_points_score }}</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
          <div class="text-slate-400 text-xs">设定一致性</div>
          <div class="text-2xl font-bold font-mono text-purple-400">{{ reviewResult.consistency_score }}</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
          <div class="text-slate-400 text-xs">节奏控制</div>
          <div class="text-2xl font-bold font-mono text-pink-400">{{ reviewResult.pacing_score }}</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
          <div class="text-slate-400 text-xs">追读力钩子</div>
          <div class="text-2xl font-bold font-mono text-emerald-400">{{ reviewResult.retention_score }}</div>
        </div>
      </div>

      <div v-if="reviewResult.suggestions && reviewResult.suggestions.length > 0" class="space-y-2">
        <h3 class="font-bold text-slate-200 text-sm">白金主编修改建议:</h3>
        <ul class="space-y-1 text-xs text-slate-300">
          <li v-for="(sug, idx) in reviewResult.suggestions" :key="idx" class="flex items-start gap-2">
            <span class="text-indigo-400 font-mono font-bold">•</span>
            <span>{{ sug }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { ShieldCheck, Loader2 } from 'lucide-vue-next';

const projectStore = useProjectStore();
const chapters = ref<any[]>([]);
const selectedChapNum = ref(1);
const loading = ref(false);
const reviewResult = ref<any>(null);

async function loadChapters() {
  if (!projectStore.currentProjectId) return;
  const res = await fetch(`/api/projects/${projectStore.currentProjectId}/chapters`);
  chapters.value = await res.json();
  if (chapters.value.length > 0) {
    selectedChapNum.value = chapters.value[0].chapter_num;
  }
}

async function runReview() {
  if (!projectStore.currentProjectId) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/projects/${projectStore.currentProjectId}/chapters/${selectedChapNum.value}/review`, {
      method: 'POST',
    });
    reviewResult.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch(() => projectStore.currentProjectId, () => {
  loadChapters();
}, { immediate: true });

onMounted(() => {
  loadChapters();
});
</script>
