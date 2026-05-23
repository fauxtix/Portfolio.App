namespace Portfolio.App.Models;

public class GitHubRepoTraffic
{
    public int Views { get; set; }
    public int UniqueViews { get; set; }
    public int Clones { get; set; }
    public int UniqueClones { get; set; }
    public List<TrafficViewDay> ViewsDaily { get; set; } = new();
    public List<TrafficCloneDay> ClonesDaily { get; set; } = new();
    public string RepoName { get; set; } = string.Empty;

    public class TrafficViewDay
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
        public int Uniques { get; set; }
    }
    public class TrafficCloneDay
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
        public int Uniques { get; set; }
    }
}
