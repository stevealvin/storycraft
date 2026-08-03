<template>
  <n-config-provider :theme="activeTheme" :theme-overrides="activeThemeOverrides">
    <n-global-style />
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <div class="h-screen w-screen overflow-hidden flex flex-col relative transition-colors duration-300"
            :class="themeStore.isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-100/90 text-slate-900'">
            <!-- Subtle Ambient Background Glows -->
            <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div class="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <!-- Floating Top Navbar -->
            <div class="px-2.5 pt-2.5 z-40 flex-none">
              <Navbar />
            </div>

            <!-- Main Layout with Fixed Sidebar & Inner Scroll Content -->
            <div class="flex flex-1 px-2.5 py-2.5 gap-2.5 overflow-hidden h-[calc(100vh-4.25rem)]">
              <Sidebar />
              <main class="flex-1 overflow-y-auto h-full w-full pr-1">
                <div class="max-w-7xl mx-auto p-2">
                  <router-view />
                </div>
              </main>
            </div>
          </div>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NConfigProvider, NGlobalStyle, NMessageProvider, NNotificationProvider, NDialogProvider, darkTheme, GlobalThemeOverrides } from 'naive-ui';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

const activeTheme = computed(() => {
  return themeStore.isDark ? darkTheme : null;
});

// Global rounded corner configuration for components (Card, Button, Input, Modal, Tag, etc.)
const commonBorderRadius = {
  borderRadius: '12px',
  borderRadiusSmall: '8px',
  borderRadiusMedium: '12px',
  borderRadiusLarge: '16px',
};

const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    ...commonBorderRadius,
    primaryColor: '#6366f1',
    primaryColorHover: '#818cf8',
    primaryColorPressed: '#4f46e5',
    cardColor: 'rgba(15, 23, 42, 0.75)',
    modalColor: '#0f172a',
    bodyColor: '#0b0f19',
  },
  Card: {
    borderRadius: '16px',
  },
  Button: {
    borderRadiusTiny: '6px',
    borderRadiusSmall: '8px',
    borderRadiusMedium: '10px',
    borderRadiusLarge: '14px',
  },
  Input: {
    borderRadius: '10px',
  },
  Modal: {
    borderRadius: '16px',
  },
  Tag: {
    borderRadius: '8px',
  },
};

const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    ...commonBorderRadius,
    primaryColor: '#4f46e5',
    primaryColorHover: '#6366f1',
    primaryColorPressed: '#4338ca',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    bodyColor: '#f1f5f9',
  },
  Card: {
    borderRadius: '16px',
  },
  Button: {
    borderRadiusTiny: '6px',
    borderRadiusSmall: '8px',
    borderRadiusMedium: '10px',
    borderRadiusLarge: '14px',
  },
  Input: {
    borderRadius: '10px',
  },
  Modal: {
    borderRadius: '16px',
  },
  Tag: {
    borderRadius: '8px',
  },
};

const activeThemeOverrides = computed(() => {
  return themeStore.isDark ? darkThemeOverrides : lightThemeOverrides;
});
</script>
