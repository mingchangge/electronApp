"use strict";const{app:n,BrowserWindow:s,shell:d,ipcMain:p,protocol:h}=require("electron"),{release:f}=require("node:os"),o=require("path"),l=process.env.NODE_ENV==="development",a=process.env.port||process.env.npm_config_port||8081;h.registerSchemesAsPrivileged([{scheme:"app",privileges:{secure:!0,standard:!0,stream:!0}}]);f().startsWith("6.1")&&n.disableHardwareAcceleration();process.platform==="win32"&&n.setAppUserModelId(n.getName());n.requestSingleInstanceLock()||(n.quit(),process.exit(0));let e=null;function c(){e=new s({width:1800,height:1600,minWidth:1e3,minHeight:800,webPreferences:{nodeIntegration:!0,contextIsolation:!1,preload:o.join(__dirname,"preload.js")}}),e.loadURL(l?`http://localhost:${a}`:`file://${o.join(__dirname,"../dist/index.html")}`),l&&e.webContents.openDevTools(),e.webContents.on("did-finish-load",()=>{e==null||e.webContents.send("main-process-message",new Date().toLocaleString())}),e.webContents.setWindowOpenHandler(({url:t})=>(t.startsWith("https:")&&d.openExternal(t),{action:"deny"}))}n.whenReady().then(c);n.on("activate",function(){const t=s.getAllWindows();t.length?t[0].focus():c()});n.on("second-instance",()=>{e&&(e.isMinimized()&&e.restore(),e.focus())});n.on("window-all-closed",function(){e=null,process.platform!=="darwin"&&n.quit()});p.handle("open-win",(t,i)=>{const r=new s({webPreferences:{preload,nodeIntegration:!0,contextIsolation:!1}});process.env.VITE_DEV_SERVER_URL?r.loadURL(`http://localhost:${a}#${i}`):r.loadFile(o.join(__dirname,"../dist/index.html"),{hash:i})});
