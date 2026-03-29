# Ceris-1-2 Cloud Registry

A unified cloud registry for discovering, publishing, and managing container images, services, and packages.

## Live Site

**https://msmchx-ui.github.io/Ceris-1-2-cloud-registry/**

### One-time setup to make the site live

1. **Merge this PR** into `main` so the website files and workflow reach the default branch.
2. **Approve the pending workflow run** (if prompted):  
   Go to **Actions → Deploy to GitHub Pages** and click **"Approve and run"** if it shows `action_required`.
3. **Enable GitHub Pages** in repository settings:  
   Go to **Settings → Pages → Source** and set it to **"Deploy from a branch"** → branch: **`gh-pages`** → folder: **`/ (root)`** → Save.
4. The site will be live at `https://msmchx-ui.github.io/Ceris-1-2-cloud-registry/` within a minute.

> **Why `gh-pages` branch?**  
> The deploy workflow (`peaceiris/actions-gh-pages@v4`) automatically pushes the built site to the `gh-pages` branch on every push to `main`. This avoids the GitHub Pages environment-approval gate that blocked the previous `actions/deploy-pages` approach.

## Local preview

Open `index.html` in any modern browser, or serve the directory with any static-file server:

```bash
npx serve .
# then open http://localhost:3000
```

## Files

| File | Description |
|------|-------------|
| `index.html` | Main registry website (single-page) |
| `styles.css` | All styling – responsive, CSS-variable–driven |
| `app.js` | Package data, search, filter, and detail logic |
| `.github/workflows/deploy-pages.yml` | Auto-deploys to GitHub Pages on every push to `main` |

## Features

- **Browse** – filterable grid of registry packages (images, services, libraries)
- **Search** – live search across name, namespace, description, and tags
- **Package detail** – one-click pull command for any package
- **Quick-start docs** – copy-to-clipboard code snippets
- **Responsive** – works on desktop and mobile
