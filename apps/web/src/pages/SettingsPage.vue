<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings class="w-6 h-6 text-indigo-400" />
          <span>? LLM API ??????????</span>
        </h1>
        <p class="text-slate-400 text-sm mt-1">??????? OpenAI ?????????? API ??,??????????</p>
      </div>

      <button @click="openAddModal"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20">
        <Plus class="w-4 h-4" />
        <span>??? API ??</span>
      </button>
    </div>

    <!-- API Config Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div v-for="api in projectStore.apiProviders" :key="api.id"
        class="glass-card p-6 rounded-2xl border transition-all space-y-4 relative"
        :class="api.is_active ? 'border-emerald-500/50 bg-slate-900/80 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-900/40'">

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <Cpu class="w-5 h-5" :class="api.is_active ? 'text-emerald-400' : 'text-slate-400'" />
            <div>
              <div class="font-bold text-slate-100 text-base flex items-center gap-2">
                <span>{{ api.name }}</span>
                <span v-if="api.is_active" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ????
                </span>
              </div>
              <div class="text-xs text-slate-400 font-mono mt-0.5">{{ api.model }}</div>
            </div>
          </div>
        </div>

        <div class="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div><span class="text-slate-500">Base URL: </span>{{ api.baseUrl }}</div>
          <div><span class="text-slate-500">API Key: </span>{{ api.apiKey ? (api.apiKey.slice(0, 7) + '...' + api.apiKey.slice(-4)) : '???' }}</div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div class="flex items-center gap-2">
            <button @click="testApiConnection(api)" :disabled="testingId === api.id"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Loader2 v-if="testingId === api.id" class="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <Wifi v-else class="w-3.5 h-3.5 text-emerald-400" />
              <span>?????</span>
            </button>

            <button @click="openEditModal(api)" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5">
              <Edit3 class="w-3.5 h-3.5 text-purple-400" />
              <span>??</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button v-if="!api.is_active" @click="projectStore.switchActiveApi(api.id)"
              class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>????</span>
            </button>

            <button v-if="!api.is_active && projectStore.apiProviders.length > 1" @click="deleteApi(api.id)"
              class="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-800/40">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Test Result Banner -->
        <div v-if="testResults[api.id]" class="p-2.5 rounded-lg text-xs font-mono"
          :class="testResults[api.id].success ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'">
          {{ testResults[api.id].success ? '? ????: ' + testResults[api.id].response : '? ????: ' + testResults[api.id].error }}
        </div>
      </div>
    </div>

    <!-- Modal for Adding/Editing API Provider -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
        <h3 class="font-bold text-slate-200 text-lg">{{ isEditing ? '?? API ??' : '??? API ??' }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">???? (?: DeepSeek ?? / Qwen Max)</label>
            <input v-model="form.name" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs text-slate-400 mb-1">API Base URL (?: https://api.winfull.cloud-ip.cc/v1)</label>
            <input v-model="form.baseUrl" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs text-slate-400 mb-1">Model Name (?: deepseek-v4-pro / gpt-4o)</label>
            <input v-model="form.model" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs text-slate-400 mb-1">API Key</label>
            <input v-model="form.apiKey" type="password" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showModal = false" class="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 text-xs">??</button>
          <button @click="saveApiForm" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium">????</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useProjectStore, ApiProvider } from '@/stores/project';
import { Settings, Plus, Cpu, Wifi, Edit3, Trash2, CheckCircle2, Loader2 } from 'lucide-vue-next';

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
  form.name = 'DeepSeek ????';
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
