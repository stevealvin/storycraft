<template>
  <aside
    class="h-full rounded-2xl p-2 backdrop-blur-2xl flex flex-col justify-between select-none transition-all duration-300 ease-in-out shadow-md relative flex-shrink-0 overflow-hidden"
    :class="[
      isCollapsed ? 'w-14' : 'w-56',
      themeStore.isDark ? 'bg-slate-900/70 shadow-slate-950/60 text-slate-100' : 'bg-white/80 shadow-slate-200/50 text-slate-900'
    ]"
  >
    <!-- Navigation Container -->
    <div class="space-y-3 overflow-y-auto flex-1 w-full overflow-x-hidden">
      <!-- Top Header & Collapse Toggle Button -->
      <div class="flex items-center justify-between px-1.5 pt-0.5 pb-1.5 border-b min-h-[34px]"
        :class="themeStore.isDark ? 'border-slate-800/60' : 'border-slate-200/60'">
        <span
          class="text-[11px] font-bold tracking-wider uppercase opacity-70 whitespace-nowrap overflow-hidden transition-all duration-300"
          :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-70'"
        >
          导航菜单
        </span>
        <button
          @click="toggleCollapse"
          class="p-1 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ml-auto"
          :class="themeStore.isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'"
          :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          <ChevronLeft v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300" />
          <ChevronRight v-else class="w-4 h-4 transition-transform duration-300" />
        </button>
      </div>

      <!-- Core Section 1 -->
      <div>
        <div class="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between min-h-[14px]">
          <span
            class="whitespace-nowrap overflow-hidden transition-all duration-300 opacity-60"
            :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-60'"
          >
            核心创作区
          </span>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : ''"></span>
        </div>

        <nav class="space-y-1">
          <n-tooltip v-for="item in mainNav" :key="item.path" :disabled="!isCollapsed" placement="right">
            <template #trigger>
              <router-link
                :to="item.path"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group overflow-hidden"
                :class="[
                  route.path === item.path
                    ? (themeStore.isDark ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-600 font-semibold')
                    : (themeStore.isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                ]"
              >
                <!-- Icon: fixed at left side, flex-shrink-0 -->
                <component
                  :is="item.icon"
                  class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"
                  :class="route.path === item.path ? (themeStore.isDark ? 'text-indigo-400' : 'text-indigo-600') : (themeStore.isDark ? 'text-slate-400' : 'text-slate-500')"
                />
                <!-- Text: no squeezing, smooth max-width and opacity transition -->
                <span
                  class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
                  :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'"
                >
                  {{ item.name }}
                </span>
              </router-link>
            </template>
            <span>{{ item.name }}</span>
          </n-tooltip>
        </nav>
      </div>

      <!-- Core Section 2 -->
      <div>
        <div class="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between min-h-[14px]">
          <span
            class="whitespace-nowrap overflow-hidden transition-all duration-300 opacity-60"
            :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-60'"
          >
            一致性与质量管控
          </span>
          <span class="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" :class="isCollapsed ? 'mx-auto' : ''"></span>
        </div>

        <nav class="space-y-1">
          <n-tooltip v-for="item in subNav" :key="item.path" :disabled="!isCollapsed" placement="right">
            <template #trigger>
              <router-link
                :to="item.path"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group overflow-hidden"
                :class="[
                  route.path === item.path
                    ? (themeStore.isDark ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-600 font-semibold')
                    : (themeStore.isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                ]"
              >
                <!-- Icon: fixed at left side, flex-shrink-0 -->
                <component
                  :is="item.icon"
                  class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"
                  :class="route.path === item.path ? (themeStore.isDark ? 'text-indigo-400' : 'text-indigo-600') : (themeStore.isDark ? 'text-slate-400' : 'text-slate-500')"
                />
                <!-- Text: no squeezing, smooth max-width and opacity transition -->
                <span
                  class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
                  :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'"
                >
                  {{ item.name }}
                </span>
              </router-link>
            </template>
            <span>{{ item.name }}</span>
          </n-tooltip>
        </nav>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NTooltip } from 'naive-ui';
import { useThemeStore } from '@/stores/theme';
import {
  LayoutDashboard,
  Sparkles,
  FolderTree,
  PenTool,
  Users,
  GitCommit,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight
} from '@lucide/vue';

const route = useRoute();
const themeStore = useThemeStore();

const isCollapsed = ref(false);

onMounted(() => {
  const saved = localStorage.getItem('sidebar_collapsed');
  if (saved !== null) {
    isCollapsed.value = saved === 'true';
  }
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar_collapsed', String(isCollapsed.value));
}

const mainNav = [
  { name: '项目概览看板', path: '/', icon: LayoutDashboard },
  { name: '新书 AI 初始化', path: '/wizard', icon: Sparkles },
  { name: '卷纲与章纲规划', path: '/outline', icon: FolderTree },
  { name: '正文创作工作台', path: '/studio', icon: PenTool },
];

const subNav = [
  { name: '角色与实体图谱', path: '/characters', icon: Users },
  { name: '伏笔与线索追踪', path: '/foreshadowing', icon: GitCommit },
  { name: '节奏与追读力分析', path: '/pacing', icon: TrendingUp },
  { name: '多维质量审查', path: '/review', icon: ShieldCheck },
  { name: '项目体检 (Doctor)', path: '/doctor', icon: Stethoscope },
  { name: '状态与知识检索', path: '/query', icon: Search },
  { name: '多 API 设置与管理', path: '/settings', icon: Settings },
];
</script>
