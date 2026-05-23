using Blazored.LocalStorage;
using System.Text.Json;

namespace Portfolio.App.Services;

public class BrowserCacheService
{
    private readonly ILocalStorageService _localStorage;
    private readonly CacheConfigService _cacheConfig;
    public BrowserCacheService(ILocalStorageService localStorage, CacheConfigService cacheConfig)
    {
        _localStorage = localStorage;
        _cacheConfig = cacheConfig;
    }

    public async Task<T?> GetOrFetchAsync<T>(string key, Func<Task<T>> fetch, TimeSpan? duration = null)
    {
        var cacheKey = $"cache::{key}";
        var cached = await _localStorage.GetItemAsync<string>(cacheKey);
        if (cached != null)
        {
            var wrapper = JsonSerializer.Deserialize<CacheWrapper<T>>(cached);
            if (wrapper != null && DateTimeOffset.UtcNow < wrapper.Expires)
                return wrapper.Value;
        }
        var value = await fetch();
        var expires = DateTimeOffset.UtcNow.Add(duration ?? _cacheConfig.CacheDuration);
        var toStore = JsonSerializer.Serialize(new CacheWrapper<T> { Value = value, Expires = expires });
        await _localStorage.SetItemAsync(cacheKey, toStore);
        return value;
    }

    private class CacheWrapper<T>
    {
        public T? Value { get; set; }
        public DateTimeOffset Expires { get; set; }
    }
}
