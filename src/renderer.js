const { ipcRenderer } = require('electron');

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
        <span class="weeks">${weeks} 星期</span><br>
        <span class="hours">${hours} 时</span> 
        <span class="minutes">${minutes} 分</span> 
        <span class="seconds">${seconds} 秒</span>
    </span>
`;


  }

function updateCountdown() {
  const targetDate = '2025-01-08T00:00:00'; // 目标日期
  const countdownElement = document.getElementById('countdown');
  
  // countdownElement.textContent = calculateCountdown(targetDate);
  countdownElement.innerHTML = calculateCountdown(targetDate); // 使用 innerHTML 以解析 HTML 标签
}

setInterval(updateCountdown, 1000); // 每秒更新

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