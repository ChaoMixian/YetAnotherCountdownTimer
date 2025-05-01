using System;
using System.IO;
using System.Text.Json;
using System.Diagnostics; // 添加调试输出


namespace YetAnotherCountdownTimerNext.Services
{
    public class ConfigService
    {

        private static readonly string CONFIG_DIR;
        public static readonly string CONFIG_FILE;

        static ConfigService()
        {
            CONFIG_DIR = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "ChaoMixian", "YetAnotherCountdownTimerNext");
            CONFIG_FILE = Path.Combine(CONFIG_DIR, "config.json");
                    }

        private CountdownConfig _config;

        public ConfigService()
        {
            LoadConfig();
        }

        public DateTime GetTargetDate()
        {
            return _config.TargetDate;
        }

        public void SetTargetDate(DateTime targetDate)
        {
            _config.TargetDate = targetDate;
            SaveConfig();
        }

        public string GetCountdownTitle()
        {
            return _config.CountdownTitle;
        }

        public void SetCountdownTitle(string title)
        {
            _config.CountdownTitle = title;
            SaveConfig();
        }

        public bool GetAutoStart()
        {
            return _config.AutoStart;
        }

        public void SetAutoStart(bool autoStart)
        {
            _config.AutoStart = autoStart;
            SaveConfig();
        }

        public bool GetTopMost()
        {
            return _config.TopMost;
        }

        public void SetTopMost(bool topMost)
        {
            _config.TopMost = topMost;
            SaveConfig();
        }

        public bool GetMinimizeToTray()
        {
            return _config.MinimizeToTray;
        }

        public void SetMinimizeToTray(bool minimizeToTray)
        {
            _config.MinimizeToTray = minimizeToTray;
            SaveConfig();
        }

        private void LoadConfig()
        {
            try
            {
                if (!Directory.Exists(CONFIG_DIR))
                {
                    Directory.CreateDirectory(CONFIG_DIR);
                }

                if (File.Exists(CONFIG_FILE))
                {
                    string json = File.ReadAllText(CONFIG_FILE);
                    _config = JsonSerializer.Deserialize<CountdownConfig>(json);
                }
                else
                {
                    // Create default config
                    _config = new CountdownConfig
                    {
                        TargetDate = DateTime.Now.AddDays(7),
                        CountdownTitle = "距离目标日期",
                        AutoStart = true,
                        TopMost = false,
                        MinimizeToTray = true
                    };
                    SaveConfig();
                }
            }
            catch (Exception)
            {
                // Fallback to defaults if config loading fails
                _config = new CountdownConfig
                {
                    TargetDate = DateTime.Now.AddDays(7),
                    CountdownTitle = "距离目标日期",
                    AutoStart = true,
                    TopMost = false,
                    MinimizeToTray = true
                };
            }
        }

        private void SaveConfig()
        {
            try
            {
                string json = JsonSerializer.Serialize(_config, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(CONFIG_FILE, json);
            }
            catch (Exception)
            {
                // Handle save errors (could log or notify user)
            }
        }
    }

    public class CountdownConfig
    {
        public DateTime TargetDate { get; set; }
        public string CountdownTitle { get; set; }
        public bool AutoStart { get; set; }
        public bool TopMost { get; set; }
        public bool MinimizeToTray { get; set; }
    }
}