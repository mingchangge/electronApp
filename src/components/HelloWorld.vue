<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
const toggleTheme=async () =>{
  if(window.electronAPI){
    const isDark = await window.electronAPI.ToggleTheme()   
    if (isDark) {
      document.body.setAttribute('class', 'dark-theme')
    } else {
      document.body.setAttribute('class', '')
    }
  }
}

</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      <button type="button" @click="toggleTheme">切换主题</button>
    </p>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
