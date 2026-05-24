namespace Portfolio.App.Models;

public class GitHubPullRequest
{
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Html_Url { get; set; } = string.Empty;
}