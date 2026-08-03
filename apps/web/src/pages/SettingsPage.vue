<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings class="w-6 h-6 text-indigo-500" />
          <span>多 LLM API 接口提供商设置与切换</span>
        </h1>
        <p class="text-sm opacity-75 mt-1">配置与管理多个 OpenAI 兼容格式的大语言模型 API 接口，并随时进行无缝切换。</p>
      </div>

      <n-button type="primary" size="medium" @click="openAddModal">
        <template #icon><Plus class="w-4 h-4" /></template>
        添加新 API 接口
      </n-button>
    </div>

    <!-- API Config Cards Grid -->
    <n-grid x-gap="16" y-gap="16" cols="1 m:2" responsive="screen">
      <n-gi v-for="api in projectStore.apiProviders" :key="api.id">
        <n-card hoverable class="rounded-2xl h-full flex flex-col justify-between" :class="api.is_active ? 'border-2 border-emerald-500' : ''">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <Cpu class="w-5 h-5 text-indigo-500" />
                <div>
                  <div class="font-bold text-base flex items-center gap-2">
                    <span>{{ api.name }}</span>
                    <n-tag v-if="api.is_active" type="success" size="small">当前激活</n-tag>
                  </div>
                  <div class="text-xs opacity-75 font-mono mt-0.5">{{ api.model }}</div>
                </div>
              </div>
            </div>

            <div class="space-y-1 text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div><span class="opacity-60">Base URL: </span>{{ api.baseUrl }}</div>
              <div><span class="opacity-60">API Key: </span>{{ api.apiKey ? (api.apiKey.slice(0, 7) + '...' + api.apiKey.slice(-4)) : '未设置' }}</div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-4 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <n-button size="small" secondary :loading="testingId === api.id" @click="testApiConnection(api)">
                <template #icon><Wifi class="w-3.5 h-3.5 text-emerald-500" /></template>
                测试连通性
              </n-button>

              <n-button size="small" secondary @click="openEditModal(api)">
                <template #icon><Edit3 class="w-3.5 h-3.5 text-purple-500" /></template>
                编辑
              </n-button>
            </div>

            <div class="flex items-center gap-2">
              <n-button v-if="!api.is_active" type="success" size="small" secondary @click="projectStore.switchActiveApi(api.id)">
                <template #icon><CheckCircle2 class="w-3.5 h-3.5" /></template>
                设为激活
              </n-button>

              <n-button v-if="!api.is_active && projectStore.apiProviders.length > 1" type="error" size="small" secondary @click="deleteApi(api.id)">
                <template #icon><Trash2 class="w-3.5 h-3.5" /></template>
              </n-button>
            </div>
          </div>

          <!-- Test Result Banner -->
          <div v-if="testResults[api.id]" class="mt-3 p-2.5 rounded-lg text-xs font-mono">
            <n-tag :type="testResults[api.id].success ? 'success' : 'error'" class="w-full justify-start">
              {{ testResults[api.id].success ? '✓ 响应成功: ' + testResults[api.id].response : '✕ 连接失败: ' + testResults[api.id].error }}
            </n-tag>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- Modal for Adding/Editing API Provider -->
    <n-modal v-model:show="showModal" preset="card" :title="isEditing ? '编辑 API 配置' : '添加新 API 接口'" class="max-w-md rounded-2xl">
      <n-form size="medium">
        <n-form-item label="配置名称">
          <n-input v-model:value="form.name" placeholder="例如: DeepSeek 官方 / Qwen Max" />
        </n-form-item>
        <n-form-item label="API Base URL">
          <n-input v-model:value="form.baseUrl" placeholder="https://api.openai.com/v1" class="font-mono text-xs" />
        </n-form-item>
        <n-form-item label="Model Name">
          <n-input v-model:value="form.model" placeholder="gpt-4o / deepseek-v4-pro" class="font-mono text-xs" />
        </n-form-item>
        <n-form-item label="API Key">
          <n-input v-model:value="form.apiKey" type="password" show-password-on="mousedown" placeholder="sk-..." class="font-mono text-xs" />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="saveApiForm">保存配置</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useProjectStore, ApiProvider } from '@/stores/project';
import { NCard, NGrid, NGi, NButton, NModal, NForm, NFormItem, NInput, NTag } from 'naive-ui';
import { Settings, Plus, Cpu, Wifi, Edit3, Trash2, CheckCircle2 } from '@lucide/vue';

const projectStore = useProjectStore();

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  name: '',
  baseUrl: 'https://api.winfull.cloud-ip.cc/v1',
  model: 'deepseek-v4-pro',
  apiKey: 'sk-4AsPtdjfiy4PW67Q8rDkVIpO1w1oWhFDgT0w6rTAtCHjQkiF',
});

const testingId = ref<string | null>(null);
const testResults = reactive<Record<string, any>>({});

onMounted(() => {
  projectStore.fetchApiProviders();
});

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.name = 'DeepSeek 备用节点';
  form.baseUrl = 'https://api.winfull.cloud-ip.cc/v1';
  form.model = 'deepseek-v4-pro';
  form.apiKey = 'sk-4AsPtdjfiy4PW67Q8rDkVIpO1w1oWhFDgT0w6rTAtCHjQkiF';
  showModal.value = true;
}

function openEditModal(api: ApiProvider) {
  isEditing.value = true;
  editingId.value = api.id;
  form.name = api.name;
  form.baseUrl = api.baseUrl;
  form.model = api.model;
  form.apiKey = api.apiKey;
  showModal.value = true;
}

async function saveApiForm() {
  if (isEditing.value && editingId.value) {
    await projectStore.updateApiProvider(editingId.value, { ...form });
  } else {
    await projectStore.addApiProvider({ ...form });
  }
  showModal.value = false;
}

async function deleteApi(id: string) {
  await projectStore.deleteApiProvider(id);
}

async function testApiConnection(api: ApiProvider) {
  testingId.value = api.id;
  try {
    const res = await fetch('/api/config/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: api.baseUrl,
        model: api.model,
        apiKey: api.apiKey,
      }),
    });
    testResults[api.id] = await res.json();
  } catch (err: any) {
    testResults[api.id] = { success: false, error: err?.message || String(err) };
  } finally {
    testingId.value = null;
  }
}
</script>
