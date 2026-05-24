using System.Net.Http.Headers;
using System.Net.Http.Json;
using Portfolio.App.Models;

namespace Portfolio.App.Services;

public class GitHubIssuesPrsService
{
    private readonly HttpClient _http;
    private readonly BrowserCacheService _browserCache;

    public GitHubIssuesPrsService(
        HttpClient http,
        BrowserCacheService browserCache)
    {
        _http = http;
        _browserCache = browserCache;

        _http.DefaultRequestHeaders.UserAgent.ParseAdd(
            "PortfolioApp");
    }

    public async Task<List<GitHubIssue>> GetIssuesAsync(
        string owner,
        string repo,
        string? pat = null)
    {
        var cacheKey = $"issues_{owner}_{repo}";

        return await _browserCache.GetOrFetchAsync<List<GitHubIssue>>(
                   cacheKey,
                   () => FetchIssuesAsync(owner, repo, pat))
               ?? [];
    }

    private async Task<List<GitHubIssue>> FetchIssuesAsync(
        string owner,
        string repo,
        string? pat)
    {
        try
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"repos/{owner}/{repo}/issues?state=all");

            if (!string.IsNullOrWhiteSpace(pat))
            {
                request.Headers.Authorization =
                    new AuthenticationHeaderValue("token", pat);
            }

            var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
                return [];

            var issues = await response.Content
                .ReadFromJsonAsync<List<GitHubIssue>>();

            return issues?
                .Where(i => i.Pull_Request == null)
                .ToList()
                ?? [];
        }
        catch
        {
            return [];
        }
    }

    public async Task<List<GitHubPullRequest>> GetPullRequestsAsync(
        string owner,
        string repo,
        string? pat = null)
    {
        var cacheKey = $"prs_{owner}_{repo}";

        return await _browserCache.GetOrFetchAsync<List<GitHubPullRequest>>(
                   cacheKey,
                   () => FetchPullRequestsAsync(owner, repo, pat))
               ?? [];
    }

    private async Task<List<GitHubPullRequest>> FetchPullRequestsAsync(
        string owner,
        string repo,
        string? pat)
    {
        try
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"repos/{owner}/{repo}/pulls?state=all");

            if (!string.IsNullOrWhiteSpace(pat))
            {
                request.Headers.Authorization =
                    new AuthenticationHeaderValue("token", pat);
            }

            var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
                return [];

            return await response.Content
                .ReadFromJsonAsync<List<GitHubPullRequest>>()
                ?? [];
        }
        catch
        {
            return [];
        }
    }
}