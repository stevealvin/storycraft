<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
        <TrendingUp class="w-6 h-6 text-indigo-400" />
        <span>节奏与追读力分析</span>
      </h1>
      <p class="text-slate-400 text-sm mt-1">监控各章节的张力起伏、爽点密度与章尾追读钩子，避免长篇出现拖沓与平铺直叙。</p>
    </div>

    <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div v-if="pacingList.length === 0" class="text-center py-10 text-slate-500 text-sm">
        暂无章节节奏数据。请在【正文创作工作台】完成写章与质量审查。
      </div>

      <div v-else class="space-y-3">
        <div v-for="p in pacingList" :key="p.id"
          class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div class="space-y-1">
            <div class="font-bold text-sm text-slate-200">第 {{ p.chapter_num }} 章 节奏指标</div>
            <p class="text-xs text-slate-400">{{ p.notes || '无特别评语' }}</p>
          </div>

          <div class="flex items-center gap-6 font-mono text-xs">
            <div class="text-center">
              <div class="text-slate-400 text-[10px]">剧情张力</div>
              <div class="font-bold text-indigo-400 text-sm">{{ p.tension_score }} / 10</div>
            </div>
            <div class="text-center">
              <div class="text-slate-400 text-[10px]">爽点密度</div>
              <div class="font-bold text-purple-400 text-sm">{{ p.cool_point_density }} / 10</div>
            </div>
            <div class="text-center">
              <div class="text-slate-400 text-[10px]">追读钩子</div>
              <div class="font-bold text-emerald-400 text-sm">{{ p.retention_score }} / 10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { TrendingUp } from 'lucide-vue-next';

const projectStore = useProjectStore();
const pacingList = ref<any[]>([]);

async function loadPacing() {
  if (!projectStore.currentProjectId) return;
  const res = await fetch(`/api/projects/${projectStore.currentProjectId}/pacing`);
  pacingList.value = await res.json();
}

watch(() => projectStore.currentProjectId, () => {
  loadPacing();
}, { immediate: true });

onMounted(() => {
  loadPacing();
});
</script>
