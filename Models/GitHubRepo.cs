using System.Text.Json.Serialization;

public class GitHubRepo
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }

    [JsonPropertyName("stargazers_count")]
    public int StargazersCount { get; set; }

    [JsonPropertyName("forks_count")]
    public int ForksCount { get; set; }

    public string Language { get; set; } = "";

    [JsonPropertyName("html_url")]
    public string HtmlUrl { get; set; } = "";

    [JsonPropertyName("updated_at")]
    public string UpdatedAt { get; set; } = "";

    // your enriched fields
    public int Views { get; set; }
    public int Clones { get; set; }

    [JsonPropertyName("open_issues_count")]
    public int OpenIssuesCount { get; set; }

    // Not part of default repo API, but can be set when enriching
    public int OpenPrsCount { get; set; }
}