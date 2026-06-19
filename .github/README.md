# Template Repository

Enable **Settings -> General -> Template repository** in GitHub so this repository can be used as a starter for new
apps.

Recommended ways to use it:

- GitHub UI: **Use this template** to create a repository in the target org/account.
- GitHub CLI: `gh repo create OWNER/new-app --public --template SOURCE_OWNER/ts-template`.
- Actions artifact: run **Template Archive** and download the generated `.tar.gz` if you need an offline copy.

Use `--private` instead of `--public` when the generated app should be private. After creating a new app, replace
template names such as `ts-template`, `@ts-template/*`, `TS Template`, and PM2 process names with the new app name.
