using Microsoft.JSInterop;
using Portfolio.App.Models;

namespace Portfolio.App.Services;

public interface IContactService
{
    Task OpenEmailClient(ContactRequest request);
}

public class ContactService : IContactService, IDisposable
{
    private readonly IJSRuntime _js;
    private readonly IAppSettingsService _settingsService;

    private AppSettings _settings = new();

    public ContactService(IJSRuntime js, IAppSettingsService settingsService)
    {
        _js = js;
        _settingsService = settingsService;

        _settingsService.OnSettingsChanged += ReloadSettings;
    }

    // Optional but recommended warm-up call
    public async Task InitializeAsync()
    {
        _settings = await _settingsService.GetAsync();
    }

    private async void ReloadSettings()
    {
        _settings = await _settingsService.GetAsync();
    }

    public async Task OpenEmailClient(ContactRequest request)
    {
        // -----------------------------
        // Build URLs dynamically
        // -----------------------------
        var portfolioUrl =
            $"https://{_settings.GitHubUsername}.github.io/GitHubPortfolio/";

        var githubUrl =
            $"https://github.com/{_settings.GitHubUsername}";

        // -----------------------------
        // Subject (safe encoding)
        // -----------------------------

        var subjectRaw = _settings.EmailSubjectTemplate;

        var subjectClean = subjectRaw
            .Replace("\r\n", " ")
            .Replace("\n", " ")
            .Trim();

        var subject = Uri.EscapeDataString(
            subjectClean.Replace("{Name}", request.Name ?? "")
        );

        // -----------------------------
        // Body (Outlook-safe formatting)
        // -----------------------------
        var bodyText =
        $"""
Hello [Recruiter or Manager Name],

I'm reaching out because I know that [Company Name] often manages robust projects in the Microsoft ecosystem, and I'd like to offer my availability to strengthen your development team.

I am a freelance developer with strong experience across the .NET stack (C#, .NET Core, Web API) and specialize in building dynamic interfaces with Blazor (Server and WebAssembly). I can deliver complete applications without the need for complex JavaScript frameworks, ensuring clean, maintainable code.

Here are links to my technical portfolio and main repositories:

Portfolio:
{portfolioUrl}

GitHub:
{githubUrl}

{(!string.IsNullOrWhiteSpace(request.Message)
            ? $"Message:\n{request.Message}\n\n"
            : "")}

If you have any current or upcoming projects that need immediate support in .NET/Blazor, I would be very interested in collaborating.

Can we schedule a quick call to align expectations?

Best regards,
{request.Name}
{request.Email}
{_settings.ContactPhone}
{_settings.ContactLinkedIn}
""";
        // Normalize newlines for Outlook / mail clients
        bodyText = bodyText.Replace("\r\n", "\n");

        var body = Uri.EscapeDataString(bodyText);

        // -----------------------------
        // Mailto
        // -----------------------------
        var mailto =
            $"mailto:{_settings.ContactEmail}?subject={subject}&body={body}";

        await _js.InvokeVoidAsync("open", mailto, "_self");
    }

    public void Dispose()
    {
        _settingsService.OnSettingsChanged -= ReloadSettings;
    }
}