namespace Portfolio.App.Models;

public class GitHubIssue
{
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Html_Url { get; set; } = string.Empty;

    // GitHub returns this for PR-backed issues
    public object? Pull_Request { get; set; }
}