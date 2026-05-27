window.applyDialogTheme = (themeClass) => {
    document.querySelectorAll('.mud-dialog-root').forEach(el => {
        el.classList.remove('light-theme', 'dark-theme');
        el.classList.add(themeClass);
    });
};
