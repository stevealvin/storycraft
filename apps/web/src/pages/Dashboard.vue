<template>
  <div class="space-y-8">
    <!-- Header Banner -->
    <div class="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20">
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="space-y-2 max-w-2xl relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          <Sparkles class="w-3.5 h-3.5" />
          <span>???????????</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-white">
          {{ projectStore.currentProject?.title || '???? StoryCraft' }}
        </h1>
        <p class="text-slate-400 text-sm leading-relaxed">
          {{ projectStore.currentProject?.premise || '???????????,???? AI ??????????????????????????' }}
        </p>
      </div>

      <div class="flex items-center gap-3 relative z-10">
        <router-link to="/studio" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all">
          <PenTool class="w-4 h-4" />
          <span>??????</span>
        </router-link>
        <router-link to="/wizard" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-all">
          <Plus class="w-4 h-4" />
          <span>?????</span>
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>?????</span>
          <BookOpen class="w-4 h-4 text-indigo-400" />
        </div>
        <div class="text-2xl font-bold font-mono text-white">
          {{ projectStore.currentProject?.total_words?.toLocaleString() || 0 }}
          <span class="text-xs font-normal text-slate-400">?</span>
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-2">
          <span>??: {{ ((projectStore.currentProject?.target_words || 1000000) / 10000).toFixed(0) }} ??</span>
          <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              :style="{ width: Math.min(100, ((projectStore.currentProject?.total_words || 0) / (projectStore.currentProject?.target_words || 1000000)) * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>????? / ??</span>
          <FolderTree class="w-4 h-4 text-purple-400" />
        </div>
        <div class="text-2xl font-bold font-mono text-white">
          {{ projectStore.currentProject?.chapters_count || 0 }}
          <span class="text-xs font-normal text-slate-400">?</span>
        </div>
        <div class="text-xs text-slate-400 flex items-center gap-2">
          <span class="text-purple-400 font-mono">{{ projectStore.currentProject?.volumes_count || 1 }}</span>
          <span>????????</span>
        </div>
      </div>

      <div class="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>???????</span>
          <Users class="w-4 h-4 text-pink-400" />
        </div>
        <div class="text-2xl font-bold font-mono text-white">
          {{ projectStore.currentProject?.characters_count || 0 }}
          <span class="text-xs font-normal text-slate-400">?</span>
        </div>
        <div class="text-xs text-slate-400">???????????</div>
      </div>

      <div class="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>??????</span>
          <GitCommit class="w-4 h-4 text-emerald-400" />
        </div>
        <div class="text-2xl font-bold font-mono text-white">
          {{ projectStore.currentProject?.open_foreshadowings_count || 0 }}
          <span class="text-xs font-normal text-slate-400">????</span>
        </div>
        <div class="text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>??????????</span>
        </div>
      </div>
    </div>

    <!-- Quick Pipeline Shortcuts -->
    <div class="space-y-4">
      <h2 class="text-lg font-bold text-white flex items-center gap-2">
        <Zap class="w-5 h-5 text-indigo-400" />
        <span>???????</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <router-link to="/wizard" class="glass-card p-5 rounded-xl border border-slate-800 hover:border-indigo-500/40 space-y-3 block group">
          <div class="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <div class="font-semibold text-slate-200 text-sm">1. ?????</div>
            <div class="text-xs text-slate-400 mt-1">?????,????????????</div>
          </div>
        </router-link>

        <router-link to="/outline" class="glass-card p-5 rounded-xl border border-slate-800 hover:border-purple-500/40 space-y-3 block group">
          <div class="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <FolderTree class="w-5 h-5" />
          </div>
          <div>
            <div class="font-semibold text-slate-200 text-sm">2. ???????</div>
            <div class="text-xs text-slate-400 mt-1">???????????????</div>
          </div>
        </router-link>

        <router-link to="/studio" class="glass-card p-5 rounded-xl border border-slate-800 hover:border-pink-500/40 space-y-3 block group">
          <div class="w-9 h-9 rounded-lg bg-pink-950/60 border border-pink-800/40 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <PenTool class="w-5 h-5" />
          </div>
          <div>
            <div class="font-semibold text-slate-200 text-sm">3. ?????</div>
            <div class="text-xs text-slate-400 mt-1">???? -> ?? -> ?? -> ?????</div>
          </div>
        </router-link>

        <router-link to="/review" class="glass-card p-5 rounded-xl border border-slate-800 hover:border-emerald-500/40 space-y-3 block group">
          <div class="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <div>
            <div class="font-semibold text-slate-200 text-sm">4. ??????</div>
            <div class="text-xs text-slate-400 mt-1">???????OOC???????</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Chapters Table & Foreshadowing Preview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-slate-200 flex items-center gap-2">
            <FileText class="w-4 h-4 text-indigo-400" />
            <span>??????</span>
          </h3>
          <router-link to="/studio" class="text-xs text-indigo-400 hover:underline">?????</router-link>
        </div>

        <div v-if="chapters.length === 0" class="text-center py-10 text-slate-500 text-sm">
          ??????,?????2. ???????????????
        </div>

        <div v-else class="space-y-2">
          <div v-for="chap in chapters.slice(0, 6)" :key="chap.id"
            class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div class="space-y-1">
              <div class="flex items-center gap-3">
                <span class="font-semibold text-sm text-slate-200">? {{ chap.chapter_num }} ?:{{ chap.title }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium"
                  :class="chap.status === 'draft' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'">
                  {{ chap.status === 'draft' ? '???' : '???' }}
                </span>
              </div>
              <p class="text-xs text-slate-400 line-clamp-1 max-w-md">{{ chap.outline || '???' }}</p>
            </div>

            <div class="flex items-center gap-4 text-xs">
              <span class="font-mono text-slate-400">{{ chap.word_count || 0 }} ?</span>
              <span v-if="chap.review_score" class="px-2 py-0.5 rounded font-mono font-semibold"
                :class="chap.review_score >= 80 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'">
                {{ chap.review_score }}?
              </span>
              <router-link :to="`/studio?chap=${chap.chapter_num}`" class="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                ??
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-200 flex items-center gap-2">
              <Stethoscope class="w-4 h-4 text-purple-400" />
              <span>??????</span>
            </h3>
            <router-link to="/doctor" class="text-xs text-purple-400 hover:underline font-mono">?? &rarr;</router-link>
          </div>

          <div v-if="projectStore.doctorStatus" class="space-y-3">
            <div class="flex items-center gap-4">
              <div class="text-3xl font-extrabold font-mono text-emerald-400">
                {{ projectStore.doctorStatus.health_score }}
                <span class="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <div class="text-xs text-slate-400">
                <span>??: </span>
                <span class="text-emerald-400 font-semibold uppercase">{{ projectStore.doctorStatus.status }}</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <div v-for="(check, idx) in projectStore.doctorStatus.checks" :key="idx"
                class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40">
                <span class="text-slate-300">{{ check.name }}</span>
                <span class="font-mono font-medium" :class="check.status === 'pass' ? 'text-emerald-400' : 'text-amber-400'">
                  {{ check.status === 'pass' ? 'PASSED' : 'WARN' }}
                </span>
              </div>
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
import {
  Sparkles,
  BookOpen,
  FolderTree,
  Users,
  GitCommit,
  PenTool,
  Plus,
  ShieldCheck,
  Zap,
  FileText,
  Stethoscope,
  CheckCircle2
} from 'lucide-vue-next';

const projectStore = useProjectStore();
const chapters = ref<any[]>([]);

async function loadChapters() {
  if (!projectStore.currentProjectId) return;
  try {
    const res = await fetch(`/api/projects/${projectStore.currentProjectId}/chapters`);
    chapters.value = await res.json();
  } catch (err) {
    console.error('Failed to load chapters:', err);
  }
}

watch(() => projectStore.currentProjectId, () => {
  loadChapters();
}, { immediate: true });

onMounted(() => {
  loadChapters();
});
</script>
