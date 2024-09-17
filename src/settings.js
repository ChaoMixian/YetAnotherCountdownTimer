const { ipcRenderer } = require('electron');

// 获取表单元素
const autoStartCheckbox = document.getElementById('auto-start');
const saveButton = document.getElementById('save-settings');
const configButton = document.getElementById('open-config');

// 处理保存按钮点击事件
saveButton.addEventListener('click', () => {
    // 收集设置
    const settings = {
        autoStart: autoStartCheckbox.checked,
    };

    // 发送设置到主进程
    ipcRenderer.send('save-settings', settings);
});

// 处理保存按钮点击事件
configButton.addEventListener('click', () => {
    ipcRenderer.send('open-config');
});
