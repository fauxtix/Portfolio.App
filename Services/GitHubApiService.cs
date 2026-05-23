using System.Net.Http.Headers;
using System.Net.Http.Json;
using Portfolio.App.Models;
using Portfolio.App.Cache;

namespace Portfolio.App.Services;

public class GitHubApiService
{
    private readonly HttpClient _http;
    private readonly CacheService _cache;
    private readonly BrowserCacheService _browserCache;

    public GitHubApiService(
        HttpClient http,
        CacheService cache,
        BrowserCacheService browserCache)
    {
        _http = http;
        _cache = cache;
        _browserCache = browserCache;

        _http.DefaultRequestHeaders.UserAgent.ParseAdd(
            "PortfolioApp");
    }

    public async Task<List<GitHubRepo>> GetReposAsync(string username, string? pat = null)
    {
        var cacheKey = $"repos_{username}";
        return await _browserCache.GetOrFetchAsync<List<GitHubRepo>>(cacheKey, () => FetchReposWithTrafficAsync(username, pat));
    }

    private async Task<List<GitHubRepo>> FetchReposWithTrafficAsync(string username, string? pat)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"users/{username}/repos?sort=updated&per_page=20");
        if (!string.IsNullOrWhiteSpace(pat))
            request.Headers.Authorization = new AuthenticationHeaderValue("token", pat);

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return new List<GitHubRepo>();

        var repos = await response.Content.ReadFromJsonAsync<List<GitHubRepo>>() ?? new List<GitHubRepo>();

        if (!string.IsNullOrWhiteSpace(pat))
        {
            foreach (var repo in repos)
            {
                try
                {
                    var trafficReq = new HttpRequestMessage(HttpMethod.Get, $"repos/{username}/{repo.Name}/traffic/views");
                    trafficReq.Headers.Authorization = new AuthenticationHeaderValue("token", pat);
                    var trafficResp = await _http.SendAsync(trafficReq);
                    if (trafficResp.IsSuccessStatusCode)
                    {
                        var traffic = await trafficResp.Content.ReadFromJsonAsync<TrafficViewsResponse>();
                        repo.Views = traffic?.count ?? 0;
                    }
                }
                catch { repo.Views = 0; }
                try
                {
                    var clonesReq = new HttpRequestMessage(HttpMethod.Get, $"repos/{username}/{repo.Name}/traffic/clones");
                    clonesReq.Headers.Authorization = new AuthenticationHeaderValue("token", pat);
                    var clonesResp = await _http.SendAsync(clonesReq);
                    if (clonesResp.IsSuccessStatusCode)
                    {
                        var clones = await clonesResp.Content.ReadFromJsonAsync<TrafficClonesResponse>();
                        repo.Clones = clones?.count ?? 0;
                    }
                }
                catch { repo.Clones = 0; }
            }
        }
        return repos;
    }

    public async Task<string> GetRepoReadmeAsync(string owner, string repo, string? pat = null)
    {
        var req = new HttpRequestMessage(HttpMethod.Get, $"repos/{owner}/{repo}/readme");
        if (!string.IsNullOrWhiteSpace(pat))
            req.Headers.Authorization = new AuthenticationHeaderValue("token", pat);

        var resp = await _http.SendAsync(req);
        if (!resp.IsSuccessStatusCode)
            return "README not found.";

        var json = await resp.Content.ReadFromJsonAsync<GitHubReadmeResponse>();
        if (json?.content == null)
            return "README not found.";

        // Decode base64, then decode URI components (to match JS logic)
        var base64Decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(json.content));
        var markdown = Uri.UnescapeDataString(base64Decoded);
        return markdown;
    }

    private class GitHubReadmeResponse
    {
        public string? content { get; set; }
    }
    public async Task<GitHubRepoTraffic?> GetRepoTrafficAsync(string owner, string repo, string? pat = null)
    {
        if (string.IsNullOrWhiteSpace(pat))
            return null;

        var cacheKey = $"traffic_{owner}_{repo}";
        return await _browserCache.GetOrFetchAsync(cacheKey, async () =>
        {
            var traffic = new GitHubRepoTraffic { RepoName = repo };
            try
            {
                var viewsReq = new HttpRequestMessage(HttpMethod.Get, $"repos/{owner}/{repo}/traffic/views");
                viewsReq.Headers.Authorization = new AuthenticationHeaderValue("token", pat);
                var viewsResp = await _http.SendAsync(viewsReq);
                if (viewsResp.IsSuccessStatusCode)
                {
                    var viewsData = await viewsResp.Content.ReadFromJsonAsync<TrafficViewsDetailResponse>();
                    traffic.Views = viewsData?.count ?? 0;
                    traffic.UniqueViews = viewsData?.uniques ?? 0;
                    if (viewsData?.views != null)
                    {
                        traffic.ViewsDaily = viewsData.views.Select(v => new GitHubRepoTraffic.TrafficViewDay
                        {
                            Date = v.timestamp.Split('T')[0],
                            Count = v.count,
                            Uniques = v.uniques
                        }).ToList();
                    }
                }

                var clonesReq = new HttpRequestMessage(HttpMethod.Get, $"repos/{owner}/{repo}/traffic/clones");
                clonesReq.Headers.Authorization = new AuthenticationHeaderValue("token", pat);
                var clonesResp = await _http.SendAsync(clonesReq);
                if (clonesResp.IsSuccessStatusCode)
                {
                    var clonesData = await clonesResp.Content.ReadFromJsonAsync<TrafficClonesDetailResponse>();
                    traffic.Clones = clonesData?.count ?? 0;
                    traffic.UniqueClones = clonesData?.uniques ?? 0;
                    if (clonesData?.clones != null)
                    {
                        traffic.ClonesDaily = clonesData.clones.Select(c => new GitHubRepoTraffic.TrafficCloneDay
                        {
                            Date = c.timestamp.Split('T')[0],
                            Count = c.count,
                            Uniques = c.uniques
                        }).ToList();
                    }
                }
            }
            catch
            {
                return null;
            }
            return traffic;
        });
    }

    private class TrafficViewsDetailResponse
    {
        public int count { get; set; }
        public int uniques { get; set; }
        public List<TrafficViewDay>? views { get; set; }

        public class TrafficViewDay
        {
            public string timestamp { get; set; } = string.Empty;
            public int count { get; set; }
            public int uniques { get; set; }
        }
    }

    private class TrafficClonesDetailResponse
    {
        public int count { get; set; }
        public int uniques { get; set; }
        public List<TrafficCloneDay>? clones { get; set; }

        public class TrafficCloneDay
        {
            public string timestamp { get; set; } = string.Empty;
            public int count { get; set; }
            public int uniques { get; set; }
        }
    }

    private class TrafficViewsResponse { public int count { get; set; } }
    private class TrafficClonesResponse { public int count { get; set; } }

}
