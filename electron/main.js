"use strict";
const { app, BrowserWindow, globalShortcut } = require("electron");
var tabConfig = require("./tabConfig");
var utils = require("./utils");
const path = require("path");

var mainWindow;
var homeMaxHeight = 36;
var createNewTabs;
var createWindow = function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.webContents.loadURL("http://localhost:8081/");
  createNewTabs = new tabConfig.CreateNewTabs(mainWindow, homeMaxHeight);
  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    mainWindow = null;
    createNewTabs.destroyAllBrowserView();
  });
  mainWindow.once("ready-to-show", function () {
    mainWindow.show();
  });
};
app.on("ready", function () {
  createWindow();
  createNewTabs.init();
  globalShortcut.register("CmdOrCtrl+Alt+C", function () {
    utils.DEVTOOLS(mainWindow);
  });
});
// Quit when all windows are closed.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
    mainWindow = null;
    createNewTabs.destroyAllBrowserView();
  }
});
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
    createNewTabs.init();
  }
});
