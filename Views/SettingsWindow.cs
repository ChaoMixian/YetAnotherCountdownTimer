using System;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Animation;
using YetAnotherCountdownTimerNext.Services;

namespace YetAnotherCountdownTimerNext.Views
{
    public partial class SettingsWindow : Window
    {
        private ConfigService _configService;
        private AutoStartService _autoStartService;
        private bool _changesApplied = false;

        public SettingsWindow(ConfigService configService)
        {
            InitializeComponent();
            
            _configService = configService;
            _autoStartService = new AutoStartService();
            
            LoadSettings();
            
            // Add some subtle animations when the window opens
            Loaded += SettingsWindow_Loaded;
        }

        private void SettingsWindow_Loaded(object sender, RoutedEventArgs e)
        {
            // Subtle fade-in animation for the window
            this.Opacity = 0;
            DoubleAnimation fadeIn = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromMilliseconds(250)
            };
            this.BeginAnimation(UIElement.OpacityProperty, fadeIn);
        }

        private void LoadSettings()
        {
            // Load settings from config service
            TitleTextBox.Text = _configService.GetCountdownTitle();
            TargetDatePicker.SelectedDate = _configService.GetTargetDate();
            AutoStartCheckBox.IsChecked = _configService.GetAutoStart();
            TopMostCheckBox.IsChecked = _configService.GetTopMost();
            MinimizeToTrayCheckBox.IsChecked = _configService.GetMinimizeToTray();
        }

        private void SaveSettings()
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(TitleTextBox.Text))
            {
                ShowErrorMessage("请输入倒计时标题");
                return;
            }

            if (TargetDatePicker.SelectedDate == null)
            {
                ShowErrorMessage("请选择目标日期");
                return;
            }

            // Save settings to config service
            _configService.SetCountdownTitle(TitleTextBox.Text);
            _configService.SetTargetDate(TargetDatePicker.SelectedDate.Value);
            _configService.SetTopMost(TopMostCheckBox.IsChecked ?? false);
            _configService.SetMinimizeToTray(MinimizeToTrayCheckBox.IsChecked ?? false);
            
            // Handle auto start setting
            bool autoStart = AutoStartCheckBox.IsChecked ?? false;
            _configService.SetAutoStart(autoStart);
            
            if (autoStart)
            {
                _autoStartService.EnableStartup();
            }
            else
            {
                _autoStartService.DisableStartup();
            }

            _changesApplied = true;
            CloseWithAnimation(true);
        }

        private void ShowErrorMessage(string message)
        {
            MessageBox.Show(message, "提示", MessageBoxButton.OK, MessageBoxImage.Warning);
        }

        private void CloseWithAnimation(bool dialogResult)
        {
            // Subtle fade-out animation
            DoubleAnimation fadeOut = new DoubleAnimation
            {
                From = 1,
                To = 0,
                Duration = TimeSpan.FromMilliseconds(200)
            };
            
            fadeOut.Completed += (s, e) =>
            {
                this.DialogResult = dialogResult;
                this.Close();
            };
            
            this.BeginAnimation(UIElement.OpacityProperty, fadeOut);
        }

        private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            // Allow dragging the window
            this.DragMove();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            CloseWithAnimation(false);
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            CloseWithAnimation(false);
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            SaveSettings();
        }
    }
}