"use strict";
const { BrowserView, ipcMain, globalShortcut } = require("electron");
var utils = require("./utils");

/**
 * 创建一个新的tab标签
 */
var CreateNewTabs = (function () {
  function CreateNewTabs(mainWindow, homeMaxHeight) {
    if (homeMaxHeight === 0) {
      homeMaxHeight = 36;
    }
    this.browserViewList = {}; // 用于存储某个tab标签的实例
    this.homeMaxHeight = 36; // 默认的首页tab高度
    this.mainWindow = mainWindow;
    this.homeMaxHeight = homeMaxHeight;
  }
  /**
   * 初始化程序
   * @returns void
   */
  CreateNewTabs.prototype.init = function () {
    // 监听
    this.onCreateBrowserView();
    this.onChangeTabBrowserView();
    this.onHomeBrowserView();
    this.onCloseBrowserView();
  };
  CreateNewTabs.prototype.getSize = function () {
    return this.mainWindow.getSize();
  };
  /**
   * 销毁所有BrowserView
   * @param {BrowserView} browserView:BrowserView
   * @returns void
   */
  CreateNewTabs.prototype.destroyAllBrowserView = function () {
    var _this = this;
    Object.keys(this.browserViewList).forEach(function (key) {
      _this.browserViewList[key].destroy();
    });
    this.browserViewList = {};
    this.lastBrowserView = null;
    this.nextRemoveBrowserView = null;
  };
  /**
   * 销毁一个BrowserView
   * @param {BrowserView} browserView:BrowserView
   * @returns void
   */
  CreateNewTabs.prototype.destroyBrowserView = function (browserView) {
    browserView.destroy();
  };
  /**
   * 移除一个BrowserView
   * @param {BrowserView} browserView:BrowserView
   * @returns void
   */
  CreateNewTabs.prototype.removeBrowserView = function (browserView) {
    this.mainWindow.removeBrowserView(browserView);
  };
  // 添加一个BrowserView
  CreateNewTabs.prototype.addBrowserView = function (browserView) {
    this.mainWindow.addBrowserView(browserView);
  };
  /**
   * 监听create-browser-view
   * @returns void
   */
  CreateNewTabs.prototype.onCreateBrowserView = function () {
    var _this = this;
    ipcMain.on("create-browser-view", function (_, arg) {
      _this.createBrowserView(arg);
    });
  };
  /**
   * 监听changetab-browser-view
   * @returns void
   */
  CreateNewTabs.prototype.onChangeTabBrowserView = function () {
    var _this = this;
    ipcMain.on("changetab-browser-view", function (_, arg) {
      _this.createBrowserView(arg);
    });
  };
  /**
   * 监听home-browser-view
   * @returns void
   */
  CreateNewTabs.prototype.onHomeBrowserView = function () {
    var _this = this;
    ipcMain.on("home-browser-view", function () {
      if (_this.lastBrowserView) {
        _this.removeBrowserView(_this.lastBrowserView);
      }
    });
  };
  /**
   * 监听close-browser-view
   * @returns void
   */
  CreateNewTabs.prototype.onCloseBrowserView = function () {
    var _this = this;
    ipcMain.on("close-browser-view", function (_, arg) {
      if (_this.browserViewList[`${arg.applicationKey}`]) {
        _this.removeBrowserView(_this.browserViewList[`${arg.applicationKey}`]);
        let _browserView = _this.browserViewList[`${arg.applicationKey}`];
        if ("webContents" in _browserView) {
          _browserView.webContents.destroy();
        }
        delete _this.browserViewList[`${arg.applicationKey}`];
      }
    });
  };
  /**
   * 添加一个BrowserView
   * @param {BrowserView} browserView:BrowserView
   * @returns void
   */
  CreateNewTabs.prototype.createBrowserView = function (arg) {
    var _this = this;
    var _a = this.getSize(),
      width = _a[0],
      height = _a[1];
    if (!this.browserViewList[`${arg.applicationKey}`]) {
      this.browserViewList[`${arg.applicationKey}`] = new BrowserView({
        webPreferences: { nodeIntegration: true },
      });
      this.browserViewList[`${arg.applicationKey}`].setAutoResize({
        width: true,
        height: true,
      });
      this.browserViewList[`${arg.applicationKey}`].webContents.loadURL(
        "" + arg.applicationUrl
      );
    } else {
      if (this.nextRemoveBrowserView) {
        this.removeBrowserView(this.nextRemoveBrowserView);
      }
    }
    this.addBrowserView(this.browserViewList[`${arg.applicationKey}`]);
    this.browserViewList[`${arg.applicationKey}`].setBounds({
      x: 0,
      y: this.homeMaxHeight,
      width: width,
      height: height - this.homeMaxHeight,
    });
    if (Object.keys(this.browserViewList).length > 1) {
      this.nextRemoveBrowserView =
        this.browserViewList[`${arg.applicationKey}`];
    }
    this.lastBrowserView = this.browserViewList[`${arg.applicationKey}`];
    globalShortcut.register("CmdOrCtrl+Alt+V", function () {
      utils.DEVTOOLS(_this.lastBrowserView);
    });
  };
  return CreateNewTabs;
})();
exports.CreateNewTabs = CreateNewTabs;
