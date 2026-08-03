<template>
  <aside class="w-60 h-full rounded-2xl p-3.5 backdrop-blur-2xl flex flex-col justify-between select-none transition-all duration-300 shadow-md"
    :class="themeStore.isDark ? 'bg-slate-900/70 shadow-slate-950/60 text-slate-100' : 'bg-white/80 shadow-slate-200/50 text-slate-900'">
    <div class="space-y-5 overflow-y-auto flex-1 pr-1">
      <div>
        <div class="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between opacity-60">
          <span>核心创作区</span>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        </div>
        <nav class="space-y-1">
          <router-link v-for="item in mainNav" :key="item.path" :to="item.path"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group"
            :class="route.path === item.path
              ? (themeStore.isDark ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-600 font-semibold')
              : (themeStore.isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')">
            <component :is="item.icon" class="w-4 h-4 transition-transform group-hover:scale-110"
              :class="route.path === item.path ? (themeStore.isDark ? 'text-indigo-400' : 'text-indigo-600') : (themeStore.isDark ? 'text-slate-400' : 'text-slate-500')" />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <div>
        <div class="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between opacity-60">
          <span>一致性与质量管控</span>
          <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        </div>
        <nav class="space-y-1">
          <router-link v-for="item in subNav" :key="item.path" :to="item.path"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group"
            :class="route.path === item.path
              ? (themeStore.isDark ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-600 font-semibold')
              : (themeStore.isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')">
            <component :is="item.icon" class="w-4 h-4 transition-transform group-hover:scale-110"
              :class="route.path === item.path ? (themeStore.isDark ? 'text-indigo-400' : 'text-indigo-600') : (themeStore.isDark ? 'text-slate-400' : 'text-slate-500')" />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
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
  Settings
} from 'lucide-vue-next';

const route = useRoute();
const themeStore = useThemeStore();

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
