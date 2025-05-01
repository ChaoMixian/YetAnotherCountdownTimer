using System;
using System.Windows;
using YetAnotherCountdownTimerNext.Services;

namespace YetAnotherCountdownTimerNext
{
    public partial class App : Application
    {
        private TrayService _trayService;

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            // Handle unhandled exceptions
            AppDomain.CurrentDomain.UnhandledException += (s, args) =>
                LogUnhandledException((Exception)args.ExceptionObject, "AppDomain.CurrentDomain.UnhandledException");

            Current.DispatcherUnhandledException += (s, args) =>
            {
                LogUnhandledException(args.Exception, "Application.Current.DispatcherUnhandledException");
                args.Handled = true;
            };
            

            // Check if application should be started with Windows
            var autoStartService = new AutoStartService();
            var configService = new ConfigService();

            if (configService.GetAutoStart() && !autoStartService.IsStartupEnabled())
            {
                autoStartService.EnableStartup();
            }
        }

        private void LogUnhandledException(Exception exception, string source)
        {
            // Simple error logging - in a real app, use a proper logging framework
            string errorMessage = $"Unhandled exception ({source}):\n{exception}";
            MessageBox.Show(errorMessage, "错误", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}