let countdownTime = 600; // 10 minutes in seconds

function startCountdown() {
  const timerElement = document.getElementById('timer');
  const interval = setInterval(() => {
    if (countdownTime <= 0) {
      clearInterval(interval);
      timerElement.textContent = 'Time\'s Up!';
    } else {
      countdownTime--;
      const minutes = String(Math.floor(countdownTime / 60)).padStart(2, '0');
      const seconds = String(countdownTime % 60).padStart(2, '0');
      timerElement.textContent = `${minutes}:${seconds}`;
    }
  }, 1000);
}

window.onload = startCountdown;

