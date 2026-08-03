import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/pages/Dashboard.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/wizard', name: 'Wizard', component: () => import('@/pages/Wizard.vue') },
  { path: '/outline', name: 'Outline', component: () => import('@/pages/OutlineManager.vue') },
  { path: '/studio', name: 'Studio', component: () => import('@/pages/ChapterStudio.vue') },
  { path: '/characters', name: 'Characters', component: () => import('@/pages/CharactersPage.vue') },
  { path: '/foreshadowing', name: 'Foreshadowing', component: () => import('@/pages/ForeshadowingPage.vue') },
  { path: '/pacing', name: 'Pacing', component: () => import('@/pages/PacingPage.vue') },
  { path: '/review', name: 'Review', component: () => import('@/pages/ReviewPage.vue') },
  { path: '/doctor', name: 'Doctor', component: () => import('@/pages/DoctorPage.vue') },
  { path: '/query', name: 'Query', component: () => import('@/pages/QueryPage.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/pages/SettingsPage.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
