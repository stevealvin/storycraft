<template>
  <aside class="w-60 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
    <div class="py-4 px-3 space-y-6">
      <div>
        <div class="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">核心工作区</div>
        <nav class="space-y-1">
          <router-link v-for="item in mainNav" :key="item.path" :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
            :class="route.path === item.path ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'">
            <component :is="item.icon" class="w-4 h-4 transition-transform group-hover:scale-110" :class="route.path === item.path ? 'text-indigo-400' : 'text-slate-400'" />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <div>
        <div class="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">一致性与质量管控</div>
        <nav class="space-y-1">
          <router-link v-for="item in subNav" :key="item.path" :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
            :class="route.path === item.path ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'">
            <component :is="item.icon" class="w-4 h-4 transition-transform group-hover:scale-110" :class="route.path === item.path ? 'text-indigo-400' : 'text-slate-400'" />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>
    </div>

    <div class="p-4 border-t border-slate-900 text-xs text-slate-500 flex items-center justify-between">
      <span class="font-mono">npm workspaces</span>
      <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 text-[10px]">Monorepo</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
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
