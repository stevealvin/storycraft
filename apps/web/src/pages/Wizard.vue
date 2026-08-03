<template>
  <div class="max-w-4xl mx-auto space-y-8 py-4">
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
        <Sparkles class="w-3.5 h-3.5" />
        <span>/webnovel-init ?????</span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-white">?? AI ????????</h1>
      <p class="text-slate-400 text-sm">??? AI ??,???????????????????????????????</p>
    </div>

    <div class="flex items-center justify-between glass-panel p-4 rounded-xl border border-slate-800 text-xs font-medium">
      <div v-for="(step, idx) in steps" :key="idx" class="flex items-center gap-2"
        :class="currentStep >= idx ? 'text-indigo-400 font-semibold' : 'text-slate-500'">
        <div class="w-6 h-6 rounded-full flex items-center justify-center font-mono border"
          :class="currentStep > idx ? 'bg-indigo-600 border-indigo-500 text-white' : currentStep === idx ? 'border-indigo-500 text-indigo-400' : 'border-slate-800 text-slate-600'">
          {{ idx + 1 }}
        </div>
        <span>{{ step }}</span>
        <ChevronRight v-if="idx < steps.length - 1" class="w-4 h-4 text-slate-700 ml-2" />
      </div>
    </div>

    <div v-if="currentStep === 0" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <h2 class="text-lg font-bold text-slate-200 flex items-center gap-2">
        <BookOpen class="w-5 h-5 text-indigo-400" />
        <span>???:?????????</span>
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-2">????????</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button v-for="g in genres" :key="g.name" type="button"
              @click="selectedGenre = g.name"
              class="p-3 rounded-xl border text-left transition-all"
              :class="selectedGenre === g.name ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'">
              <div class="font-semibold text-sm">{{ g.name }}</div>
              <div class="text-[11px] text-slate-400 mt-1 line-clamp-1">{{ g.description }}</div>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-2">??/?????? (?????????????)</label>
          <textarea v-model="userConcept" rows="3" placeholder="??:????????,????????????,????????????????????..."
            class="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"></textarea>
        </div>
      </div>

      <div class="flex justify-end">
        <button @click="runStep1" :disabled="loading" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <Sparkles v-else class="w-4 h-4" />
          <span>???????</span>
        </button>
      </div>
    </div>

    <div v-if="currentStep === 1" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <h2 class="text-lg font-bold text-slate-200 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-indigo-400" />
        <span>???:?????????</span>
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-2">??????</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button v-for="t in premiseResult.titles" :key="t" type="button"
              @click="selectedTitle = t"
              class="p-3 rounded-xl border text-center transition-all font-bold text-sm"
              :class="selectedTitle === t ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900/40 border-slate-800 text-slate-400'">
              ?{{ t }}?
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">????</label>
          <textarea v-model="premiseResult.premise" rows="3" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"></textarea>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">???/????????</label>
          <input v-model="premiseResult.golden_finger" type="text" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div class="flex justify-between">
        <button @click="currentStep = 0" class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">???</button>
        <button @click="runStep2" :disabled="loading" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span>???:??????</span>
        </button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <h2 class="text-lg font-bold text-slate-200 flex items-center gap-2">
        <Users class="w-5 h-5 text-indigo-400" />
        <span>???:????????</span>
      </h2>

      <div class="space-y-4">
        <div v-for="(char, idx) in charactersResult" :key="idx" class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div class="flex items-center gap-3">
            <input v-model="char.name" class="font-bold text-indigo-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-sm" />
            <input v-model="char.role" class="text-xs text-purple-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800" />
            <input v-model="char.cultivation" class="text-xs text-emerald-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 font-mono" />
          </div>
          <textarea v-model="char.description" rows="2" class="w-full bg-slate-950/40 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"></textarea>
        </div>
      </div>

      <div class="flex justify-between">
        <button @click="currentStep = 1" class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">???</button>
        <button @click="runStep3" :disabled="loading" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span>???:??????????</span>
        </button>
      </div>
    </div>

    <div v-if="currentStep === 3" class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
      <h2 class="text-lg font-bold text-slate-200 flex items-center gap-2">
        <Globe class="w-5 h-5 text-indigo-400" />
        <span>???:??????????????</span>
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">?????????</label>
          <textarea v-model="worldResult.power_system" rows="4" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono"></textarea>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">??????????</label>
          <textarea v-model="worldResult.world_setting" rows="4" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"></textarea>
        </div>
      </div>

      <div class="flex justify-between">
        <button @click="currentStep = 2" class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">???</button>
        <button @click="finishInit" :disabled="loading" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 class="w-4 h-4" />
          <span>??????????</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { Sparkles, BookOpen, ChevronRight, Users, Globe, CheckCircle2, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const projectStore = useProjectStore();

const steps = ['?????', '??????', '??????', '??????'];
const currentStep = ref(0);
const loading = ref(false);

const genres = ref<any[]>([]);
const selectedGenre = ref('??');
const userConcept = ref('');

const premiseResult = ref<any>({ titles: [], selected_title: '', premise: '', golden_finger: '' });
const selectedTitle = ref('');
const charactersResult = ref<any[]>([]);
const worldResult = ref<any>({ power_system: '', world_setting: '' });

onMounted(async () => {
  const res = await fetch('/api/genres');
  genres.value = await res.json();
});

async function runStep1() {
  loading.value = true;
  try {
    const res = await fetch('/api/projects/dummy/wizard/premise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre: selectedGenre.value, userConcept: userConcept.value }),
    });
    premiseResult.value = await res.json();
    selectedTitle.value = premiseResult.value.titles[0] || '?????';
    currentStep.value = 1;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function runStep2() {
  loading.value = true;
  try {
    const res = await fetch('/api/projects/dummy/wizard/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        genre: selectedGenre.value,
        title: selectedTitle.value,
        premise: premiseResult.value.premise,
        golden_finger: premiseResult.value.golden_finger,
      }),
    });
    const data = await res.json();
    charactersResult.value = data.characters || [];
    currentStep.value = 2;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function runStep3() {
  loading.value = true;
  try {
    const res = await fetch('/api/projects/dummy/wizard/world', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        genre: selectedGenre.value,
        title: selectedTitle.value,
        premise: premiseResult.value.premise,
      }),
    });
    worldResult.value = await res.json();
    currentStep.value = 3;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function finishInit() {
  loading.value = true;
  try {
    const proj = await projectStore.createProject({
      title: selectedTitle.value,
      genre: selectedGenre.value,
      premise: premiseResult.value.premise,
      golden_finger: premiseResult.value.golden_finger,
      power_system: worldResult.value.power_system,
      world_setting: worldResult.value.world_setting,
    });

    for (const c of charactersResult.value) {
      await fetch(`/api/projects/${proj.id}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    }

    await fetch(`/api/projects/${proj.id}/volumes/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume_num: 1, chapter_count: 10 }),
    });

    await projectStore.fetchProjects();
    await projectStore.selectProject(proj.id);
    router.push('/outline');
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>
