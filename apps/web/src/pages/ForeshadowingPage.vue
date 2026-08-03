<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GitCommit class="w-6 h-6 text-emerald-500" />
          <span>伏笔与剧情线索追踪</span>
        </h1>
        <p class="text-sm opacity-75 mt-1">防止长篇连载伏笔丢失。一章写完后 AI 自动提取埋下的新伏笔或回收的旧伏笔。</p>
      </div>

      <n-button type="primary" size="medium" @click="showModal = true">
        <template #icon><Plus class="w-4 h-4" /></template>
        手动登记伏笔
      </n-button>
    </div>

    <div class="flex items-center gap-4">
      <n-radio-group v-model:value="activeFilter" size="medium">
        <n-radio-button v-for="tab in filterTabs" :key="tab" :value="tab">
          {{ tab }}
        </n-radio-button>
      </n-radio-group>
    </div>

    <n-card v-if="filteredForeshadowings.length === 0" class="rounded-2xl text-center py-12">
      <n-empty description="暂无符合条件的伏笔记录" />
    </n-card>

    <n-grid v-else x-gap="16" y-gap="16" cols="1 m:2" responsive="screen">
      <n-gi v-for="f in filteredForeshadowings" :key="f.id">
        <n-card hoverable class="rounded-xl h-full flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm">{{ f.title }}</span>
                <n-tag :type="f.impact_level === '核心大伏笔' ? 'error' : 'default'" size="small">
                  {{ f.impact_level }}
                </n-tag>
              </div>

              <n-tag :type="f.status === '已回收' ? 'success' : 'warning'" size="small">
                {{ f.status }}
              </n-tag>
            </div>

            <p class="text-xs opacity-80 leading-relaxed">{{ f.description }}</p>
          </div>

          <div class="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs opacity-75 font-mono">
            <span>埋于: 第 {{ f.planted_chapter }} 章</span>
            <span v-if="f.resolved_chapter" class="text-emerald-500 font-semibold">回收于: 第 {{ f.resolved_chapter }} 章</span>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-modal v-model:show="showModal" preset="card" title="手动登记新伏笔" class="max-w-md rounded-2xl">
      <n-form size="medium">
        <n-form-item label="伏笔标题/线索名称">
          <n-input v-model:value="newForeshadowing.title" placeholder="例如: 楚风怀中的神秘残片" />
        </n-form-item>
        <n-form-item label="伏笔具体内容与预埋线索">
          <n-input v-model:value="newForeshadowing.description" type="textarea" :rows="3" placeholder="例如: 遗迹中所获残片在特定星象下会发出微光..." />
        </n-form-item>
        <n-grid x-gap="12" cols="2">
          <n-gi>
            <n-form-item label="埋下章节数">
              <n-input-number v-model:value="newForeshadowing.planted_chapter" :min="1" class="w-full" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="伏笔级别">
              <n-select v-model:value="newForeshadowing.impact_level" :options="impactOptions" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="createForeshadowing">保存伏笔</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NGrid, NGi, NButton, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NRadioGroup, NRadioButton, NTag, NEmpty } from 'naive-ui';
import { GitCommit, Plus } from 'lucide-vue-next';

const projectStore = useProjectStore();
const foreshadowings = ref<any[]>([]);
const filterTabs = ['全部伏笔', '待回收伏笔', '已回收伏笔'];
const activeFilter = ref('全部伏笔');
const showModal = ref(false);

const impactOptions = [
  { label: '核心大伏笔', value: '核心大伏笔' },
  { label: '中等伏笔', value: '中等伏笔' },
  { label: '局部小伏笔', value: '局部小伏笔' },
];

const newForeshadowing = ref({ title: '', description: '', planted_chapter: 1, impact_level: '中等伏笔' });

const filteredForeshadowings = computed(() => {
  if (activeFilter.value === '待回收伏笔') return foreshadowings.value.filter(f => f.status !== '已回收');
  if (activeFilter.value === '已回收伏笔') return foreshadowings.value.filter(f => f.status === '已回收');
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
  newForeshadowing.value = { title: '', description: '', planted_chapter: 1, impact_level: '中等伏笔' };
  await loadForeshadowings();
}

watch(() => projectStore.currentProjectId, () => {
  loadForeshadowings();
}, { immediate: true });

onMounted(() => {
  loadForeshadowings();
});
</script>
