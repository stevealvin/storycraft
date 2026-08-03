<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users class="w-6 h-6 text-pink-400" />
          <span>角色与实体人设图谱</span>
        </h1>
        <p class="text-slate-400 text-sm mt-1">管理登场角色性格、境界等级、所属阵营，并在章节写完后自动更新状态与关系网络。</p>
      </div>

      <button @click="showModal = true"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20">
        <Plus class="w-4 h-4" />
        <span>添加新角色</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="char in characters" :key="char.id"
        class="glass-card p-5 rounded-xl border border-slate-800 space-y-3 relative group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-base text-slate-100">{{ char.name }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-medium"
              :class="char.role === '主角' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-400'">
              {{ char.role }}
            </span>
          </div>

          <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-950/60 border border-purple-800 text-purple-300">
            {{ char.cultivation }}
          </span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">{{ char.description }}</p>

        <div class="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>阵营: {{ char.faction }}</span>
          <span class="text-emerald-400">状态: {{ char.status }}</span>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
        <h3 class="font-bold text-slate-200 text-lg">新增角色人设</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">角色姓名</label>
            <input v-model="newChar.name" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-400 mb-1">定位 (主角/配角/反派)</label>
              <input v-model="newChar.role" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">力量境界/等级</label>
              <input v-model="newChar.cultivation" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">人设描述与背景</label>
            <textarea v-model="newChar.description" rows="3" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showModal = false" class="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 text-xs">取消</button>
          <button @click="createCharacter" class="px-4 py-2 rounded-lg bg-pink-600 text-white text-xs font-medium">创建角色</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { Users, Plus } from 'lucide-vue-next';

const projectStore = useProjectStore();
const characters = ref<any[]>([]);
const showModal = ref(false);

const newChar = ref({ name: '', role: '配角', cultivation: '练气一层', faction: '散修', description: '' });

async function loadCharacters() {
  if (!projectStore.currentProjectId) return;
  const res = await fetch(`/api/projects/${projectStore.currentProjectId}/characters`);
  characters.value = await res.json();
}

async function createCharacter() {
  if (!projectStore.currentProjectId || !newChar.value.name) return;
  await fetch(`/api/projects/${projectStore.currentProjectId}/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newChar.value),
  });
  showModal.value = false;
  newChar.value = { name: '', role: '配角', cultivation: '练气一层', faction: '散修', description: '' };
  await loadCharacters();
}

watch(() => projectStore.currentProjectId, () => {
  loadCharacters();
}, { immediate: true });

onMounted(() => {
  loadCharacters();
});
</script>
