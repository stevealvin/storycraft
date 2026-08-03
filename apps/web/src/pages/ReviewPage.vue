<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck class="w-6 h-6 text-emerald-500" />
          <span>多维章节质量审查 (/webnovel-review)</span>
        </h1>
        <p class="text-sm opacity-75 mt-1">从爽点、一致性、OOC、节奏张力、追读力与 Anti-AI 6大维度评估章节，拦截 Blocking 阻断问题。</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="w-56">
          <n-select
            v-model:value="selectedChapNum"
            :options="chapterSelectOptions"
            size="medium"
            placeholder="选择章节"
          />
        </div>

        <n-button type="primary" size="medium" :loading="loading" @click="runReview">
          <template #icon><ShieldCheck class="w-4 h-4" /></template>
          运行深度多维审查
        </n-button>
      </div>
    </div>

    <n-card v-if="reviewResult" class="rounded-2xl space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-xl font-bold">第 {{ selectedChapNum }} 章 审查诊断报告</h2>
          <p class="text-xs opacity-60 mt-1">评估时间: {{ new Date().toLocaleString() }}</p>
        </div>

        <div class="text-center">
          <div class="text-4xl font-extrabold font-mono text-emerald-500">{{ reviewResult.score }}</div>
          <div class="text-[10px] opacity-60 uppercase tracking-wider mt-0.5">综合质量得分</div>
        </div>
      </div>

      <n-grid x-gap="16" y-gap="16" cols="2 m:4" responsive="screen">
        <n-gi>
          <n-card size="small" class="rounded-xl text-center">
            <n-statistic label="爽点看点">
              <template #default>
                <span class="text-indigo-500 font-mono font-bold">{{ reviewResult.cool_points_score }}</span>
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" class="rounded-xl text-center">
            <n-statistic label="设定一致性">
              <template #default>
                <span class="text-purple-500 font-mono font-bold">{{ reviewResult.consistency_score }}</span>
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" class="rounded-xl text-center">
            <n-statistic label="节奏控制">
              <template #default>
                <span class="text-pink-500 font-mono font-bold">{{ reviewResult.pacing_score }}</span>
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" class="rounded-xl text-center">
            <n-statistic label="追读力钩子">
              <template #default>
                <span class="text-emerald-500 font-mono font-bold">{{ reviewResult.retention_score }}</span>
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>

      <div v-if="reviewResult.suggestions && reviewResult.suggestions.length > 0" class="space-y-3 pt-2">
        <h3 class="font-bold text-sm">白金主编修改建议:</h3>
        <n-list hoverable class="rounded-xl">
          <n-list-item v-for="(sug, idx) in reviewResult.suggestions" :key="idx">
            <template #prefix>
              <n-tag size="small" type="primary">{{ idx + 1 }}</n-tag>
            </template>
            <span class="text-xs">{{ sug }}</span>
          </n-list-item>
        </n-list>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NSelect, NButton, NGrid, NGi, NStatistic, NTag, NList, NListItem } from 'naive-ui';
import { ShieldCheck } from '@lucide/vue';

const projectStore = useProjectStore();
const chapters = ref<any[]>([]);
const selectedChapNum = ref(1);
const loading = ref(false);
const reviewResult = ref<any>(null);

const chapterSelectOptions = computed(() => {
  return chapters.value.map(c => ({
    label: `第 ${c.chapter_num} 章：${c.title}`,
    value: c.chapter_num,
  }));
});

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
