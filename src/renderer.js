const { ipcRenderer } = require('electron');

let targetDate = '2024-11-03T00:00:00'; // 目标日期

document.getElementById('settings').addEventListener('click', () => {
  ipcRenderer.send('settings');
});

document.getElementById('toggle-top').addEventListener('click', () => {
    ipcRenderer.send('toggle-top');
});

document.getElementById('close').addEventListener('click', () => {
    ipcRenderer.send('close');
});

function calculateCountdown(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const timeDifference = target - now;

  if (timeDifference <= 0) {
      return "Time's up!";
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  return `
    <span class="countdown">
        <span class="days">${days} 日</span> 
        <span class="hours">${hours} 时</span>
        <span class="minutes">${minutes} 分</span> <br>
        <span class="seconds">${seconds} 秒</span>
        <span class="weeks">共 ${weeks} 星期</span>
    </span>
`;


  }

function updateCountdown() {
  // const targetDate = '2024-11-03T00:00:00'; // 目标日期
  const countdownElement = document.getElementById('countdown');
  
  // countdownElement.textContent = calculateCountdown(targetDate);
  countdownElement.innerHTML = calculateCountdown(targetDate); // 使用 innerHTML 以解析 HTML 标签
}

function updateTitle(title) {
  const titleElement = document.getElementById('title');
  titleElement.textContent = title;
}

setInterval(updateCountdown, 500); // 每秒更新

// 接收主进程发送的配置数据
ipcRenderer.on('load-title-config', (event, targetTitle) => {
  updateTitle(targetTitle); // 更新页面标题
});

ipcRenderer.on('load-date-config', (event, Date) => {
  // 使用接收到的 targetDate 替换硬编码的日期
  targetDate = Date;
});

// 监听主进程发送的置顶状态消息
ipcRenderer.on('update-top-icon', (event, isAlwaysOnTop) => {
  const pinIcon = document.querySelector('#toggle-top i');
  if (isAlwaysOnTop) {
    pinIcon.classList.remove('fa-thumbtack');
    pinIcon.classList.add('fa-thumbtack-slash');
  } else {
    pinIcon.classList.remove('fa-thumbtack-slash');
    pinIcon.classList.add('fa-thumbtack');
  }
});