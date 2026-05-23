using Blazored.LocalStorage;

namespace Portfolio.App.Cache;

public class CacheService
{
    private readonly ILocalStorageService _storage;

    public CacheService(ILocalStorageService storage)
    {
        _storage = storage;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var item =
            await _storage.GetItemAsync<CacheItem<T>>(key);

        if (item == null)
            return default;

        if (DateTime.UtcNow > item.ExpiresAt)
        {
            await _storage.RemoveItemAsync(key);
            return default;
        }

        return item.Data;
    }

    public async Task SetAsync<T>(
        string key,
        T data,
        TimeSpan duration)
    {
        var item = new CacheItem<T>
        {
            Data = data,
            ExpiresAt = DateTime.UtcNow.Add(duration)
        };

        await _storage.SetItemAsync(key, item);
    }
}

public class CacheItem<T>
{
    public T? Data { get; set; }

    public DateTime ExpiresAt { get; set; }
}