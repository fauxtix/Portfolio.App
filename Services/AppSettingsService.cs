using Blazored.LocalStorage;
using Portfolio.App.Models;

namespace Portfolio.App.Services;

public interface IAppSettingsService
{
    event Action? OnSettingsChanged;

    Task<AppSettings> GetAsync();
    Task SaveAsync(AppSettings settings);
}

public class AppSettingsService : IAppSettingsService
{
    private const string Key = "app_settings";

    private readonly ILocalStorageService _localStorage;

    private AppSettings? _cache;

    public event Action? OnSettingsChanged;

    public AppSettingsService(ILocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    public async Task<AppSettings> GetAsync()
    {
        if (_cache != null)
            return _cache;

        var stored = await _localStorage.GetItemAsync<AppSettings>(Key);

        _cache = stored ?? new AppSettings();

        return _cache;
    }

    public async Task SaveAsync(AppSettings settings)
    {
        _cache = settings;

        await _localStorage.SetItemAsync(Key, settings);

        OnSettingsChanged?.Invoke();
    }
}