using System;
using System.Threading.Tasks;
using Blazored.LocalStorage;

namespace Portfolio.App.Services
{
    public class ThemeService
    {
        public event Action? OnThemeChanged;
        public string CurrentTheme { get; private set; } = "light";
        private ILocalStorageService? _localStorage;
        private const string ThemeKey = "theme_mode";

        public void SetLocalStorage(ILocalStorageService localStorage)
        {
            _localStorage = localStorage;
        }

        public async Task LoadThemeAsync()
        {
            if (_localStorage != null)
            {
                var theme = await _localStorage.GetItemAsStringAsync(ThemeKey);
                if (theme == "dark" || theme == "light")
                {
                    CurrentTheme = theme;
                    OnThemeChanged?.Invoke();
                }
            }
        }

        public async Task ToggleThemeAsync()
        {
            CurrentTheme = CurrentTheme == "light" ? "dark" : "light";
            if (_localStorage != null)
                await _localStorage.SetItemAsStringAsync(ThemeKey, CurrentTheme);
            OnThemeChanged?.Invoke();
        }
    }
}
