<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <!-- 给按钮加明确类型并保留原逻辑 -->
    <button type="button" @click="count++" aria-label="Increment counter">
      count is {{ count }}
    </button>

    <!-- 动态文本提示增加 aria-live -->
    <p aria-live="polite">
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank">
      Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs" aria-live="polite">
    Click on the Vite and Vue logos to learn more
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
