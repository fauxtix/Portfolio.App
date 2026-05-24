using System.Text.Json.Serialization;

namespace Portfolio.App.Models;

public class GitHubProfile
{
    public string Login { get; set; } = "";
    public string? Name { get; set; }
    public int Public_repos { get; set; }

    [JsonPropertyName("avatar_url")]
    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    public int Followers { get; set; }

    public int Following { get; set; }
}