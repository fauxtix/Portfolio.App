using MudBlazor.Services;
using Portfolio.App.Services;
using Portfolio.App.Cache;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Portfolio.App;
using Blazored.LocalStorage;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");

builder.Services.AddScoped(sp =>
    new HttpClient
    {
        BaseAddress = new Uri("https://api.github.com/")
    });

builder.Services.AddMudServices();

builder.Services.AddBlazoredLocalStorage();

builder.Services.AddSingleton<AppState>();
builder.Services.AddScoped<CacheService>();

builder.Services.AddScoped<GitHubApiService>();

await builder.Build().RunAsync();