namespace Portfolio.App.Services
{
    public class AppState
    {
        public bool IsLoggedIn { get; private set; }
        public string? Pat { get; private set; }
        public event Action? OnChange;

        public void SetLogin(string pat)
        {
            IsLoggedIn = true;
            Pat = pat;
            NotifyStateChanged();
        }

        public void SetLogout()
        {
            IsLoggedIn = false;
            Pat = null;
            NotifyStateChanged();
        }

        private void NotifyStateChanged() => OnChange?.Invoke();
    }
}
