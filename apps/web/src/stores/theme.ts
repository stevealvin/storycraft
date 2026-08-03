import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = localStorage.getItem('storycraft_theme');
  // Default to false (light theme/白色主题) if not saved, or use saved preference
  const isDark = ref<boolean>(savedTheme ? savedTheme === 'dark' : false);

  function toggleTheme() {
    isDark.value = !isDark.value;
    localStorage.setItem('storycraft_theme', isDark.value ? 'dark' : 'light');
    updateHtmlClass();
  }

  function setDark(val: boolean) {
    isDark.value = val;
    localStorage.setItem('storycraft_theme', isDark.value ? 'dark' : 'light');
    updateHtmlClass();
  }

  function updateHtmlClass() {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Initialize html class on load
  updateHtmlClass();

  return {
    isDark,
    toggleTheme,
    setDark,
  };
});
