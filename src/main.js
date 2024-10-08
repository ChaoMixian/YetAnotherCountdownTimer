const { app, BrowserWindow, ipcMain, screen, Menu, Tray } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isAlwaysOnTop = false;

let Store;
let store;

function setAutoStart(enable) {
  if (process.platform === 'win32') {
    // Windows 平台设置开机自启
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath
    });
  } else if (process.platform === 'linux') {
    // Linux 平台放弃了
  }
}

async function initConfig() {
  // 动态加载 electron-store
  Store = (await import('electron-store')).default;
  // 获取应用版本
  const appVersion = app.getVersion();
  // 定义默认配置
  let defaultConfig;  // 在函数作用域内声明 defaultConfig

  // 默认配置
  defaultConfig = {
    version: appVersion,
    autoStart: true,
    targetTitle: '距离一模还有',
    targetDate: '2024-11-03T00:00:00',
  };

  // 创建 Store 实例并设置默认值
  store = new Store({
    defaults: defaultConfig // 使用默认配置
  });

  // 检查配置中的 autoStart 值
  const autoStart = store.get('autoStart', true); // 如果未设置，则默认为 true
  setAutoStart(autoStart); // 根据配置设置开机自启

  // 读取配置文件并发送给渲染进程
  const targetTitle = store.get('targetTitle');
  const targetDate = store.get('targetDate');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('load-title-config', targetTitle);
    mainWindow.webContents.send('load-date-config', targetDate);
  });


  console.log(store.get('version')); // 打印当前版本
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
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
  mainWindow.setAlwaysOnTop(isAlwaysOnTop); // 默认不启用置顶
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

}

function createTray() {
  // 系统托盘： window 系统
  if (process.platform === 'win32') {
    const icon = path.join(__dirname, '../assets/icon.ico');

    // 创建托盘实例
    tray = new Tray(icon);

    let menu = Menu.buildFromTemplate([
      {
        label: '开机启动',
        checked: app.getLoginItemSettings().openAtLogin, // 获取当前自启动状态
        type: 'checkbox',
        click: () => {
          const openAtLogin = !app.getLoginItemSettings().openAtLogin;
          if (!app.isPackaged) { // 生成环境
            app.setLoginItemSettings({
              openAtLogin,
              path: process.execPath
            });
          } else {
            app.setLoginItemSettings({ openAtLogin });
          }
        }
      },
      {
        label: '退出',
        click: () => app.quit()
      }
    ]);

    // 鼠标悬停时显示的文本
    tray.setToolTip('YACT');
    // 设置上下文菜单
    tray.setContextMenu(menu);
    // 绑定点击事件：控制窗口显示和隐藏
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }
}

// 设置窗口
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus(); // 如果窗口已经存在，聚焦它
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  settingsWindow.loadFile('src/settings.html'); // 加载设置窗口的 HTML 文件
  settingsWindow.on('closed', () => {
    settingsWindow = null; // 窗口关闭时销毁引用
  });
}

// 监听 IPC 事件
ipcMain.on('settings', () => {
  createSettingsWindow();
});

ipcMain.on('toggle-top', () => {
  isAlwaysOnTop = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!isAlwaysOnTop); // 切换置顶状态
  mainWindow.webContents.send('update-top-icon', !isAlwaysOnTop); // 发送置顶状态到渲染进程
});

ipcMain.on('close', () => {
  app.quit(); // 退出应用
});

// 监听 'open-config' 事件，打开配置文件
ipcMain.on('open-config', () => {
  const configPath = store.path; // Electron Store 的默认配置文件路径
  if (process.platform === 'linux') {
    exec(`xdg-open "${configPath}"`, (error) => {
      if (error) {
        console.error(`打开文件出错: ${error.message}`);
      }
    });
  } else if (process.platform === 'win32') {
    exec(`start "" "${configPath}"`, (error) => {
      if (error) {
        console.error(`打开文件出错: ${error.message}`);
      }
    });
  }
});

ipcMain.on('save-settings', (event, settings) => {
  console.log('保存设置:', settings);

  if (settings.autoStart) {
    app.setLoginItemSettings({ openAtLogin: true });
  } else {
    app.setLoginItemSettings({ openAtLogin: false });
  }

  if (settingsWindow) {
    settingsWindow.close(); // 保存后关闭设置窗口
  }
});



if (process.platform === 'win32') {
  // 应用是否打包
  if (app.isPackaged) {
    // 设置开机启动
    app.setLoginItemSettings({
      openAtLogin: true
    });
  }
}


app.whenReady().then(() => {
  initConfig();
  createWindow();
  createTray();

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
