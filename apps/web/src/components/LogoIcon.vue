<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
    class="shrink-0 select-none inline-block transition-transform duration-200"
    :style="computedStyle"
  >
    <defs>
      <linearGradient id="navBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5"/>
        <stop offset="50%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#db2777"/>
      </linearGradient>

      <linearGradient id="navCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#e0e7ff" stop-opacity="0.75"/>
      </linearGradient>

      <linearGradient id="navSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>

    <!-- Full Squircle Background -->
    <rect x="0" y="0" width="128" height="128" rx="32" fill="url(#navBgGrad)"/>

    <!-- Glass Overlay -->
    <rect x="0" y="0" width="128" height="64" rx="32" fill="white" opacity="0.15"/>

    <!-- Wing Motif -->
    <path d="M 64 36 C 50 36, 32 44, 26 48 L 26 86 C 34 82, 50 76, 64 78 Z" fill="url(#navCoreGrad)" opacity="0.85"/>
    <path d="M 64 36 C 78 36, 96 44, 102 48 L 102 86 C 94 82, 78 76, 64 78 Z" fill="url(#navCoreGrad)"/>

    <!-- Central Pen Quill -->
    <path d="M 64 24 L 73 50 L 64 96 L 55 50 Z" fill="#ffffff"/>
    <path d="M 64 24 L 64 96 L 55 50 Z" fill="#c7d2fe" opacity="0.6"/>

    <!-- Sparkle Stars -->
    <path d="M 90 22 L 92.5 30.5 L 101 33 L 92.5 35.5 L 90 44 L 87.5 35.5 L 79 33 L 87.5 30.5 Z" fill="url(#navSparkGrad)"/>
    <path d="M 38 80 L 39.5 85 L 44.5 86.5 L 39.5 88 L 38 93 L 36.5 88 L 31.5 86.5 L 36.5 85 Z" fill="url(#navSparkGrad)" opacity="0.8"/>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 28, // Default compact size 28px
});

const computedStyle = computed(() => {
  const dimension = typeof props.size === 'number' ? `${props.size}px` : props.size;
  return {
    width: dimension,
    height: dimension,
  };
});
</script>
