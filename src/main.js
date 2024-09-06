const { app, BrowserWindow, ipcMain, screen, Menu, Tray } = require('electron');
const { platform } = require('os');
const path = require('path');

const mainWindow = null
let tray = null

// 创建托盘
function createTray() {
  // 系统托盘： window 系统
  if (process.platform === 'win32') {
    const icon =
      process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '../assets/icon.ico')
        : path.join(__dirname, '../assets/icon.ico') // 指定托盘图标，推荐使用 ico 图标。

    // 创建托盘实例
    tray = new Tray(icon)
    // 上面托盘实例创建了，需要定义托盘中的 Menu 选项。
    // 这里使用 buildFromTemplate 静态方法。
    // 第一个：开机自启动
    // 第二个：退出
    let menu = Menu.buildFromTemplate([
      {
        label: '开机启动',
        checked: app.getLoginItemSettings().openAtLogin, // 获取当前自启动状态
        type: 'checkbox',
        click: () => {
          // 点击事件：切换自启动
          if (!app.isPackaged) { // 生成环境
            app.setLoginItemSettings({
              openAtLogin: !app.getLoginItemSettings().openAtLogin,
              path: process.execPath
            })
          } else {
            app.setLoginItemSettings({
              openAtLogin: !app.getLoginItemSettings().openAtLogin
            })
          }
        }
      },
      {
        label: '退出',
        click: function () {
          app.quit()
          app.quit()
        }
      }
    ])
    // 鼠标悬停时显示的文本
    tray.setToolTip('YACT')
    // 设置上下文菜单
    tray.setContextMenu(menu)
    // 绑定点击事件：控制 窗口显示和隐藏。
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    })
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false, // 去掉窗口边框
    transparent: true, // 使窗口透明
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: true, // 确保 nodeIntegration 为 true
      contextIsolation: false, // 解决require is not defined
    }
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.setSkipTaskbar(true); // 隐藏任务栏图标

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

  // 系统托盘： window 系统
  if (process.platform === 'win32') {
    const icon =
      process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '../assets/icon.ico')
        : path.join(__dirname, '../assets/icon.ico') // 指定托盘图标，推荐使用 ico 图标。

    // 创建托盘实例
    tray = new Tray(icon)
    // 上面托盘实例创建了，需要定义托盘中的 Menu 选项。
    // 这里使用 buildFromTemplate 静态方法。
    // 第一个：开机自启动
    // 第二个：退出
    let menu = Menu.buildFromTemplate([
      {
        label: '开机启动',
        checked: app.getLoginItemSettings().openAtLogin, // 获取当前自启动状态
        type: 'checkbox',
        click: () => {
          // 点击事件：切换自启动
          if (!app.isPackaged) { // 生成环境
            app.setLoginItemSettings({
              openAtLogin: !app.getLoginItemSettings().openAtLogin,
              path: process.execPath
            })
          } else {
            app.setLoginItemSettings({
              openAtLogin: !app.getLoginItemSettings().openAtLogin
            })
          }
        }
      },
      {
        label: '退出',
        click: function () {
          app.quit()
          app.quit()
        }
      }
    ])
    // 鼠标悬停时显示的文本
    tray.setToolTip('YACT')
    // 设置上下文菜单
    tray.setContextMenu(menu)
    // 绑定点击事件：控制 窗口显示和隐藏。
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    })
  }

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

if (process.platform === 'win32') {
  //应用是否打包
  if (app.isPackaged) {
    //设置开机启动
    app.setLoginItemSettings({
      openAtLogin: true
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  // createTray();

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
