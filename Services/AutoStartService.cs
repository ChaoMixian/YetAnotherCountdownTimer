using Microsoft.Win32;
using System;
using System.Reflection;
using System.Windows;

namespace YetAnotherCountdownTimerNext.Services
{
    public class AutoStartService
    {
        private const string RUN_REGISTRY_KEY = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
        private string _appName;
        private string _appPath;

        public AutoStartService()
        {
            _appName = Assembly.GetExecutingAssembly().GetName().Name;
            _appPath = Assembly.GetExecutingAssembly().Location;
        }

        public bool IsStartupEnabled()
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(RUN_REGISTRY_KEY))
                {
                    return key?.GetValue(_appName) != null;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"检查自启动设置时出错: {ex.Message}", "错误", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
                return false;
            }
        }

        public void EnableStartup()
        {
            #if DEBUG
            // Debug mode: do not enable auto-start
            #else
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(RUN_REGISTRY_KEY, true))
                {
                    if (key != null)
                    {
                        key.SetValue(_appName, _appPath);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"启用自启动时出错: {ex.Message}", "错误", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            #endif
        }

        public void DisableStartup()
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(RUN_REGISTRY_KEY, true))
                {
                    if (key == null)
                    {
                        MessageBox.Show("无法访问注册表键。", "错误", 
                            MessageBoxButton.OK, MessageBoxImage.Error);
                        return;
                    }

                    key.DeleteValue(_appName, false);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"禁用自启动时出错: {ex.Message}", "错误", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}