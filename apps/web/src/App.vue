<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <div class="flex flex-1">
              <Sidebar />
              <main class="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
                <router-view />
              </main>
            </div>
          </div>
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NNotificationProvider, NDialogProvider, darkTheme, GlobalThemeOverrides } from 'naive-ui';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#6366f1',
    primaryColorHover: '#818cf8',
    primaryColorPressed: '#4f46e5',
    cardColor: 'rgba(15, 23, 42, 0.8)',
    modalColor: '#0f172a',
    bodyColor: '#090d16',
  },
};
</script>
