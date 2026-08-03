<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col space-y-4">
    <!-- Top Bar -->
    <n-card size="small" class="rounded-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 font-bold text-sm">
            <PenTool class="w-4 h-4 text-indigo-500" />
            <span>正文创作工作台</span>
          </div>

          <div class="w-64">
            <n-select
              v-model:value="selectedChapNum"
              :options="chapterSelectOptions"
              size="small"
              placeholder="选择章节"
              @update:value="loadChapterDetail"
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <n-button size="small" secondary :loading="saving" @click="saveChapter">
            <template #icon><Save class="w-3.5 h-3.5" /></template>
            {{ saving ? '保存中...' : '手动保存正文' }}
          </n-button>

          <n-button
            type="primary"
            size="small"
            :loading="writing"
            @click="triggerWritePipeline"
          >
            <template #icon><Zap class="w-4 h-4" /></template>
            AI 一条龙生成与写章 (/webnovel-write)
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- Main Workspace -->
    <n-grid x-gap="16" y-gap="16" cols="1 lg:12" class="flex-1 overflow-hidden">
      <!-- Left Sidebar: Outline, Characters, Foreshadowing -->
      <n-gi span="3" class="h-full">
        <n-card title="章节信息" size="small" class="h-full rounded-xl flex flex-col overflow-y-auto">
          <div class="space-y-4">
            <div>
              <div class="text-xs font-bold opacity-75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText class="w-3.5 h-3.5 text-indigo-500" />
                <span>本章细纲与看点</span>
              </div>
              <n-input
                v-model:value="currentChap.outline"
                type="textarea"
                placeholder="输入本章大纲..."
                :rows="4"
                @blur="saveChapter"
              />
            </div>

            <div class="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div class="text-xs font-bold opacity-75 uppercase tracking-wider flex items-center gap-1.5">
                <Users class="w-3.5 h-3.5 text-purple-500" />
                <span>关联登场角色</span>
              </div>
              <div class="space-y-1.5">
                <div v-for="char in characters" :key="char.id" class="p-2 rounded border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                  <span class="font-medium text-indigo-500">{{ char.name }}</span>
                  <n-tag size="small" type="purple" :bordered="false">{{ char.cultivation }}</n-tag>
                </div>
              </div>
            </div>

            <div class="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div class="text-xs font-bold opacity-75 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit class="w-3.5 h-3.5 text-emerald-500" />
                <span>悬挂未回收伏笔</span>
              </div>
              <div class="space-y-1.5">
                <div v-for="f in foreshadowings.slice(0, 3)" :key="f.id" class="p-2 rounded border border-slate-200 dark:border-slate-800 text-[11px]">
                  <div class="font-semibold text-emerald-500">{{ f.title }}</div>
                  <div class="opacity-75 line-clamp-1 mt-0.5">{{ f.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- Main Editor -->
      <n-gi span="6" class="h-full">
        <n-card size="small" class="h-full rounded-xl flex flex-col">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
            <n-input
              v-model:value="currentChap.title"
              placeholder="章节标题"
              size="medium"
              class="font-bold text-base w-2/3"
              @blur="saveChapter"
            />
            <span class="font-mono text-xs opacity-75">{{ currentChap.content?.length || 0 }} 字</span>
          </div>

          <n-input
            v-model:value="currentChap.content"
            type="textarea"
            placeholder="输入或点击【AI 一条龙生成】自动生成正文..."
            class="flex-1 text-sm font-sans"
            style="height: calc(100% - 3.5rem);"
          />
        </n-card>
      </n-gi>

      <!-- Right Panel: AI Status & Review Report -->
      <n-gi span="3" class="h-full">
        <n-card title="AI 审查与建议" size="small" class="h-full rounded-xl flex flex-col overflow-y-auto">
          <div v-if="writing" class="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold text-indigo-500">
              <n-spin size="small" />
              <span>AI 写章流水线执行中...</span>
            </div>
            <div class="space-y-1 text-[11px] font-mono">
              <div class="text-emerald-500">✓ 1. RAG 状态与上下文调取</div>
              <div class="text-emerald-500">✓ 2. 正文生成与情节描摹</div>
              <div class="text-indigo-500">⟳ 3. 多维质量与爽点审查</div>
              <div class="opacity-50">○ 4. 事实提取与 commit 入账</div>
            </div>
          </div>

          <div v-if="currentChap.review_report" class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-emerald-500" />
                <span>多维审查报告</span>
              </div>
              <n-tag type="success" size="medium" class="font-mono font-bold">
                {{ currentChap.review_score }}分
              </n-tag>
            </div>

            <n-grid x-gap="8" y-gap="8" cols="2">
              <n-gi>
                <n-card size="small" class="rounded-lg text-center">
                  <div class="text-xs opacity-75">爽点看点</div>
                  <div class="font-mono font-bold text-indigo-500 text-base">{{ parsedReview.cool_points_score || '--' }}</div>
                </n-card>
              </n-gi>
              <n-gi>
                <n-card size="small" class="rounded-lg text-center">
                  <div class="text-xs opacity-75">设定一致性</div>
                  <div class="font-mono font-bold text-purple-500 text-base">{{ parsedReview.consistency_score || '--' }}</div>
                </n-card>
              </n-gi>
              <n-gi>
                <n-card size="small" class="rounded-lg text-center">
                  <div class="text-xs opacity-75">节奏控制</div>
                  <div class="font-mono font-bold text-pink-500 text-base">{{ parsedReview.pacing_score || '--' }}</div>
                </n-card>
              </n-gi>
              <n-gi>
                <n-card size="small" class="rounded-lg text-center">
                  <div class="text-xs opacity-75">章尾追读钩子</div>
                  <div class="font-mono font-bold text-emerald-500 text-base">{{ parsedReview.retention_score || '--' }}</div>
                </n-card>
              </n-gi>
            </n-grid>

            <div v-if="parsedReview.suggestions" class="space-y-1 text-xs">
              <div class="font-semibold">主编改进建议:</div>
              <ul class="list-disc list-inside opacity-90 space-y-1">
                <li v-for="(sug, idx) in parsedReview.suggestions" :key="idx">{{ sug }}</li>
              </ul>
            </div>
          </div>

          <n-empty v-else-if="!writing" description="点击顶部【AI 一条龙生成】自动写章并触发审查" class="py-8 text-xs" />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { NCard, NGrid, NGi, NSelect, NButton, NInput, NTag, NSpin, NEmpty } from 'naive-ui';
import { PenTool, Save, Zap, FileText, Users, GitCommit, ShieldCheck } from 'lucide-vue-next';

const route = useRoute();
const projectStore = useProjectStore();

const chapters = ref<any[]>([]);
const selectedChapNum = ref(1);
const currentChap = ref<any>({ title: '', outline: '', content: '', review_score: 0, review_report: '' });
const characters = ref<any[]>([]);
const foreshadowings = ref<any[]>([]);

const saving = ref(false);
const writing = ref(false);

const chapterSelectOptions = computed(() => {
  return chapters.value.map(c => ({
    label: `第 ${c.chapter_num} 章：${c.title} (${c.word_count || 0}字)`,
    value: c.chapter_num,
  }));
});

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
