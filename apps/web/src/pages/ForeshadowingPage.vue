<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <GitCommit class="w-6 h-6 text-emerald-400" />
          <span>?????????</span>
        </h1>
        <p class="text-slate-400 text-sm mt-1">???????????????? AI ??????????????????</p>
      </div>

      <button @click="showModal = true"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20">
        <Plus class="w-4 h-4" />
        <span>??????</span>
      </button>
    </div>

    <div class="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-medium">
      <button v-for="tab in filterTabs" :key="tab" @click="activeFilter = tab"
        class="px-3 py-1.5 rounded-lg transition-colors"
        :class="activeFilter === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900'">
        {{ tab }}
      </button>
    </div>

    <div v-if="filteredForeshadowings.length === 0" class="text-center py-12 text-slate-500 text-sm">
      ???????????
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="f in filteredForeshadowings" :key="f.id"
        class="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-slate-100">{{ f.title }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-medium"
              :class="f.impact_level === '?????' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'">
              {{ f.impact_level }}
            </span>
          </div>

          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
            :class="f.status === '???' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'">
            {{ f.status }}
          </span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">{{ f.description }}</p>

        <div class="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>??: ? {{ f.planted_chapter }} ?</span>
          <span v-if="f.resolved_chapter" class="text-emerald-400">???: ? {{ f.resolved_chapter }} ?</span>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
        <h3 class="font-bold text-slate-200 text-lg">???????</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">????/????</label>
            <input v-model="newForeshadowing.title" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">???????????</label>
            <textarea v-model="newForeshadowing.description" rows="3" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-400 mb-1">?????</label>
              <input v-model.number="newForeshadowing.planted_chapter" type="number" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-mono" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">????</label>
              <select v-model="newForeshadowing.impact_level" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none">
                <option>?????</option>
                <option>????</option>
                <option>?????</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showModal = false" class="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 text-xs">??</button>
          <button @click="createForeshadowing" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium">????</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { GitCommit, Plus } from 'lucide-vue-next';

const projectStore = useProjectStore();
const foreshadowings = ref<any[]>([]);
const filterTabs = ['????', '?????', '?????'];
const activeFilter = ref('????');
const showModal = ref(false);

const newForeshadowing = ref({ title: '', description: '', planted_chapter: 1, impact_level: '????' });

const filteredForeshadowings = computed(() => {
  if (activeFilter.value === '?????') return foreshadowings.value.filter(f => f.status !== '???');
  if (activeFilter.value === '?????') return foreshadowings.value.filter(f => f.status === '???');
  return foreshadowings.value;
});

async function loadForeshadowings() {
  if (!projectStore.currentProjectId) return;
  const res = await fetch(`/api/projects/${projectStore.currentProjectId}/foreshadowings`);
  foreshadowings.value = await res.json();
}

async function createForeshadowing() {
  if (!projectStore.currentProjectId || !newForeshadowing.value.title) return;
  await fetch(`/api/projects/${projectStore.currentProjectId}/foreshadowings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newForeshadowing.value),
  });
  showModal.value = false;
  newForeshadowing.value = { title: '', description: '', planted_chapter: 1, impact_level: '????' };
  await loadForeshadowings();
}

watch(() => projectStore.currentProjectId, () => {
  loadForeshadowings();
}, { immediate: true });

onMounted(() => {
  loadForeshadowings();
});
</script>
