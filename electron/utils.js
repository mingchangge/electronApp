exports.DEVTOOLS = (win) => {
  const isOpen = win.webContents.isDevToolsOpened();
  if (isOpen) {
    win.webContents.closeDevTools();
  } else {
    win.webContents.openDevTools();
  }
};
