<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
        <Search class="w-6 h-6 text-indigo-400" />
        <span>????? RAG ?? (/webnovel-query)</span>
      </h1>
      <p class="text-slate-400 text-sm mt-1">???????????????????????,AI ??????????????????</p>
    </div>

    <div class="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
      <Search class="w-5 h-5 text-slate-400" />
      <input v-model="queryInput" @keyup.enter="runQuery" placeholder="????????,??:????????????????????????????..."
        class="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none" />
      <button @click="runQuery" :disabled="loading || !queryInput"
        class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 disabled:opacity-50 transition-colors">
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <span>??</span>
      </button>
    </div>

    <div v-if="searchResult" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <div class="space-y-2">
        <h3 class="font-bold text-indigo-300 text-base flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-indigo-400" />
          <span>AI ??????</span>
        </h3>
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
          {{ searchResult.ai_answer }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
        <div>
          <h4 class="font-semibold text-xs text-slate-400 mb-2">??????? ({{ searchResult.matched_characters?.length || 0 }})</h4>
          <div class="space-y-1.5">
            <div v-for="c in searchResult.matched_characters" :key="c.name" class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span class="font-bold text-indigo-300">{{ c.name }}</span> ({{ c.cultivation }}): {{ c.description }}
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-semibold text-xs text-slate-400 mb-2">??????? ({{ searchResult.matched_foreshadowings?.length || 0 }})</h4>
          <div class="space-y-1.5">
            <div v-for="f in searchResult.matched_foreshadowings" :key="f.title" class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span class="font-bold text-emerald-400">{{ f.title }}</span> [{{ f.status }}]: {{ f.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '@/stores/project';
import { Search, Sparkles, Loader2 } from 'lucide-vue-next';

const projectStore = useProjectStore();
const queryInput = ref('');
const loading = ref(false);
const searchResult = ref<any>(null);

async function runQuery() {
  if (!projectStore.currentProjectId || !queryInput.value) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/projects/${projectStore.currentProjectId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryInput.value }),
    });
    searchResult.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>
