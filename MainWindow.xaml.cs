using System;
using System.Windows;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Threading;
using YetAnotherCountdownTimerNext.Services;

namespace YetAnotherCountdownTimerNext
{
    public partial class MainWindow : Window
    {
        private ConfigService _configService;
        private TrayService _trayService;
        private DispatcherTimer _timer;
        private DateTime _targetDate;
        private bool _isTopMost;

        public MainWindow()
        {
            InitializeComponent();
            
            _configService = new ConfigService();
            _trayService = new TrayService(this);
            
            InitializeCountdownTimer();
            PositionWindowToTopRight();
        }

        private void InitializeCountdownTimer()
        {
            // Load target date from config
            _targetDate = _configService.GetTargetDate();
            CountdownTitle.Text = _configService.GetCountdownTitle();
            
            // Initialize timer
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromSeconds(1);
            _timer.Tick += Timer_Tick;
            _timer.Start();
            
            // Update countdown initially
            UpdateCountdown();
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            UpdateCountdown();
        }

        private void UpdateCountdown()
        {
            TimeSpan remaining = _targetDate - DateTime.Now;
            
            if (remaining.TotalSeconds <= 0)
            {
                // Target date reached
                DaysText.Text = "0";
                HoursText.Text = "0";
                MinutesText.Text = "0";
                SecondsText.Text = "0";
                
                // Optional: Show a message or notification
                CountdownTitle.Text = "已到达目标日期！";

                 // Update weekday
                string[] weekdays = { "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六" };

                DateText.Text = DateTime.Now.ToString("yyyy年MM月dd日") + " " + weekdays[(int)DateTime.Now.DayOfWeek];
                // Update time  
                TimeText.Text = DateTime.Now.ToString("HH:mm:ss");
            }
            else
            {
                // Update UI with remaining time
                DaysText.Text = Math.Floor(remaining.TotalDays).ToString("0");
                HoursText.Text = remaining.Hours.ToString("00");
                MinutesText.Text = remaining.Minutes.ToString("00");
                SecondsText.Text = remaining.Seconds.ToString("00");
                
                // Update weekday
                string[] weekdays = { "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六" };

                DateText.Text = DateTime.Now.ToString("yyyy年MM月dd日") + " " + weekdays[(int)DateTime.Now.DayOfWeek];
                // Update time  
                TimeText.Text = DateTime.Now.ToString("HH:mm:ss");
            }
        }

        private void PositionWindowToTopRight()
        {
            // Position window at top-right corner of the screen
            double screenWidth = SystemParameters.PrimaryScreenWidth;
            double screenHeight = SystemParameters.PrimaryScreenHeight;
            
            this.Left = screenWidth - this.Width - 20;
            this.Top = 20;
        }

        private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            // Allow dragging the window
            this.DragMove();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            // Initialize with topmost setting from config
            _isTopMost = _configService.GetTopMost();
            UpdateTopMostStatus();
        }

        private void UpdateTopMostStatus()
        {
            this.Topmost = _isTopMost;
            
            // Update pin icon to show status
            PinIcon.Text = _isTopMost ? "📍" : "📌";
            
            // Save setting
            _configService.SetTopMost(_isTopMost);
        }

        private void SettingsButton_Click(object sender, RoutedEventArgs e)
        {
            // Open settings window
            var settingsWindow = new Views.SettingsWindow(_configService);
            settingsWindow.Owner = this;
            
            bool? result = settingsWindow.ShowDialog();
            
            if (result == true)
            {
                // Reload settings if changes were applied
                _targetDate = _configService.GetTargetDate();
                CountdownTitle.Text = _configService.GetCountdownTitle();
                UpdateCountdown();
            }
        }

        private void PinButton_Click(object sender, RoutedEventArgs e)
        {
            // Toggle topmost status
            _isTopMost = !_isTopMost;
            UpdateTopMostStatus();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            // Minimize to tray instead of closing if tray is enabled
            if (_configService.GetMinimizeToTray())
            {
                this.Hide();
            }
            else
            {
                Application.Current.Shutdown();
            }
        }

        protected override void OnStateChanged(EventArgs e)
        {
            // Handle minimize to tray if enabled
            if (WindowState == WindowState.Minimized && _configService.GetMinimizeToTray())
            {
                this.Hide();
            }
            
            base.OnStateChanged(e);
        }
    }
}