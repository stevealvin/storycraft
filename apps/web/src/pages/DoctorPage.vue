<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Stethoscope class="w-6 h-6 text-purple-400" />
          <span>项目体检 (Doctor System)</span>
        </h1>
        <p class="text-slate-400 text-sm mt-1">阶段感知检查工作区目录、数据库索引、伏笔回收率与 API 接口健康度。</p>
      </div>

      <button @click="runDiagnostic" :disabled="loading"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50">
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <RefreshCw v-else class="w-4 h-4" />
        <span>重新运行一键体检</span>
      </button>
    </div>

    <div v-if="report" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono text-2xl font-bold">
            {{ report.health_score }}
          </div>
          <div>
            <div class="text-lg font-bold text-slate-100 uppercase tracking-wide">健康状态: {{ report.status }}</div>
            <div class="text-xs text-slate-400">诊断时间: {{ new Date(report.timestamp).toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="font-bold text-slate-200 text-sm">具体诊断细项:</h3>
        <div class="space-y-2">
          <div v-for="(check, idx) in report.checks" :key="idx"
            class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div class="space-y-1">
              <div class="font-semibold text-sm text-slate-200">{{ check.name }}</div>
              <p class="text-xs text-slate-400">{{ check.message }}</p>
            </div>

            <span class="px-3 py-1 rounded text-xs font-mono font-bold"
              :class="check.status === 'pass' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'">
              {{ check.status === 'pass' ? 'PASSED' : 'WARNING' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { Stethoscope, RefreshCw, Loader2 } from 'lucide-vue-next';

const projectStore = useProjectStore();
const loading = ref(false);
const report = ref<any>(null);

async function runDiagnostic() {
  if (!projectStore.currentProjectId) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/projects/${projectStore.currentProjectId}/doctor`, { method: 'POST' });
    report.value = await res.json();
    await projectStore.fetchProjectDoctor(projectStore.currentProjectId);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch(() => projectStore.currentProjectId, () => {
  runDiagnostic();
}, { immediate: true });

onMounted(() => {
  runDiagnostic();
});
</script>
