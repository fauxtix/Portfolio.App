using System.Text.Json.Serialization;

namespace Portfolio.App.Models.Pdf;

public class PdfProfile
{
    public string Name { get; set; } = "";
    public string Login { get; set; } = "";

    [JsonPropertyName("public_repos")]
    public int PublicRepos { get; set; }

    public int Followers { get; set; }
    public int Following { get; set; }

    [JsonPropertyName("avatar_url")]
    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }
}
