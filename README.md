<div align="center">

<img src="https://img.shields.io/badge/Blazor-WebAssembly-5C2D91?logo=blazor&logoColor=white&style=for-the-badge">
<img src="https://img.shields.io/badge/UI-MudBlazor-593D7C?style=for-the-badge">
<img src="https://img.shields.io/badge/Hosting-GitHub%20Pages-222?logo=githubpages&style=for-the-badge">
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">

# 🚀 Portfolio.App

_Elegant portfolio SPA built with Blazor WebAssembly & MudBlazor — customize and deploy effortlessly on GitHub Pages!_

</div>

---

## ✨ Features

- 🎨 **Modern Responsive UI** with [MudBlazor](https://mudblazor.com/) and full dark/light mode toggle
- 🔧 **Settings Page** to configure your:
  - GitHub Username (drives repo/issue displays)
  - Contact links and templates (email, phone, LinkedIn)
  - Data cache duration (for API calls)
- 🏠 **Home**: Enter GitHub username, list and explore your repositories (with private-access via PAT if needed)
- 🗂️ **Project Gallery**: Interactive cards for each GitHub repo with rich data
- 📬 **Contact**: Elegant form; launches your mail client with auto-filled info from settings
- 🔖 **Issues & PRs**: View your GitHub issues and pull requests across repositories
- ⚡ **Static & Fast**: No backend/server required, ready for GitHub Pages
- 🌈 **Fully Themed**: Rapidly switch between dark/light for the whole app

---

## 🛠️ Tech Stack

| Tech                      | Usage                      |
|---------------------------|-----------------------------|
| ![Blazor WASM](https://img.shields.io/badge/Blazor-WebAssembly-5C2D91?logo=blazor&logoColor=white) | SPA Framework |
| ![MudBlazor](https://img.shields.io/badge/MudBlazor-593D7C?&logo=blazor) | Material-inspired UI Components |
| ![C#](https://img.shields.io/badge/C%23-239120?logo=csharp&logoColor=white) | Main Application Logic |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) | Markup |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) | Styling |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) | Interop (if needed) |
| ![GitHub Pages](https://img.shields.io/badge/Static%20Hosting-GitHub%20Pages-222?logo=githubpages) | Deployment |

---

## ⚡ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/fauxtix/Portfolio.App.git
   cd Portfolio.App
   ```

2. **Install dependencies**

   ```bash
   dotnet restore
   ```

3. **Run locally**

   ```bash
   dotnet run
   ```
   - Access at [https://localhost:5001](https://localhost:5001) (or as indicated in console)

4. **Publish for GitHub Pages**

   ```bash
   dotnet publish -c Release -o release --nologo
   ```
   - See the [Blazor deployment guide](https://learn.microsoft.com/aspnet/core/blazor/host-and-deploy/webassembly?view=aspnetcore-8.0#github-pages) for details.

---

## ⚙️ Customization & Settings

- Open the **Settings** page (gear icon or `/settings` URL) to:
  - Set your GitHub username, contact info, and API display options.
  - Enable dark/light mode (applies everywhere).
  - Save and reset settings easily — changes are instant.
- All major site content dynamically updates based on your settings.
- Style/enhance components via MudBlazor’s theme system (see `Pages/Settings.razor` and `Layout/`).

---

## 🤝 Contributing

- Fork the repository
- Create a new branch (`git checkout -b feature/amazing`)
- Make changes with clear, conventional commits
- Push (`git push origin feature/amazing`)
- Open a Pull Request!

---

## 📄 License

[MIT License](LICENSE)

---

<div align="center">
  <sub>
    Built with ❤️ using <a href="https://blazor.net/">Blazor</a> & <a href="https://mudblazor.com/">MudBlazor</a> by <a href="https://github.com/fauxtix">fauxtix</a><br>
    Easily host your portfolio on GitHub Pages!
  </sub>
</div>
