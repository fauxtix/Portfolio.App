namespace Portfolio.App.Models.Pdf;

public class GitHubPdfModel
{
    public PdfProfile Profile { get; set; } = new();
    public List<PdfRepo> Repositories { get; set; } = [];
}
