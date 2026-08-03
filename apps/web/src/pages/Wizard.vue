<template>
  <div class="max-w-4xl mx-auto space-y-8 py-4">
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2">
        <n-tag type="primary" size="small" round :bordered="false">
          <template #icon><Sparkles class="w-3.5 h-3.5" /></template>
          /webnovel-init 深度初始化
        </n-tag>
      </div>
      <h1 class="text-3xl font-bold tracking-tight">新书 AI 设定与大纲构建器</h1>
      <p class="text-sm opacity-75">分阶段 AI 问答，从题材立意、金手指、角色矩阵、世界观到全书四幕式总纲一步到位。</p>
    </div>

    <!-- Steps -->
    <n-card class="rounded-xl">
      <n-steps :current="currentStep + 1" status="process">
        <n-step title="选题材构想" description="确定题材与核心看点" />
        <n-step title="立意与金手指" description="书名、简介与核心设定" />
        <n-step title="角色矩阵人设" description="登场主角与配角" />
        <n-step title="世界观与总纲" description="力量体系与大纲" />
      </n-steps>
    </n-card>

    <!-- Step 1 -->
    <n-card v-if="currentStep === 0" title="第一步：选择题材与初步构想" class="rounded-2xl">
      <template #header-extra>
        <BookOpen class="w-5 h-5 text-indigo-500" />
      </template>

      <div class="space-y-6">
        <div>
          <label class="block text-xs font-medium opacity-75 mb-2">选择网文题材分类</label>
          <n-grid x-gap="12" y-gap="12" cols="2 s:4" responsive="screen">
            <n-gi v-for="g in genres" :key="g.name">
              <n-card
                hoverable
                size="small"
                class="cursor-pointer rounded-xl h-full"
                :class="selectedGenre === g.name ? 'border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : ''"
                @click="selectedGenre = g.name"
              >
                <div class="font-semibold text-sm">{{ g.name }}</div>
                <div class="text-xs opacity-75 mt-1 line-clamp-1">{{ g.description }}</div>
              </n-card>
            </n-gi>
          </n-grid>
        </div>

        <div>
          <label class="block text-xs font-medium opacity-75 mb-2">灵感/核心看点构想 (如主角金手指、反套路设定等)</label>
          <n-input
            v-model:value="userConcept"
            type="textarea"
            :rows="3"
            placeholder="例如：主角穿成退婚废柴，但绑定了【因果反转系统】，只要挨打或者被看不起就能疯狂爆出神级奖励..."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" size="medium" :loading="loading" @click="runStep1">
            <template #icon><Sparkles class="w-4 h-4" /></template>
            生成立意与书名
          </n-button>
        </div>
      </template>
    </n-card>

    <!-- Step 2 -->
    <n-card v-if="currentStep === 1" title="第二步：确定书名与核心爽点" class="rounded-2xl">
      <template #header-extra>
        <Sparkles class="w-5 h-5 text-indigo-500" />
      </template>

      <div class="space-y-6">
        <div>
          <label class="block text-xs font-medium opacity-75 mb-2">选择推荐书名</label>
          <n-grid x-gap="12" y-gap="12" cols="1 s:3" responsive="screen">
            <n-gi v-for="t in premiseResult.titles" :key="t">
              <n-card
                hoverable
                size="small"
                class="cursor-pointer rounded-xl text-center font-bold text-sm"
                :class="selectedTitle === t ? 'border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-500' : ''"
                @click="selectedTitle = t"
              >
                《{{ t }}》
              </n-card>
            </n-gi>
          </n-grid>
        </div>

        <n-form size="medium">
          <n-form-item label="作品简介">
            <n-input v-model:value="premiseResult.premise" type="textarea" :rows="3" />
          </n-form-item>

          <n-form-item label="金手指/核心能力运行逻辑">
            <n-input v-model:value="premiseResult.golden_finger" />
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <n-button @click="currentStep = 0">上一步</n-button>
          <n-button type="primary" :loading="loading" @click="runStep2">
            下一步：生成主要角色
          </n-button>
        </div>
      </template>
    </n-card>

    <!-- Step 3 -->
    <n-card v-if="currentStep === 2" title="第三步：登场角色人设矩阵" class="rounded-2xl">
      <template #header-extra>
        <Users class="w-5 h-5 text-indigo-500" />
      </template>

      <div class="space-y-4">
        <n-card v-for="(char, idx) in charactersResult" :key="idx" size="small" class="rounded-xl">
          <div class="space-y-3">
            <n-grid x-gap="12" cols="3">
              <n-gi>
                <n-input v-model:value="char.name" placeholder="角色姓名" font-weight="bold" />
              </n-gi>
              <n-gi>
                <n-input v-model:value="char.role" placeholder="角色定位" />
              </n-gi>
              <n-gi>
                <n-input v-model:value="char.cultivation" placeholder="境界等级" />
              </n-gi>
            </n-grid>
            <n-input v-model:value="char.description" type="textarea" :rows="2" placeholder="人设描述..." />
          </div>
        </n-card>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <n-button @click="currentStep = 1">上一步</n-button>
          <n-button type="primary" :loading="loading" @click="runStep3">
            下一步：生成世界观与力量体系
          </n-button>
        </div>
      </template>
    </n-card>

    <!-- Step 4 -->
    <n-card v-if="currentStep === 3" title="第四步：世界观、力量体系与四幕式总纲" class="rounded-2xl">
      <template #header-extra>
        <Globe class="w-5 h-5 text-indigo-500" />
      </template>

      <n-form size="medium" class="space-y-4">
        <n-form-item label="力量体系与境界划分">
          <n-input v-model:value="worldResult.power_system" type="textarea" :rows="4" class="font-mono text-xs" />
        </n-form-item>

        <n-form-item label="世界观背景与核心法则">
          <n-input v-model:value="worldResult.world_setting" type="textarea" :rows="4" class="text-xs" />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex justify-between">
          <n-button @click="currentStep = 2">上一步</n-button>
          <n-button type="success" size="medium" :loading="loading" @click="finishInit">
            <template #icon><CheckCircle2 class="w-4 h-4" /></template>
            完成初始化并创建项目
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { NCard, NSteps, NStep, NGrid, NGi, NButton, NInput, NForm, NFormItem, NTag } from 'naive-ui';
import { Sparkles, BookOpen, Users, Globe, CheckCircle2 } from '@lucide/vue';

const router = useRouter();
const projectStore = useProjectStore();

const currentStep = ref(0);
const loading = ref(false);

const genres = ref<any[]>([]);
const selectedGenre = ref('修仙');
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
    selectedTitle.value = premiseResult.value.titles[0] || '新网文作品';
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
