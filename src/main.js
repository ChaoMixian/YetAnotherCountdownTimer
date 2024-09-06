const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false, // 去掉窗口边框
    transparent: true, // 使窗口透明
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true, // 确保 nodeIntegration 为 true
      contextIsolation: false, // 解决require is not defined
    }
  });

  mainWindow.loadFile('src/index.html');

  // 获取屏幕的工作区域
  const { workArea } = screen.getPrimaryDisplay();
  const { width, height } = workArea;

  // 计算右上角的位置
  const x = width - mainWindow.getBounds().width;
  const y = 0;

  mainWindow.setBounds({
    x: x,
    y: y,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height
  });

  // 监听 IPC 事件
  ipcMain.on('toggle-top', () => {
    const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isAlwaysOnTop); // 切换置顶状态
    mainWindow.webContents.send('update-top-icon', !isAlwaysOnTop); // 发送置顶状态到渲染进程
  });

  ipcMain.on('close', () => {
    app.quit(); // 退出应用
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
