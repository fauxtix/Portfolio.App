namespace Portfolio.App.Models;

public class GitHubRepo
{
    public string Name { get; set; } = "";

    public string Description { get; set; } = "";

    public int Stargazers_Count { get; set; }

    public int Forks_Count { get; set; }

    public string Language { get; set; } = "";

    public string Html_Url { get; set; } = "";

    public string OwnerAvatar { get; set; } = "";

    public int Views { get; set; }

    public int Clones { get; set; }
}