<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FolderTree class="w-6 h-6 text-purple-500" />
          <span>卷纲与章纲大纲规划</span>
        </h1>
        <p class="text-sm opacity-75 mt-1">基于总纲智能拆卷拆章，包含章节核心事件、情绪爽点、章尾追读钩子与伏笔排期。</p>
      </div>

      <n-button
        type="primary"
        size="medium"
        :loading="loading"
        @click="generateMoreChapters"
      >
        <template #icon><Sparkles class="w-4 h-4" /></template>
        AI 续画下 10 章细纲
      </n-button>
    </div>

    <n-card v-if="chapters.length === 0" class="rounded-2xl text-center py-12">
      <n-empty description="当前作品尚未规划章节细纲">
        <template #icon>
          <FileText class="w-10 h-10 text-slate-400" />
        </template>
        <template #extra>
          <n-button type="primary" size="medium" :loading="loading" @click="generateMoreChapters">
            <template #icon><Sparkles class="w-4 h-4" /></template>
            立即智能规划第 1 卷 10 章细纲
          </n-button>
        </template>
      </n-empty>
    </n-card>

    <n-grid v-else x-gap="16" y-gap="16" cols="1 m:2" responsive="screen">
      <n-gi v-for="chap in chapters" :key="chap.id">
        <n-card hoverable class="rounded-xl h-full flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-indigo-500">第 {{ chap.chapter_num }} 章：{{ chap.title }}</span>
              <n-tag :type="chap.status === 'draft' ? 'success' : 'default'" size="small">
                {{ chap.status === 'draft' ? '正文已写' : '大纲就绪' }}
              </n-tag>
            </div>

            <div>
              <label class="block text-xs font-medium opacity-75 mb-1">本章剧情细纲</label>
              <n-input
                v-model:value="chap.outline"
                type="textarea"
                :rows="3"
                placeholder="本章细纲..."
                @blur="updateChapter(chap)"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span class="font-mono opacity-75">字数: {{ chap.word_count || 0 }} 字</span>
            <router-link :to="`/studio?chap=${chap.chapter_num}`">
              <n-button size="small" type="primary" secondary>
                <template #icon><PenTool class="w-3.5 h-3.5" /></template>
                开始撰写正文
              </n-button>
            </router-link>
          </div>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NGrid, NGi, NButton, NInput, NTag, NEmpty } from 'naive-ui';
import { FolderTree, Sparkles, FileText, PenTool } from '@lucide/vue';

const projectStore = useProjectStore();
const chapters = ref<any[]>([]);
const loading = ref(false);

async function loadChapters() {
  if (!projectStore.currentProjectId) return;
  try {
    const res = await fetch(`/api/projects/${projectStore.currentProjectId}/chapters`);
    chapters.value = await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function generateMoreChapters() {
  if (!projectStore.currentProjectId) return;
  loading.value = true;
  try {
    await fetch(`/api/projects/${projectStore.currentProjectId}/volumes/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume_num: 1, chapter_count: 10 }),
    });
    await loadChapters();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function updateChapter(chap: any) {
  try {
    await fetch(`/api/projects/${projectStore.currentProjectId}/chapters/${chap.chapter_num}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outline: chap.outline }),
    });
  } catch (err) {
    console.error(err);
  }
}

watch(() => projectStore.currentProjectId, () => {
  loadChapters();
}, { immediate: true });

onMounted(() => {
  loadChapters();
});
</script>
