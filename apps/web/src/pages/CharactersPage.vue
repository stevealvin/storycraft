<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users class="w-6 h-6 text-pink-500" />
          <span>角色与实体人设图谱</span>
        </h1>
        <p class="text-sm opacity-75 mt-1">管理登场角色性格、境界等级、所属阵营，并在章节写完后自动更新状态与关系网络。</p>
      </div>

      <n-button type="primary" size="medium" @click="showModal = true">
        <template #icon><Plus class="w-4 h-4" /></template>
        添加新角色
      </n-button>
    </div>

    <n-grid x-gap="16" y-gap="16" cols="1 m:2 l:3" responsive="screen">
      <n-gi v-for="char in characters" :key="char.id">
        <n-card hoverable class="rounded-xl h-full flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-bold text-base">{{ char.name }}</span>
                <n-tag :type="char.role === '主角' ? 'primary' : 'default'" size="small">
                  {{ char.role }}
                </n-tag>
              </div>

              <n-tag type="purple" size="small" class="font-mono">
                {{ char.cultivation }}
              </n-tag>
            </div>

            <p class="text-xs opacity-80 leading-relaxed">{{ char.description }}</p>
          </div>

          <div class="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs opacity-75 font-mono">
            <span>阵营: {{ char.faction }}</span>
            <span class="text-emerald-500 font-semibold">状态: {{ char.status }}</span>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-modal v-model:show="showModal" preset="card" title="新增角色人设" class="max-w-md rounded-2xl">
      <n-form size="medium">
        <n-form-item label="角色姓名">
          <n-input v-model:value="newChar.name" placeholder="例如: 楚风" />
        </n-form-item>
        <n-grid x-gap="12" cols="2">
          <n-gi>
            <n-form-item label="定位 (主角/配角/反派)">
              <n-input v-model:value="newChar.role" placeholder="例如: 主角" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="力量境界/等级">
              <n-input v-model:value="newChar.cultivation" placeholder="例如: 练气一层" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="人设描述与背景">
          <n-input v-model:value="newChar.description" type="textarea" :rows="3" placeholder="描述角色的性格、外貌特征与核心利益动机..." />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="createCharacter">创建角色</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NGrid, NGi, NButton, NModal, NForm, NFormItem, NInput, NTag } from 'naive-ui';
import { Users, Plus } from '@lucide/vue';

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
