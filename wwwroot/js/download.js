// download.js
// Handles PDF generation and download
// Uses jsPDF (https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)

// Dynamically load jsPDF
(function loadJsPDF() {
  if (!window.jspdf) {
    var script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = function () {
      window.jsPDF = window.jspdf.jsPDF;
    };
    document.head.appendChild(script);
  }
})();

// --- Caching logic (copied from app.js) ---
const CACHE_DURATION = window.CONFIG?.cacheDuration || 6 * 60 * 60 * 1000; // 6 hours in ms
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

document
  .getElementById("downloadPdfBtn")
  .addEventListener("click", async function () {
    if (!window.jsPDF) {
      alert("PDF library not loaded yet. Please try again in a moment.");
      return;
    }
    // Fetch profile and repos with cache
    const user = window.CONFIG?.githubUser || "fauxtix";
    const profileUrl = `https://api.github.com/users/${user}`;
    const reposUrl = `https://api.github.com/users/${user}/repos?sort=updated`;
    let profile = {};
    let repos = [];
    try {
      profile = await fetchWithCache(profileUrl);
      repos = await fetchWithCache(reposUrl);
    } catch (e) {
      alert("Failed to fetch GitHub data.");
      return;
    }

    const doc = new window.jsPDF();
    const marginTop = 20;
    const marginBottom = 20;
    const pageHeight = 297; // A4 height in mm for jsPDF default
    let y = marginTop;
    let pageNum = 1;
    let totalPages = 1;
    const repoRows = [];

    // --- PDF Layout ---
    doc.setFontSize(22);
    doc.setTextColor("#111");
    doc.text(window.CONFIG?.pdfTitle || "GitHub Portfolio", 14, y);
    // Avatar (top left) and profile info to the right
    let profileBlockTop = y + 4;
    if (profile.avatar_url) {
      try {
        const imgData = await toDataURL(profile.avatar_url);
        doc.addImage(imgData, "JPEG", 14, profileBlockTop, 24, 24);
      } catch {}
    }
    // Name to the right of avatar
    doc.setFontSize(14);
    doc.setTextColor("#111");
    doc.text(profile.name || profile.login || user, 42, profileBlockTop + 7);
    // Bio below name, smaller font, wrapped, to the right of avatar
    let bioY = profileBlockTop + 13;
    if (profile.bio) {
      doc.setFontSize(9);
      doc.setTextColor("#333");
      const bioLines = doc.splitTextToSize(profile.bio, 110);
      bioLines.forEach((line) => {
        doc.text(line, 42, bioY);
        bioY += 5;
      });
    }
    // Calculate the bottom of the avatar block and the bio block
    const avatarBottom = profileBlockTop + 24;
    const bioBottom = bioY;
    y = Math.max(avatarBottom, bioBottom) + 4;
    // Stats line below avatar and bio
    doc.setFontSize(10);
    doc.setTextColor("#222");
    doc.text(
      `Public repos: ${profile.public_repos || repos.length}    Followers: ${profile.followers || 0}    Following: ${profile.following || 0}`,
      14,
      y,
    );
    y += 12;

    // Section: Repositories
    doc.setFontSize(13);
    doc.setTextColor("#111");
    doc.text("Repositories", 14, y);
    y += 7;
    // Table header (consistent positions)
    const colX = {
      name: 16,
      lang: 56,
      stars: 76,
      updated: 96,
      description: 112, // move left for more width
    };
    doc.setFontSize(10);
    doc.setTextColor("#111");
    doc.setFillColor("#e5e7eb");
    doc.rect(14, y - 4, 180, 7, "F");
    doc.text("Name", colX.name, y);
    doc.text("Lang", colX.lang, y);
    doc.text("Stars", colX.stars, y); // Changed to 'Stars' for clarity
    doc.text("Updated", colX.updated, y);
    doc.text("Description", colX.description, y);
    y += 6;
    // Prepare repo rows with calculated height (description width = 82)
    repos.slice(0, 10).forEach((repo) => {
      const descLines = doc.splitTextToSize(repo.description || "-", 90);
      const rowHeight = Math.max(8, descLines.length * 4);
      repoRows.push({ repo, descLines, rowHeight });
    });

    // Calculate total pages
    let tempY = y;
    totalPages = 1;
    repoRows.forEach(({ rowHeight }) => {
      if (tempY + rowHeight + marginBottom > pageHeight) {
        totalPages++;
        tempY = marginTop + 6 + rowHeight; // 6 for table header
      } else {
        tempY += rowHeight;
      }
    });

    // Render repo rows with page breaks and footer
    pageNum = 1;
    for (let i = 0; i < repoRows.length; i++) {
      const { repo, descLines, rowHeight } = repoRows[i];
      // If not enough space for row + marginBottom, add new page
      if (y + rowHeight + marginBottom > pageHeight) {
        // Footer before page break
        addFooter(doc, pageNum, totalPages);
        doc.addPage();
        pageNum++;
        y = marginTop + 6; // after table header
        // Redraw table header (same positions)
        doc.setFontSize(10);
        doc.setTextColor("#111");
        doc.setFillColor("#e5e7eb");
        doc.rect(14, y - 4, 180, 7, "F");
        doc.text("Name", colX.name, y);
        doc.text("Lang", colX.lang, y);
        doc.text("Stars", colX.stars, y); // Changed to 'Stars' for clarity
        doc.text("Updated", colX.updated, y);
        doc.text("Description", colX.description, y);
        y += 6;
      }
      doc.setFontSize(8);
      doc.setTextColor("#222");
      doc.setFont(undefined, "bold");
      doc.text(repo.name, colX.name, y, { maxWidth: 38 });
      doc.setFont(undefined, "normal");
      doc.text(repo.language || "-", colX.lang, y, { maxWidth: 16 });
      doc.text(String(repo.stargazers_count), colX.stars, y, { maxWidth: 10 });
      doc.text(
        new Date(repo.updated_at).toLocaleDateString(),
        colX.updated,
        y,
        { maxWidth: 18 },
      );
      descLines.forEach((line, j) => {
        doc.text(line, colX.description, y + j * 4, { maxWidth: 90 });
      });
      y += rowHeight;
    }
    // Footer for last page
    addFooter(doc, pageNum, totalPages);
    doc.save("github-portfolio.pdf");
    // (moved above)
    // Footer function
    function addFooter(doc, pageNum, totalPages) {
      const pageHeight = 297;
      const marginBottom = 20;
      const dateStr = new Date().toLocaleDateString();
      doc.setFontSize(8);
      doc.setTextColor("#888");
      doc.text(dateStr, 14, pageHeight - marginBottom + 8);
      doc.text(
        `Page ${pageNum} / ${totalPages}`,
        180,
        pageHeight - marginBottom + 8,
        { align: "right" },
      );
    }
  });

// Helper to convert image URL to base64
function toDataURL(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );
}
