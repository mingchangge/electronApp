// 控制应用生命周期和创建原生浏览器窗口的模组
const {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  protocol,
  dialog,
  nativeTheme
} = require('electron')

const { autoUpdater } = require('electron-updater')
const { release } = require('node:os')
const path = require('path')
const fs = require('fs')
const log = require('electron-log')

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
])
// 禁用 Windows 7 的 GPU 加速
if (release().startsWith('6.1')) app.disableHardwareAcceleration()
// 为 Windows 10+ 通知设置应用程序名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName())
//
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let mainWindow = null
let userIndex = 0

function startUpdater() {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: ''// 下载地址，不加后面的**.exe
  })

  // 更新检查定时任务
  const updateIntval = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 1000 * 60 * 5)

  // 启动就检查一次更新
  autoUpdater.checkForUpdates()
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    // 一次下载成功后，清除定时器，不再检查更新
    clearInterval(updateIntval)
    const dialogOpts = {
      type: 'info',
      buttons: ['退出并更新', '稍后更新'],
      title: '某应用更新',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '某应用新版本已经发布， 退出程序后将自动安装更新。'
    }

    dialog.showMessageBox(mainWindow, dialogOpts).then(returnValue => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })
}

let mainURL = app.isPackaged
  ? `file://${path.join(__dirname, '../dist/index.html')}`
  : `${process.env.VITE_DEV_SERVER_URL}`

async function createWindow() {
  // 创建浏览器窗口
  const partition = 'persist:user-' + userIndex
  userIndex++

  let mWindow = new BrowserWindow({
    show: false,
    width: loginWindowSize.width,
    height: loginWindowSize.height,
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      spellcheck: false,
      nodeIntegration: true, //在渲染进程启用Node.js
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webPreferences: {
        partition: partition
      }
    },
    autoHideMenuBar: false //electron 工具栏
    // backgroundColor: '#165dff'
  })

  mWindow.loadURL(mainURL)
  mWindow.once('ready-to-show', () => {
    mWindow.show()
  })
  if (!app.isPackaged) {
    // 打开开发工具
    mWindow.webContents.openDevTools()
  }
  // Test actively push message to the Electron-Renderer
  mWindow.webContents.on('did-finish-load', () => {
    mWindow?.webContents.send(
      'main-process-message',
      new Date().toLocaleString()
    )

    // macOS上第一次打开时，检查是否有scheme传入
    if (deeplinkingURL) {
      mWindow.webContents.send('scheme-change', deeplinkingURL)
      deeplinkingURL = null
    }

    // windows上第一次打开时，检查是否有scheme传入
    // 因为open-url事件只有macOS才支持
    if (process.platform === 'win32' && userIndex == 1) {
      const url = process.argv[process.argv.length - 1]
      if (url.startsWith(defaultProtocol)) {
        mWindow.webContents.send('scheme-change', url)
      }
    }
  })

  // Make all links open with the browser, not with the application
  mWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:'))
      shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!mainWindow) {
    mainWindow = mWindow
  }

  return new Promise(resolve => {
    resolve(mWindow)
  })
}

const loginWindowSize = { width: 1170, height: 850 }
const mainWindowSize = { width: 1800, height: 1000 }

function calculateSize() {
  // 探测屏幕测尺寸
  const electron = require('electron')
  let dimension = electron.screen.getPrimaryDisplay().size

  // 使用探测到的屏幕大小，但是不要使用太大的尺寸
  // 因为目前应用的设计主要是用1080p的屏幕为主的
  // 设置太大的尺寸的屏幕，例如iMac 27'上就太大了
  // 而对于小屏幕，比如13寸的macbook,设置到全屏幕
  if (dimension.width <= mainWindowSize.Width) {
    mainWindowSize.width = dimension.width
  }
  if (dimension.height <= mainWindowSize.height) {
    mainWindowSize.height = dimension.height
  }
  log.info('screen size:', dimension, 'use size:', mainWindowSize)
}

function installIPCHandle() {
  // 新建登录窗口，方便使用不同的账户测试
  ipcMain.on('new-login-window', () => {
    log.info('new-login-window')
    createWindow()
  })

  // 登录成功修改窗口大小
  ipcMain.on('after-login', event => {
    log.info('login')
    const mWindow = BrowserWindow.fromWebContents(event.sender)
    mWindow.setSize(mainWindowSize.width, mainWindowSize.height)
    mWindow.center()
  })

  // 登出恢复登录窗口大小
  ipcMain.on('after-logout', event => {
    log.info('logout')
    const mWindow = BrowserWindow.fromWebContents(event.sender)
    mWindow.setSize(loginWindowSize.width, loginWindowSize.height)
    mWindow.center()
  })

  // 获取App信息
  ipcMain.handle('get-app-info', () => {
    return {
      name: app.getName(),
      version: app.getVersion()
    }
  })

  ipcMain.handle('toggle-dark-mode', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('open-local-file', (event, filename) => {
    if (!filename) {
      return Promise.reject(new Error('filename is empty'))
    }

    const docDir = app.getPath('documents')
    const filePath = path.join(docDir, filename)
    let sfile = `${path.join(__dirname, `../dist/static/${filename}`)}`

    const openExt = (filename, parent) => {
      if (filename.endsWith('.jm')) {
        return shell.openPath(parent)
      } else {
        return shell.openPath(filename).catch(err => {
          shell.openPath(parent)
          throw err
        })
      }
    }

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        fs.readFile(sfile, (err, data) => {
          if (err) {
            reject(err)
            return
          }
          fs.writeFile(filePath, data, err => {
            if (err) {
              reject(err)
              return
            }
            openExt(filePath, docDir).then(resolve).catch(reject)
          })
        })
      } else {
        openExt(filePath, docDir).then(resolve).catch(reject)
      }
    })
  })
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app
  .whenReady()
  .then(calculateSize)
  .then(createWindow)
  .then(installIPCHandle)
//.then(startUpdater)//更新应用

// 注册协议 https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
const defaultProtocol = 'electron-vite-app'
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(defaultProtocol, process.execPath, [
      path.resolve(process.argv[1])
    ])
  }
} else {
  app.setAsDefaultProtocolClient(defaultProtocol)
}
// 注册协议的open-url事件
// windows需要不同的处理方式，需要在second-instance事件中处理
let deeplinkingURL = null
app.on('open-url', function (event, url) {
  event.preventDefault()
  if (!mainWindow) {
    deeplinkingURL = url
    createWindow()
  } else {
    mainWindow.webContents.send('scheme-change', url)
  }
})

app.on('activate', function () {
  // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
  // 打开的窗口，那么程序会重新创建一个窗口。
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
app.on('second-instance', (event, argv) => {
  if (mainWindow) {
    if (process.platform == 'win32') {
      const url = argv[argv.length - 1]
      if (url.startsWith(defaultProtocol)) {
        mainWindow.webContents.send('scheme-change', url)
      }
    }
    // Focus on the main window if the user tried to open another
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  mainWindow = null
  if (process.platform !== 'darwin') app.quit()
})
// New window example arg: new windows url
ipcMain.handle('open-win', () => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  childWindow.loadURL(mainURL)
})
app.disableHardwareAcceleration() //程序 ready 前禁用GPU加速
