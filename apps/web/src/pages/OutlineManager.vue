<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FolderTree class="w-6 h-6 text-purple-400" />
          <span>卷纲与章纲大纲规划</span>
        </h1>
        <p class="text-slate-400 text-sm mt-1">基于总纲智能拆卷拆章，包含章节核心事件、情绪爽点、章尾追读钩子与伏笔排期。</p>
      </div>

      <button @click="generateMoreChapters" :disabled="loading"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50">
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <Sparkles v-else class="w-4 h-4" />
        <span>AI 续画下 10 章细纲</span>
      </button>
    </div>

    <div v-if="chapters.length === 0" class="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800">
      <FileText class="w-12 h-12 text-slate-600 mx-auto" />
      <div class="text-slate-300 font-medium">当前作品尚未规划章节细纲</div>
      <button @click="generateMoreChapters" :disabled="loading" class="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-medium inline-flex items-center gap-2">
        <Sparkles class="w-4 h-4" />
        <span>立即智能规划第 1 卷 10 章细纲</span>
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="chap in chapters" :key="chap.id"
        class="glass-card p-5 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-indigo-300">第 {{ chap.chapter_num }} 章：{{ chap.title }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
              :class="chap.status === 'draft' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'">
              {{ chap.status === 'draft' ? '正文已写' : '大纲就绪' }}
            </span>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">本章剧情细纲</label>
            <textarea v-model="chap.outline" rows="3" @blur="updateChapter(chap)"
              class="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
          <span class="text-slate-500 font-mono">字数: {{ chap.word_count || 0 }} 字</span>
          <router-link :to="`/studio?chap=${chap.chapter_num}`"
            class="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs flex items-center gap-1 font-medium">
            <PenTool class="w-3.5 h-3.5" />
            <span>开始撰写正文</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { FolderTree, Sparkles, Loader2, FileText, PenTool } from 'lucide-vue-next';

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
