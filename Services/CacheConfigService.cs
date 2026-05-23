namespace Portfolio.App.Services;

public class CacheConfigService
{
    public TimeSpan CacheDuration { get; set; } = TimeSpan.FromHours(6);
}
