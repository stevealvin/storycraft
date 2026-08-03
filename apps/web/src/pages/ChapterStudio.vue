<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col space-y-4">
    <div class="glass-panel px-6 py-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-200">
          <PenTool class="w-4 h-4 text-indigo-400" />
          <span>???????</span>
        </div>

        <div class="h-4 w-px bg-slate-800"></div>

        <select v-model="selectedChapNum" @change="loadChapterDetail" class="bg-slate-900 border border-slate-700 text-xs font-semibold text-indigo-300 rounded-lg px-3 py-1.5 focus:outline-none">
          <option v-for="c in chapters" :key="c.id" :value="c.chapter_num">
            ? {{ c.chapter_num }} ?:{{ c.title }} ({{ c.word_count || 0 }}?)
          </option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <button @click="saveChapter" :disabled="saving" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors">
          <Save class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ saving ? '???...' : '??????' }}</span>
        </button>

        <button @click="triggerWritePipeline" :disabled="writing"
          class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all">
          <Loader2 v-if="writing" class="w-4 h-4 animate-spin" />
          <Zap v-else class="w-4 h-4" />
          <span>AI ???????? (/webnovel-write)</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
      <div class="lg:col-span-3 glass-panel p-4 rounded-xl border border-slate-800 flex flex-col space-y-4 overflow-y-auto">
        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText class="w-3.5 h-3.5 text-indigo-400" />
            <span>???????</span>
          </div>
          <textarea v-model="currentChap.outline" rows="4" @blur="saveChapter"
            class="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"></textarea>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-800">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users class="w-3.5 h-3.5 text-purple-400" />
            <span>??????</span>
          </div>
          <div class="space-y-1.5">
            <div v-for="char in characters" :key="char.id" class="p-2 rounded bg-slate-900/50 border border-slate-800 text-xs flex justify-between items-center">
              <span class="font-medium text-indigo-300">{{ char.name }}</span>
              <span class="text-[10px] text-purple-400 font-mono">{{ char.cultivation }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-800">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitCommit class="w-3.5 h-3.5 text-emerald-400" />
            <span>???????</span>
          </div>
          <div class="space-y-1.5">
            <div v-for="f in foreshadowings.slice(0, 3)" :key="f.id" class="p-2 rounded bg-slate-900/50 border border-slate-800 text-[11px] text-slate-300">
              <div class="font-semibold text-emerald-400">{{ f.title }}</div>
              <div class="text-slate-400 line-clamp-1 mt-0.5">{{ f.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-6 glass-panel p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <input v-model="currentChap.title" @blur="saveChapter"
            class="font-bold text-base text-slate-100 bg-transparent focus:outline-none focus:bg-slate-900 px-2 py-1 rounded" />
          <span class="font-mono text-slate-400">{{ currentChap.content?.length || 0 }} ?</span>
        </div>

        <textarea v-model="currentChap.content" placeholder="??????AI ????????????..."
          class="flex-1 w-full bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-sm leading-relaxed text-slate-100 font-sans focus:outline-none focus:border-indigo-500 resize-none"></textarea>
      </div>

      <div class="lg:col-span-3 glass-panel p-4 rounded-xl border border-slate-800 flex flex-col space-y-4 overflow-y-auto">
        <div v-if="writing" class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Loader2 class="w-4 h-4 animate-spin text-indigo-400" />
            <span>AI ????????...</span>
          </div>
          <div class="space-y-1.5 text-[11px] text-slate-300 font-mono">
            <div class="flex items-center gap-2 text-emerald-400">? 1. RAG ????????</div>
            <div class="flex items-center gap-2 text-emerald-400">? 2. ?????????</div>
            <div class="flex items-center gap-2 text-indigo-400">? 3. ?????????</div>
            <div class="flex items-center gap-2 text-slate-500">? 4. ????? commit ??</div>
          </div>
        </div>

        <div v-if="currentChap.review_report" class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <span>??????</span>
            </div>
            <span class="text-lg font-extrabold font-mono text-emerald-400">{{ currentChap.review_score }}?</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div class="text-slate-400">????</div>
              <div class="font-mono font-bold text-indigo-400">{{ parsedReview.cool_points_score || '--' }}</div>
            </div>
            <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div class="text-slate-400">?????</div>
              <div class="font-mono font-bold text-purple-400">{{ parsedReview.consistency_score || '--' }}</div>
            </div>
            <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div class="text-slate-400">????</div>
              <div class="font-mono font-bold text-pink-400">{{ parsedReview.pacing_score || '--' }}</div>
            </div>
            <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div class="text-slate-400">??????</div>
              <div class="font-mono font-bold text-emerald-400">{{ parsedReview.retention_score || '--' }}</div>
            </div>
          </div>

          <div v-if="parsedReview.suggestions" class="space-y-1 text-xs">
            <div class="text-slate-400 font-semibold">??????:</div>
            <ul class="list-disc list-inside text-slate-300 space-y-1">
              <li v-for="(sug, idx) in parsedReview.suggestions" :key="idx">{{ sug }}</li>
            </ul>
          </div>
        </div>

        <div v-else-if="!writing" class="text-center py-8 text-slate-500 text-xs">
          ?????AI ???????????????
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { PenTool, Save, Zap, FileText, Users, GitCommit, ShieldCheck, Loader2 } from 'lucide-vue-next';

const route = useRoute();
const projectStore = useProjectStore();

const chapters = ref<any[]>([]);
const selectedChapNum = ref(1);
const currentChap = ref<any>({ title: '', outline: '', content: '', review_score: 0, review_report: '' });
const characters = ref<any[]>([]);
const foreshadowings = ref<any[]>([]);

const saving = ref(false);
const writing = ref(false);

const parsedReview = computed(() => {
  if (!currentChap.value.review_report) return {};
  try {
    return JSON.parse(currentChap.value.review_report);
  } catch {
    return {};
  }
});

async function loadData() {
  if (!projectStore.currentProjectId) return;
  const [chapRes, charRes, foresRes] = await Promise.all([
    fetch(`/api/projects/${projectStore.currentProjectId}/chapters`),
    fetch(`/api/projects/${projectStore.currentProjectId}/characters`),
    fetch(`/api/projects/${projectStore.currentProjectId}/foreshadowings`)
  ]);

  chapters.value = await chapRes.json();
  characters.value = await charRes.json();
  foreshadowings.value = await foresRes.json();

  if (route.query.chap) {
    selectedChapNum.value = parseInt(route.query.chap as string, 10);
  } else if (chapters.value.length > 0) {
    selectedChapNum.value = chapters.value[0].chapter_num;
  }

  await loadChapterDetail();
}

async function loadChapterDetail() {
  if (!projectStore.currentProjectId) return;
  const res = await fetch(`/api/projects/${projectStore.currentProjectId}/chapters/${selectedChapNum.value}`);
  if (res.ok) {
    currentChap.value = await res.json();
  }
}

async function saveChapter() {
  if (!projectStore.currentProjectId) return;
  saving.value = true;
  try {
    await fetch(`/api/projects/${projectStore.currentProjectId}/chapters/${selectedChapNum.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: currentChap.value.title,
        outline: currentChap.value.outline,
        content: currentChap.value.content,
      }),
    });
    await projectStore.fetchProjects();
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
}

async function triggerWritePipeline() {
  if (!projectStore.currentProjectId) return;
  writing.value = true;
  try {
    const res = await fetch(`/api/projects/${projectStore.currentProjectId}/chapters/${selectedChapNum.value}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoReview: true }),
    });
    const result = await res.json();
    currentChap.value.content = result.content;
    await loadChapterDetail();
    await projectStore.fetchProjects();
  } catch (err) {
    console.error(err);
  } finally {
    writing.value = false;
  }
}

watch(() => projectStore.currentProjectId, () => {
  loadData();
}, { immediate: true });

onMounted(() => {
  loadData();
});
</script>
