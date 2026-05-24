using Portfolio.App.Models.Pdf;
using Microsoft.JSInterop;

namespace Portfolio.App.Services;

public class GitHubPdfService
{
    private readonly GitHubPdfBuilderService _builder;
    private readonly IJSRuntime _js;

    public GitHubPdfService(
        GitHubPdfBuilderService builder,
        IJSRuntime js)
    {
        _builder = builder;
        _js = js;
    }

    public async Task DownloadAsync(string username, string? pat)
    {
        var model = await _builder.BuildAsync(username, pat);

        await _js.InvokeVoidAsync(
            "pdfExport.generate",
            model);
    }
}