// All legacy DOM-manipulating JS removed for Blazor stability.
// If you need custom JS interop, add only what is required for your Blazor app.

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mainNav = document.getElementById("mainNav");
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      hamburgerBtn.classList.toggle("open", isOpen);
      hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    // Optional: close nav when clicking outside or on a link (mobile UX)
    mainNav.querySelectorAll("a,button").forEach((el) => {
      el.addEventListener("click", () => {
        if (window.innerWidth <= 700) {
          mainNav.classList.remove("open");
          hamburgerBtn.classList.remove("open");
          hamburgerBtn.setAttribute("aria-expanded", "false");
        }
      });
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) {
        mainNav.classList.remove("open");
        hamburgerBtn.classList.remove("open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
} catch (e) {
  // Ignore errors if elements are not present (Blazor SPA)
}
const toggleThemeButton = document.getElementById("toggleTheme");
const repoGrid = document.getElementById("repoGrid");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchInput");
const languageFilter = document.getElementById("languageFilter");

const clearSearchBtn = document.getElementById("clearSearchBtn");

let repositories = [];

// --- SETTINGS MERGE ---
// Merge user settings from localStorage into CONFIG
try {
  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || {};
  Object.assign(CONFIG, userSettings);
} catch {}


/* THEME */
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  // Also update the language filter dropdown to trigger theme CSS
  const languageFilter = document.getElementById("languageFilter");
  if (languageFilter) {
    // Force reflow to apply theme styles
    languageFilter.classList.remove("force-theme-repaint");
    void languageFilter.offsetWidth;
    languageFilter.classList.add("force-theme-repaint");
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme);
}

function initializeTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return applyTheme(saved);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

if (toggleThemeButton) toggleThemeButton.addEventListener("click", toggleTheme);
initializeTheme();

const CACHE_DURATION = window.CONFIG?.cacheDuration || 6 * 60 * 60 * 1000;

function getCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { value, expires } = JSON.parse(cached);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function setCache(key, value) {
  localStorage.setItem(
    key,
    JSON.stringify({ value, expires: Date.now() + CACHE_DURATION }),
  );
}

async function fetchWithCache(url, options = {}) {
  const cacheKey = `cache::${url}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

async function loadRepositories() {
  const headers = {};
  const token = sessionStorage.getItem("github_token");
  if (token) headers["Authorization"] = `token ${token}`;
  let data = [];
  let errorMsg = null;
  try {
    const url = `${window.CONFIG?.apiBaseUrl || "https://api.github.com"}/users/${CONFIG.githubUser}/repos?sort=updated`;
    data = await fetchWithCache(url, { headers });
  } catch (e) {
    errorMsg = "Network error while fetching repositories.";
    data = [];
  }
  repositories = Array.isArray(data) ? data : [];
  if (errorMsg) {
    repoGrid.innerHTML = `<div class='repo-card' style='color:#c00;text-align:center;'>${errorMsg}</div>`;
    return;
  }
  populateLanguages(repositories);
  renderRepositories(repositories);
}
// Populate language filter dropdown
function populateLanguages(repos) {
  const languageFilter = document.getElementById("languageFilter");
  if (!languageFilter) return;
  const languages = new Set();
  repos.forEach((repo) => {
    if (repo.language) languages.add(repo.language);
  });
  // Clear and add default option
  languageFilter.innerHTML = '<option value="all">All Languages</option>';
  Array.from(languages)
    .sort()
    .forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      languageFilter.appendChild(opt);
    });
}

/* RENDER */
function renderRepositories(repos) {
  repoGrid.innerHTML = "";
  if (!Array.isArray(repos)) {
    repoGrid.innerHTML = `<div class='repo-card' style='color:#c00;text-align:center;'>Error: Invalid repository data.</div>`;
    return;
  }

  // Helper to pick an icon based on language
  function getLanguageIcon(language) {
    switch ((language || "").toLowerCase()) {
      case "javascript":
        return "🟨";
      case "typescript":
        return "🟦";
      case "python":
        return "🐍";
      case "java":
        return "☕";
      case "c#":
        return "♯";
      case "c++":
        return "➕";
      case "html":
        return "🌐";
      case "css":
        return "🎨";
      case "shell":
        return "💻";
      case "go":
        return "🐹";
      case "php":
        return "🐘";
      case "ruby":
        return "💎";
      case "kotlin":
        return "🅺";
      case "swift":
        return "🦅";
      default:
        return "📦";
    }
  }

  const token = sessionStorage.getItem("github_token");
  repos.forEach((repo) => {
    const card = document.createElement("div");
    card.className = "repo-card";
    card.innerHTML = `
      <div class="repo-icon">${getLanguageIcon(repo.language)}</div>
      <div class="repo-header">
        <h2 class="repo-title">${repo.name}</h2>
        <span class="repo-language">
          ${repo.language || "Unknown"}
        </span>
      </div>

      <p class="repo-description">
        ${repo.description || "No description provided."}
      </p>
      <hr/>

      <div class="repo-meta">
        <span>⭐ ${repo.stargazers_count}</span>
        <span>🍴 ${repo.forks_count}</span>
        <span>🕒 ${new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>

      <div class="repo-actions">
        <button
          class="read-more"
          data-owner="${repo.owner.login}"
          data-repo="${repo.name}"
        >
          📄 Readme
        </button>
        ${
          token
            ? `<button
          class="traffic-btn"
          data-owner="${repo.owner.login}"
          data-repo="${repo.name}"
        >
          📊 Traffic
        </button>`
            : ""
        }
        <a
          href="${repo.html_url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          🐙 View repo
        </a>
      </div>
    `;
    repoGrid.appendChild(card);
  });

  bindReadMoreButtons();
  bindTrafficButtons();
  // Bind traffic modal buttons
  function bindTrafficButtons() {
    document.querySelectorAll(".traffic-btn").forEach((btn) => {
      btn.onclick = async () => {
        modal.classList.remove("hidden");
        modalBody.innerHTML = "<p>Loading traffic data...</p>";
        const owner = btn.dataset.owner;
        const repo = btn.dataset.repo;
        try {
          const token = sessionStorage.getItem("github_token");
          if (!token) {
            modalBody.innerHTML =
              '<p>You must <a href="login.html">login</a> to view traffic data.</p>';
            return;
          }
          const [viewsRes, clonesRes] = await Promise.all([
            fetchWithCache(
              `https://api.github.com/repos/${owner}/${repo}/traffic/views`,
              {
                headers: { Authorization: `token ${token}` },
              },
            ),
            fetchWithCache(
              `https://api.github.com/repos/${owner}/${repo}/traffic/clones`,
              {
                headers: { Authorization: `token ${token}` },
              },
            ),
          ]);
          const views = viewsRes;
          const clones = clonesRes;

          // Handle API errors or missing permissions
          if (views.message || clones.message) {
            modalBody.innerHTML = `<p style="color:#c00">Unable to fetch traffic data.<br>${views.message || clones.message}</p>`;
            return;
          }

          // Handle empty data
          const hasViews = Array.isArray(views.views) && views.views.length > 0;
          const hasClones =
            Array.isArray(clones.clones) && clones.clones.length > 0;

          modalBody.innerHTML = `
            <h3 style="margin-bottom:18px;">Traffic Insights for <b>${repo}</b></h3>
            <div class="traffic-summary" style="flex-direction:column;gap:14px;">
              <div class="traffic-group traffic-summary-card" style="margin-bottom:0;padding:7px 14px 7px 14px;min-height:auto;">
                <div class="traffic-group-title" style="margin-bottom:2px;font-size:1rem;">Summary</div>
                <div class="traffic-metric" style="gap:12px;font-size:0.97rem;flex-wrap:wrap;align-items:center;">
                  <span title="Total Views">👁️ <b>${typeof views.count === "number" ? views.count : 0}</b><br><small style='font-size:0.85em;opacity:0.7;'>total views</small></span>
                  <span title="Unique Visitors">🧑‍🤝‍🧑 <b>${typeof views.uniques === "number" ? views.uniques : 0}</b><br><small style='font-size:0.85em;opacity:0.7;'>unique viewers</small></span>
                  <span title="Total Clones">🔄 <b>${typeof clones.count === "number" ? clones.count : 0}</b><br><small style='font-size:0.85em;opacity:0.7;'>total clones</small></span>
                  <span title="Unique Cloners">🧑‍💻 <b>${typeof clones.uniques === "number" ? clones.uniques : 0}</b><br><small style='font-size:0.85em;opacity:0.7;'>unique cloners</small></span>
                </div>
              </div>
              <div style="display:flex;gap:24px;flex-wrap:wrap;">
                <div class="traffic-group" style="flex:1 1 220px;min-width:220px;">
                  <div class="traffic-group-title views">Views (last 14 days)</div>
                  ${
                    hasViews
                      ? `
                  <div class="traffic-table-wrap"><table class="traffic-table"><thead><tr><th>Date</th><th class='value-col'>Views</th><th class='value-col'>Unique</th></tr></thead><tbody>${views.views.map((v) => `<tr><td>${v.timestamp.split("T")[0]}</td><td class='value-col'>${v.count}</td><td class='value-col'>${v.uniques}</td></tr>`).join("")}</tbody></table></div>
                  `
                      : '<p class="traffic-no-data">No view data available.</p>'
                  }
                </div>
                <div class="traffic-group" style="flex:1 1 220px;min-width:220px;">
                  <div class="traffic-group-title clones">Clones (last 14 days)</div>
                  ${
                    hasClones
                      ? `
                  <div class="traffic-table-wrap"><table class="traffic-table"><thead><tr><th>Date</th><th class='value-col'>Clones</th><th class='value-col'>Unique</th></tr></thead><tbody>${clones.clones.map((c) => `<tr><td>${c.timestamp.split("T")[0]}</td><td class='value-col'>${c.count}</td><td class='value-col'>${c.uniques}</td></tr>`).join("")}</tbody></table></div>
                  `
                      : '<p class="traffic-no-data">No clone data available.</p>'
                  }
                </div>
              </div>
            </div>
          `;
        } catch (e) {
          modalBody.innerHTML = `<p>Error loading traffic data.</p>`;
        }
      };
    });
  }
}

/* README */
async function loadReadme(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
  let data;
  try {
    data = await fetchWithCache(url);
  } catch {
    return "<p>README not found</p>";
  }
  const markdown = decodeURIComponent(
    Array.from(atob(data.content))
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(""),
  );
  return `<div class='readme'>${marked.parse(markdown)}</div>`;
}

/* BUTTONS */
function bindReadMoreButtons() {
  document.querySelectorAll(".read-more").forEach((btn) => {
    btn.onclick = async () => {
      modal.classList.remove("hidden");
      modalBody.innerHTML = "<p>Loading...</p>";

      modalBody.innerHTML = await loadReadme(
        btn.dataset.owner,
        btn.dataset.repo,
      );
    };
  });
}

/* FILTER */

function filterAndRenderRepos() {
  const q = searchInput.value.toLowerCase();
  const selectedLang = languageFilter.value;
  renderRepositories(
    repositories.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q);
      const matchesLang = selectedLang === "all" || r.language === selectedLang;
      return matchesSearch && matchesLang;
    }),
  );
  if (clearSearchBtn) clearSearchBtn.style.display = q ? "flex" : "none";
}

if (searchInput) searchInput.addEventListener("input", filterAndRenderRepos);
if (languageFilter) languageFilter.addEventListener("change", filterAndRenderRepos);

// Show/hide clear button on load
if (clearSearchBtn && searchInput) clearSearchBtn.style.display = searchInput.value ? "flex" : "none";

if (clearSearchBtn) clearSearchBtn.addEventListener("click", () => {
  if (searchInput) searchInput.value = "";
  filterAndRenderRepos();
  if (clearSearchBtn) clearSearchBtn.style.display = "none";
  if (searchInput) searchInput.focus();
});

/* MODAL */
if (closeModal && modal) closeModal.onclick = () => modal.classList.add("hidden");

if (modal) {
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}

/* INIT */
async function init() {
  initializeTheme();
  await loadProfile();
  await loadRepositories();
}

async function loadProfile() {
  try {
    const url =
      `${window.CONFIG?.apiBaseUrl || "https://api.github.com"}/users/` +
      CONFIG.githubUser;
    const data = await fetchWithCache(url);
    document.getElementById("avatar").src = data.avatar_url;
    document.getElementById("name").textContent = data.name || data.login;
    document.getElementById("bio").textContent =
      data.bio || window.CONFIG?.defaultBio || "No Bio available";
  } catch (e) {
    console.error("Error loading profile:", e);
  }
}

init();
