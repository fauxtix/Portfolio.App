public class AppSettings
{
    public string GitHubUsername { get; set; } = "fauxtix";

    public string ContactEmail { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string ContactLinkedIn { get; set; } = "";

    public string EmailSubjectTemplate { get; set; }
        = "Freelance .NET Developer — {Name}\nBlazor / C# Available";

    public int CacheDurationHours { get; set; } = 6;
}