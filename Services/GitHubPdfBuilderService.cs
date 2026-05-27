using Portfolio.App.Models.Pdf;

namespace Portfolio.App.Services;

public class GitHubPdfBuilderService
{
    private readonly GitHubApiService _gitHub;

    public GitHubPdfBuilderService(GitHubApiService gitHub)
    {
        _gitHub = gitHub;
    }

    public async Task<GitHubPdfModel> BuildAsync(string username, string? pat)
    {
        var repos = await _gitHub.GetReposAsync(username, pat);
        var profile = await _gitHub.GetUserProfileAsync(username, pat);

        return new GitHubPdfModel
        {
            Profile = new PdfProfile
            {
                Name = profile?.Name ?? profile?.Login ?? username,
                Login = profile?.Login ?? username,

                PublicRepos = profile?.Public_repos ?? repos.Count,

                Followers = profile?.Followers ?? 0,
                Following = profile?.Following ?? 0,

                AvatarUrl = null,
                Bio = profile?.Name 
            },

            Repositories = repos.Select(r => new PdfRepo
            {
                Name = r.Name,
                Language = r.Language,
                Description = r.Description,
                StargazersCount = r.StargazersCount,
                ForksCount = r.ForksCount,
                HtmlUrl = r.HtmlUrl,
                UpdatedAt = r.UpdatedAt
            }).ToList()
        };
    }
}