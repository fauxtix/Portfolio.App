window.pdfExport = {
    generate: function (input) {

        const model = typeof input === "string"
            ? JSON.parse(input)
            : input;

        const profile = model.profile ?? {};
        const repos = model.repositories ?? [];

        if (!window.jspdf) {
            alert("PDF library not loaded.");
            return;
        }

        const doc = new window.jspdf.jsPDF();
        let y = 20;

        // HEADER
        doc.setFontSize(22);
        doc.text("GitHub Portfolio", 14, y);
        y += 10;

        // PROFILE NAME
        doc.setFontSize(14);
        doc.text(profile.name || profile.login || "Unknown", 14, y);
        y += 8;

        // PROFILE STATS
        doc.setFontSize(10);
        doc.text(`Repos: ${profile.public_repos ?? 0}`, 14, y);
        y += 6;

        doc.text(
            `Followers: ${profile.followers ?? 0}  Following: ${profile.following ?? 0}`,
            14,
            y
        );

        y += 10;

        // SECTION TITLE
        doc.setFontSize(13);
        doc.text("Repositories", 14, y);
        y += 8;

        // REPOS LIST
        doc.setFontSize(10);

        const marginTop = 20;
        const marginBottom = 20;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const exportDate = new Date().toLocaleDateString();

        const addFooter = (currentPage, totalPages) => {
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text(exportDate, 14, pageHeight - 10);
            doc.text(`Page ${currentPage} / ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: "right" });
            doc.setTextColor(0);
            doc.setFontSize(10);
        };

        const repoRows = repos.slice(0, 20).map(repo => {
            let rowHeight = 6;
            if (repo.description) {
                const descLines = doc.splitTextToSize(`Desc: ${repo.description}`, 170);
                rowHeight += descLines.length * 5;
            }
            if (repo.html_url) {
                rowHeight += 5;
            }
            if (repo.updated_at) {
                rowHeight += 5;
            }
            rowHeight += 4;
            return { repo, rowHeight };
        });

        let totalPages = 1;
        let tempY = y;
        repoRows.forEach(({ rowHeight }) => {
            if (tempY + rowHeight > pageHeight - marginBottom) {
                totalPages++;
                tempY = marginTop;
            }
            tempY += rowHeight;
        });

        let pageNum = 1;
        repoRows.forEach(({ repo, rowHeight }) => {
            if (y + rowHeight > pageHeight - marginBottom) {
                addFooter(pageNum, totalPages);
                doc.addPage();
                pageNum++;
                y = marginTop;
            }

            // Repo name bold
            doc.setFont(undefined, "bold");
            doc.text(`${repo.name ?? "-"}`, 14, y);
            doc.setFont(undefined, "normal");
            doc.text(`(${repo.language ?? "-"}) Stars: ${repo.stargazers_count ?? 0} Forks: ${repo.forks_count ?? 0}`, 14 + 60, y);
            y += 6;

            if (repo.description) {
                doc.setFontSize(9);
                const descLines = doc.splitTextToSize(`Desc: ${repo.description}`, 170);
                descLines.forEach(line => {
                    doc.text(line, 18, y);
                    y += 5;
                });
                doc.setFontSize(10);
            }
            if (repo.html_url) {
                doc.setFontSize(8);
                doc.textWithLink("[GitHub]", 18, y, { url: repo.html_url });
                y += 5;
                doc.setFontSize(10);
            }
            if (repo.updated_at) {
                doc.setFontSize(8);
                doc.text(`Updated: ${(repo.updated_at || '').split('T')[0]}`, 18, y);
                y += 5;
                doc.setFontSize(10);
            }

            // Separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(14, y, 190, y);
            y += 4;
        });

        addFooter(pageNum, totalPages);
        doc.save("github-portfolio.pdf");
    }
};