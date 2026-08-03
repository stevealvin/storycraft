<template>
  <div class="space-y-8">
    <!-- Header Banner Card -->
    <n-card :bordered="false" class="rounded-2xl shadow-sm relative overflow-hidden">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="inline-flex items-center gap-2">
            <n-tag type="primary" size="small" round :bordered="false">
              <template #icon>
                <Sparkles class="w-3.5 h-3.5" />
              </template>
              长篇网文一致性创作引擎
            </n-tag>
          </div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ projectStore.currentProject?.title || '欢迎来到 StoryCraft' }}
          </h1>
          <p class="text-sm opacity-80 leading-relaxed">
            {{ projectStore.currentProject?.premise || '选择或创建一个小说作品，使用全套 AI 辅助流程完成立意、卷纲、写章、一致性审查与伏笔沉淀。' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link to="/studio">
            <n-button type="primary" size="medium" secondary icon-placement="left">
              <template #icon>
                <PenTool class="w-4 h-4" />
              </template>
              进入正文创作
            </n-button>
          </router-link>
          <router-link to="/wizard">
            <n-button size="medium" secondary icon-placement="left">
              <template #icon>
                <Plus class="w-4 h-4" />
              </template>
              初始化新书
            </n-button>
          </router-link>
        </div>
      </div>
    </n-card>

    <!-- Stats Grid with NGrid and NCard -->
    <n-grid x-gap="16" y-gap="16" cols="1 s:2 m:4" responsive="screen">
      <n-gi>
        <n-card hoverable class="h-full rounded-xl">
          <n-statistic label="总字数统计">
            <template #prefix>
              <BookOpen class="w-5 h-5 text-indigo-500 mr-1" />
            </template>
            <template #default>
              {{ projectStore.currentProject?.total_words?.toLocaleString() || 0 }}
            </template>
            <template #suffix>字</template>
          </n-statistic>
          <div class="mt-3 text-xs opacity-75 space-y-1">
            <div class="flex justify-between">
              <span>目标: {{ ((projectStore.currentProject?.target_words || 1000000) / 10000).toFixed(0) }} 万字</span>
            </div>
            <n-progress
              type="line"
              :percentage="Math.min(100, Math.round(((projectStore.currentProject?.total_words || 0) / (projectStore.currentProject?.target_words || 1000000)) * 100))"
              :indicator-placement="'inside'"
              processing
            />
          </div>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card hoverable class="h-full rounded-xl">
          <n-statistic label="已拆划分卷 / 章节">
            <template #prefix>
              <FolderTree class="w-5 h-5 text-purple-500 mr-1" />
            </template>
            <template #default>
              {{ projectStore.currentProject?.chapters_count || 0 }}
            </template>
            <template #suffix>章</template>
          </n-statistic>
          <div class="mt-3 text-xs opacity-75">
            第 <span class="font-bold text-purple-500 font-mono">{{ projectStore.currentProject?.volumes_count || 1 }}</span> 卷大纲规划中
          </div>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card hoverable class="h-full rounded-xl">
          <n-statistic label="活跃角色与实体">
            <template #prefix>
              <Users class="w-5 h-5 text-pink-500 mr-1" />
            </template>
            <template #default>
              {{ projectStore.currentProject?.characters_count || 0 }}
            </template>
            <template #suffix>位</template>
          </n-statistic>
          <div class="mt-3 text-xs opacity-75">
            登场人设与关系图谱在线
          </div>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card hoverable class="h-full rounded-xl">
          <n-statistic label="悬挂伏笔线索">
            <template #prefix>
              <GitCommit class="w-5 h-5 text-emerald-500 mr-1" />
            </template>
            <template #default>
              {{ projectStore.currentProject?.open_foreshadowings_count || 0 }}
            </template>
            <template #suffix>个待回收</template>
          </n-statistic>
          <div class="mt-3 text-xs text-emerald-500 flex items-center gap-1 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>一致性引擎自动跟踪</span>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Quick Pipeline Shortcuts -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <Zap class="w-5 h-5 text-indigo-500" />
        <h2 class="text-lg font-bold">核心创作流水线</h2>
      </div>

      <n-grid x-gap="16" y-gap="16" cols="1 s:2 m:4" responsive="screen">
        <n-gi>
          <router-link to="/wizard">
            <n-card hoverable class="cursor-pointer rounded-xl h-full">
              <div class="space-y-3">
                <n-tag type="primary" size="medium" class="font-semibold">
                  <template #icon><Sparkles class="w-4 h-4" /></template>
                  1. 深度初始化
                </n-tag>
                <p class="text-xs opacity-75 leading-relaxed">
                  分阶段问答，搭起书骨架、设定集与总纲
                </p>
              </div>
            </n-card>
          </router-link>
        </n-gi>

        <n-gi>
          <router-link to="/outline">
            <n-card hoverable class="cursor-pointer rounded-xl h-full">
              <div class="space-y-3">
                <n-tag type="info" size="medium" class="font-semibold">
                  <template #icon><FolderTree class="w-4 h-4" /></template>
                  2. 卷纲与细纲规划
                </n-tag>
                <p class="text-xs opacity-75 leading-relaxed">
                  拆卷、拆章、补时间线与伏笔计划
                </p>
              </div>
            </n-card>
          </router-link>
        </n-gi>

        <n-gi>
          <router-link to="/studio">
            <n-card hoverable class="cursor-pointer rounded-xl h-full">
              <div class="space-y-3">
                <n-tag type="warning" size="medium" class="font-semibold">
                  <template #icon><PenTool class="w-4 h-4" /></template>
                  3. 一条龙写章
                </n-tag>
                <p class="text-xs opacity-75 leading-relaxed">
                  备上下文 -> 起草 -> 审查 -> 提事实入账
                </p>
              </div>
            </n-card>
          </router-link>
        </n-gi>

        <n-gi>
          <router-link to="/review">
            <n-card hoverable class="cursor-pointer rounded-xl h-full">
              <div class="space-y-3">
                <n-tag type="success" size="medium" class="font-semibold">
                  <template #icon><ShieldCheck class="w-4 h-4" /></template>
                  4. 多维质量审查
                </n-tag>
                <p class="text-xs opacity-75 leading-relaxed">
                  爽点、一致性、OOC、节奏与追读力
                </p>
              </div>
            </n-card>
          </router-link>
        </n-gi>
      </n-grid>
    </div>

    <!-- Recent Chapters Table & Doctor Report -->
    <n-grid x-gap="20" y-gap="20" cols="1 l:3" responsive="screen">
      <n-gi span="2">
        <n-card title="最新章节列表" class="rounded-2xl h-full">
          <template #header-extra>
            <router-link to="/studio" class="text-xs text-indigo-500 hover:underline">去创作中心</router-link>
          </template>

          <n-empty v-if="chapters.length === 0" description="暂无章节大纲，点击上方【2. 卷纲与细纲规划】生成章节大纲。" class="py-10" />

          <n-list v-else hoverable clickable>
            <n-list-item v-for="chap in chapters.slice(0, 6)" :key="chap.id">
              <template #prefix>
                <n-tag :type="chap.status === 'draft' ? 'success' : 'default'" size="small">
                  {{ chap.status === 'draft' ? '已完成' : '规划中' }}
                </n-tag>
              </template>
              <n-thing :title="`第 ${chap.chapter_num} 章：${chap.title}`">
                <template #description>
                  <span class="text-xs opacity-75 line-clamp-1 max-w-md">{{ chap.outline || '无细纲' }}</span>
                </template>
              </n-thing>
              <template #suffix>
                <div class="flex items-center gap-3">
                  <span class="font-mono text-xs opacity-75">{{ chap.word_count || 0 }} 字</span>
                  <n-tag v-if="chap.review_score" :type="chap.review_score >= 80 ? 'success' : 'warning'" size="small">
                    {{ chap.review_score }}分
                  </n-tag>
                  <router-link :to="`/studio?chap=${chap.chapter_num}`">
                    <n-button size="small" type="primary" secondary>
                      写章
                    </n-button>
                  </router-link>
                </div>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </n-gi>

      <n-gi span="1">
        <n-card title="体检健康报告" class="rounded-2xl h-full">
          <template #header-extra>
            <router-link to="/doctor" class="text-xs text-purple-500 hover:underline font-mono">详情 &rarr;</router-link>
          </template>

          <div v-if="projectStore.doctorStatus" class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="text-3xl font-extrabold font-mono text-emerald-500">
                {{ projectStore.doctorStatus.health_score }}
                <span class="text-xs font-normal opacity-60">/ 100</span>
              </div>
              <div class="text-xs">
                <span>诊断: </span>
                <n-tag type="success" size="small">{{ projectStore.doctorStatus.status }}</n-tag>
              </div>
            </div>

            <n-list size="small">
              <n-list-item v-for="(check, idx) in projectStore.doctorStatus.checks" :key="idx">
                <div class="flex items-center justify-between text-xs w-full">
                  <span>{{ check.name }}</span>
                  <n-tag :type="check.status === 'pass' ? 'success' : 'warning'" size="small">
                    {{ check.status === 'pass' ? 'PASSED' : 'WARN' }}
                  </n-tag>
                </div>
              </n-list-item>
            </n-list>
          </div>
          <n-empty v-else description="暂无体检报告" class="py-6" />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { NCard, NGrid, NGi, NStatistic, NProgress, NTag, NButton, NEmpty, NList, NListItem, NThing } from 'naive-ui';
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
