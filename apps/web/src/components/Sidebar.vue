<template>
  <aside class="w-60 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
    <div class="py-4 px-3 space-y-6">
      <div>
        <div class="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">?????</div>
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
        <div class="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">????????</div>
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
  { name: '??????', path: '/', icon: LayoutDashboard },
  { name: '?? AI ???', path: '/wizard', icon: Sparkles },
  { name: '???????', path: '/outline', icon: FolderTree },
  { name: '???????', path: '/studio', icon: PenTool },
];

const subNav = [
  { name: '???????', path: '/characters', icon: Users },
  { name: '???????', path: '/foreshadowing', icon: GitCommit },
  { name: '????????', path: '/pacing', icon: TrendingUp },
  { name: '??????', path: '/review', icon: ShieldCheck },
  { name: '???? (Doctor)', path: '/doctor', icon: Stethoscope },
  { name: '???????', path: '/query', icon: Search },
  { name: '? API ?????', path: '/settings', icon: Settings },
];
</script>
