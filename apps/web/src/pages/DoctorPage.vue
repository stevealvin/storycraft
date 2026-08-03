<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Stethoscope class="w-6 h-6 text-purple-500" />
          <span>项目体检 (Doctor System)</span>
        </h1>
        <p class="text-sm opacity-75 mt-1">阶段感知检查工作区目录、数据库索引、伏笔回收率与 API 接口健康度。</p>
      </div>

      <n-button type="primary" size="medium" :loading="loading" @click="runDiagnostic">
        <template #icon><RefreshCw class="w-4 h-4" /></template>
        重新运行一键体检
      </n-button>
    </div>

    <n-card v-if="report" class="rounded-2xl space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-500 font-mono text-2xl font-bold">
            {{ report.health_score }}
          </div>
          <div>
            <div class="text-lg font-bold uppercase tracking-wide">健康状态: {{ report.status }}</div>
            <div class="text-xs opacity-60">诊断时间: {{ new Date(report.timestamp).toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="font-bold text-sm">具体诊断细项:</h3>
        <n-list hoverable class="rounded-xl">
          <n-list-item v-for="(check, idx) in report.checks" :key="idx">
            <template #prefix>
              <n-tag :type="check.status === 'pass' ? 'success' : 'warning'" size="small" class="font-mono">
                {{ check.status === 'pass' ? 'PASSED' : 'WARNING' }}
              </n-tag>
            </template>
            <n-thing :title="check.name" :description="check.message" />
          </n-list-item>
        </n-list>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NButton, NTag, NList, NListItem, NThing } from 'naive-ui';
import { Stethoscope, RefreshCw } from 'lucide-vue-next';

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
