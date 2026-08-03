<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Search class="w-6 h-6 text-indigo-500" />
        <span>状态与知识 RAG 检索 (/webnovel-query)</span>
      </h1>
      <p class="text-sm opacity-75 mt-1">查询角色现状、伏笔进度、正文细节或任意特定设定，AI 将基于项目数据库与语义索引精准解答。</p>
    </div>

    <n-card class="rounded-2xl">
      <div class="flex items-center gap-3">
        <n-input
          v-model:value="queryInput"
          placeholder="输入要查询的内容，例如：主角金手指目前等级、黑市线索回收情况、李执事与主角的关系..."
          size="large"
          class="flex-1"
          @keyup.enter="runQuery"
        >
          <template #prefix>
            <Search class="w-4 h-4 text-slate-400" />
          </template>
        </n-input>
        <n-button type="primary" size="large" :loading="loading" :disabled="!queryInput" @click="runQuery">
          查询
        </n-button>
      </div>
    </n-card>

    <n-card v-if="searchResult" title="AI 检索综合解答" class="rounded-2xl space-y-6">
      <template #header-extra>
        <Sparkles class="w-4 h-4 text-indigo-500" />
      </template>

      <div class="space-y-6">
        <n-card size="small" class="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30">
          <div class="text-sm leading-relaxed whitespace-pre-line">
            {{ searchResult.ai_answer }}
          </div>
        </n-card>

        <n-grid x-gap="16" y-gap="16" cols="1 m:2" responsive="screen">
          <n-gi>
            <h4 class="font-semibold text-xs opacity-75 mb-2">匹配的角色事实 ({{ searchResult.matched_characters?.length || 0 }})</h4>
            <n-list hoverable size="small" class="rounded-xl">
              <n-list-item v-for="c in searchResult.matched_characters" :key="c.name">
                <n-thing :title="`${c.name} (${c.cultivation})`" :description="c.description" />
              </n-list-item>
            </n-list>
          </n-gi>

          <n-gi>
            <h4 class="font-semibold text-xs opacity-75 mb-2">匹配的伏笔线索 ({{ searchResult.matched_foreshadowings?.length || 0 }})</h4>
            <n-list hoverable size="small" class="rounded-xl">
              <n-list-item v-for="f in searchResult.matched_foreshadowings" :key="f.title">
                <template #prefix>
                  <n-tag size="small" :type="f.status === '已回收' ? 'success' : 'warning'">{{ f.status }}</n-tag>
                </template>
                <n-thing :title="f.title" :description="f.description" />
              </n-list-item>
            </n-list>
          </n-gi>
        </n-grid>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NInput, NButton, NGrid, NGi, NTag, NList, NListItem, NThing } from 'naive-ui';
import { Search, Sparkles } from 'lucide-vue-next';

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
