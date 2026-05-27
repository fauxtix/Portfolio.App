using Blazored.LocalStorage;

namespace Portfolio.App.Services
{
    public class CacheConfigService
    {
        private readonly ILocalStorageService _localStorage;
        public TimeSpan CacheDuration { get; private set; } = TimeSpan.FromHours(6);

        public CacheConfigService(ILocalStorageService localStorage)
        {
            _localStorage = localStorage;
            _ = LoadCacheDurationAsync();
        }

        public async Task LoadCacheDurationAsync()
        {
            var hours = await _localStorage.GetItemAsync<int>("cache_duration_hours");
            if (hours > 0)
                CacheDuration = TimeSpan.FromHours(hours);
        }

        public async Task SetCacheDurationAsync(int hours)
        {
            await _localStorage.SetItemAsync("cache_duration_hours", hours);
            CacheDuration = TimeSpan.FromHours(hours);
        }
    }
}
