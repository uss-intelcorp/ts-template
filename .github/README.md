# Private Template Repository

Keep this repository private and enable **Settings -> General -> Template repository** in GitHub.

Recommended ways to use it:

- GitHub UI: **Use this template** to create a private repository in the same org/account.
- GitHub CLI: `gh repo create OWNER/new-app --private --template OWNER/ts-template`.
- Actions artifact: run **Template Archive** and download the generated `.tar.gz` if you need an offline copy.

After creating a new app, replace template names such as `ts-template`, `@ts-template/*`, `TS Template`, and PM2 process names with the new app name.
