<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
        <TrendingUp class="w-6 h-6 text-indigo-500" />
        <span>节奏与追读力分析</span>
      </h1>
      <p class="text-sm opacity-75 mt-1">监控各章节的张力起伏、爽点密度与章尾追读钩子，避免长篇出现拖沓与平铺直叙。</p>
    </div>

    <n-card class="rounded-2xl">
      <n-empty v-if="pacingList.length === 0" description="暂无章节节奏数据。请在【正文创作工作台】完成写章与质量审查。" class="py-10" />

      <n-list v-else hoverable class="rounded-xl">
        <n-list-item v-for="p in pacingList" :key="p.id">
          <n-thing :title="`第 ${p.chapter_num} 章 节奏指标`" :description="p.notes || '无特别评语'" />
          <template #suffix>
            <n-grid x-gap="16" cols="3" class="font-mono text-center">
              <n-gi>
                <div class="text-[10px] opacity-60">剧情张力</div>
                <div class="font-bold text-indigo-500 text-sm">{{ p.tension_score }} / 10</div>
              </n-gi>
              <n-gi>
                <div class="text-[10px] opacity-60">爽点密度</div>
                <div class="font-bold text-purple-500 text-sm">{{ p.cool_point_density }} / 10</div>
              </n-gi>
              <n-gi>
                <div class="text-[10px] opacity-60">追读钩子</div>
                <div class="font-bold text-emerald-500 text-sm">{{ p.retention_score }} / 10</div>
              </n-gi>
            </n-grid>
          </template>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NList, NListItem, NThing, NGrid, NGi, NEmpty } from 'naive-ui';
import { TrendingUp } from '@lucide/vue';

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
