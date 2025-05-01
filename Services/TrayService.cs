using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace YetAnotherCountdownTimerNext.Services
{
    public class TrayService : IDisposable
    {
        private System.Windows.Forms.NotifyIcon _notifyIcon;
        private Window _mainWindow;

        public TrayService(Window mainWindow)
        {
            _mainWindow = mainWindow;
            InitializeTrayIcon();
        }

        private void InitializeTrayIcon()
        {
            try
            {
                _notifyIcon = new System.Windows.Forms.NotifyIcon
                {
                    Icon = System.Drawing.Icon.ExtractAssociatedIcon(System.Reflection.Assembly.GetExecutingAssembly().Location),
                    Text = "Yet Another Countdown Timer",
                    Visible = true
                };

                // Create context menu
                var contextMenu = new System.Windows.Forms.ContextMenuStrip();
                
                var showItem = new System.Windows.Forms.ToolStripMenuItem("显示");
                showItem.Click += (s, e) => Application.Current.Dispatcher.Invoke(ShowMainWindow);
                contextMenu.Items.Add(showItem);
                
                var settingsItem = new System.Windows.Forms.ToolStripMenuItem("设置");
                settingsItem.Click += (s, e) => Application.Current.Dispatcher.Invoke(ShowSettings);
                contextMenu.Items.Add(settingsItem);
                
                contextMenu.Items.Add(new System.Windows.Forms.ToolStripSeparator());
                
                var exitItem = new System.Windows.Forms.ToolStripMenuItem("退出");
                exitItem.Click += (s, e) => Application.Current.Dispatcher.Invoke(ExitApplication);
                contextMenu.Items.Add(exitItem);

                _notifyIcon.ContextMenuStrip = contextMenu;
                
                // Double-click to show window
                _notifyIcon.DoubleClick += (s, e) => Application.Current.Dispatcher.Invoke(ShowMainWindow);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"初始化托盘图标时出错: {ex.Message}", "错误", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ShowMainWindow()
        {
            if (_mainWindow != null)
            {
                _mainWindow.Show();
                _mainWindow.WindowState = WindowState.Normal;
                _mainWindow.Activate();
            }
        }

        private void ShowSettings()
        {
            ShowMainWindow();
            
            // Trigger settings window
            var configService = new ConfigService();
            var settingsWindow = new Views.SettingsWindow(configService);
            settingsWindow.Owner = _mainWindow;
            settingsWindow.ShowDialog();
        }

        private void ExitApplication()
        {
            Application.Current.Shutdown();
        }

        public void Dispose()
        {
            if (_notifyIcon != null)
            {
                _notifyIcon.Visible = false;
                _notifyIcon.Dispose();
                _notifyIcon = null;
            }
        }
    }
}