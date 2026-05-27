namespace Portfolio.App.Models;

public class AppSettings
{
    public string GitHubUsername { get; set; } = "fauxtix";

    public string ContactEmail { get; set; } = "";

    public string ContactPhone { get; set; } = "";

    public string ContactLinkedIn { get; set; } = "";

    public string EmailSubjectTemplate { get; set; }
        = ".NET / C# / Blazor Developer Available for Projects — {Name}";

    public int CacheDurationHours { get; set; } = 6;
}