<template>
  <div id="app">
    <div class="tab-container">
      <ul class="tabs clearfix">
        <li
          class="tab"
          :class="{ active: tab.isActive }"
          v-for="tab in tabData"
          :key="tab.applicationKey"
          @click="changeTab(tab)"
        >
          <a href="#">{{ tab.applicationName }}</a>
          <div
            v-if="tab.showClose"
            class="close"
            @click.stop="closeTab(tab)"
          ></div>
        </li>
      </ul>
    </div>
    <div class="application-container" v-show="activeKey === 'Home'">
      <ul class="application-data-box">
        <li
          class="application-data"
          v-for="app in applicationData"
          :key="app.applicationKey"
          @click="openApplication(app)"
        >
          {{ app.applicationName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      applicationData: [
        {
          applicationKey: "Home",
          applicationName: "首页",
          applicationIcon: "",
          applicationUrl: "http://localhost:8888/#",
          isActive: true,
          isVisible: true,
          showClose: false,
        },
        {
          applicationKey: "Baidu",
          applicationName: "Baidu",
          applicationIcon: "",
          applicationUrl: "https://www.baidu.com",
          isActive: false,
          isVisible: false,
          showClose: true,
        },
        {
          applicationKey: "Google",
          applicationName: "Google",
          applicationIcon: "",
          applicationUrl: "https://www.google.com",
          isActive: false,
          isVisible: false,
          showClose: true,
        },
      ],
      activeKey: "Home",
      tabData: [],
    };
  },
  created() {
    this.tabData = this.applicationData.filter((app) => app.isVisible);
  },
  methods: {
    changeActive(application) {
      if (!window.electronAPI) return;
      // 当前要切换的tab与当前选中的tab相同时，不进行任何操作
      if (application.applicationKey === this.activeKey) {
        return;
      }
      this.applicationData.forEach((item) => {
        if (item.applicationKey === application.applicationKey) {
          item.isActive = true;
          item.isVisible = true;
          this.activeKey = application.applicationKey;
        } else {
          item.isActive = false;
        }
      });
      this.tabData = [];
      this.tabData = this.applicationData.filter((app) => app.isVisible);
    },
    /**
     * 切换标签页时触发
     */
    changeTab(application) {
      this.changeActive(application);
      if (application.applicationKey === "Home") {
        window.electronAPI.sendChangeBrowserView("home-browser-view", {
          applicationKey: application.applicationKey,
          applicationUrl: application.applicationUrl,
        });
      } else {
        window.electronAPI.sendChangeBrowserView("changetab-browser-view", {
          applicationKey: application.applicationKey,
          applicationUrl: application.applicationUrl,
        });
      }
    },
    /**
     * 打开标签页
     */
    openApplication(application) {
      this.changeActive(application);
      if (application.applicationKey === "Home") {
        window.electronAPI.sendChangeBrowserView("home-browser-view", {
          applicationKey: application.applicationKey,
          applicationUrl: application.applicationUrl,
        });
      } else {
        window.electronAPI.sendChangeBrowserView("create-browser-view", {
          applicationKey: application.applicationKey,
          applicationUrl: application.applicationUrl,
        });
      }
    },
    /**
     * 关闭标签页
     */
    closeTab(application) {
      this.applicationData.forEach((app) => {
        if (app.applicationKey === "Home") {
          app.isActive = true;
          app.isVisible = true;
          this.$forceUpdate();
          this.activeKey = app.applicationKey;
        }
        if (app.applicationKey === application.applicationKey) {
          app.isVisible = false;
          app.isActive = false;
        }
      });
      this.tabData = this.applicationData.filter((app) => app.isVisible);
      window.electronAPI.sendChangeBrowserView("close-browser-view", {
        applicationKey: application.applicationKey,
        applicationUrl: application.applicationUrl,
      });
    },
  },
};
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}
#app {
  // min-height: 100vh;
}
.tab-container {
  background: transparent;
  margin: 0;
  padding: 0;
  max-height: 35px;
  border-bottom: 1px solid #dcd7d782;
  display: flex;
  align-content: center;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  .tabs {
    flex: 1;
    margin: 0;
    list-style-type: none;
    line-height: 35px;
    max-height: 35px;
    overflow: hidden;
    display: flex;
    padding-right: 20px;
    .tab {
      -webkit-app-region: no-drag;
      margin: 5px -10px 0 0;
      border-top-right-radius: 25px 170px;
      border-top-left-radius: 20px 90px;
      padding: 0 30px 0 25px;
      height: 170px;
      background: #d8d6d6;
      position: relative;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
      min-width: 150px;
      text-align: center;
      a {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        text-decoration: none;
        color: #3c3a3a;
        font-size: 14px;
        line-height: 30px;
        height: 30px;
      }
      .close {
        background: url(../assets/images/close_tab.png);
        width: 16px;
        height: 15px;
        position: absolute;
        top: 8px;
        right: 20px;
        cursor: pointer;
        z-index: 99;
      }
      &::before,
      &::after {
        content: "";
        background: transparent;
        height: 20px;
        width: 20px;
        border-radius: 100%;
        border-width: 10px;
        top: 0px;
        border-style: solid;
        position: absolute;
      }
      &::before {
        border-color: transparent #d8d6d6 transparent transparent;
        transform: rotate(48deg);
        left: -23px;
      }
      &::after {
        border-color: transparent transparent transparent #d8d6d6;
        transform: rotate(-48deg);
        right: -17px;
      }
    }
    .active {
      z-index: 2;
      background: #ffffff;
      &::before {
        border-color: transparent #ffffff transparent transparent;
      }
      &::after {
        border-color: transparent transparent transparent #ffffff;
      }
    }
  }
}
.application-container {
  .application-data-box {
    display: flex;
    list-style: none;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    .application-data {
      width: 100px;
      height: 40px;
      line-height: 40px;
      background-color: #03a9f4;
      text-align: center;
      margin: 15px;
      cursor: pointer;
      color: #fff;
      font-size: 14px;
    }
  }
}
</style>
