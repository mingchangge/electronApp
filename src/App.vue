<template>
  <!-- <div class="invert-restore">
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/electron.svg" class="logo electron" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue + Electron" />
  <PDFThumbnai :fileUrl="fileUrl" :width="400" :height="600" /> -->
  <TabSwitch />
</template>

<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import PDFThumbnai from "@/views/PDFThumbnai.vue";
import TabSwitch from "@/views/TabSwtich.vue";
import { ref } from "vue";

const fileUrl = ref(new URL(`./assets//pdf/2022.pdf`, import.meta.url).href);
</script>

<style lang="less" scoped>
@media screen {
  body {
    &.dark-theme {
      filter: invert(0.94) hue-rotate(180deg);
      img {
        filter: invert(1) hue-rotate(180deg);
      }
      .invert-restore,
      .table-button {
        filter: none;
        /* // 反转回去的，里面的东西，在去除反转 */
        img {
          filter: none;
        }
      }
    }
  }
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9feaf9);
}
</style>
