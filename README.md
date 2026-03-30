# Ceris-1-2 Cloud Registry

A unified cloud registry for discovering, publishing, and managing container images, services, and packages.

## Live Site

**https://msmchx-ui.github.io/Ceris-1-2-cloud-registry/**

### One-time setup to make the site live

Two steps are all that is needed:

1. **Merge this PR** into `main` so the website files reach the default branch.

2. **Enable GitHub Pages** from the repository's Settings:
   - Go to **Settings → Pages**
   - Under **Source**, select **"Deploy from a branch"**
   - Set branch to **`main`** and folder to **`/ (root)`**
   - Click **Save**

The site will be live at **https://msmchx-ui.github.io/Ceris-1-2-cloud-registry/** within a minute. Every subsequent push to `main` will automatically re-deploy the site.

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
| `.nojekyll` | Prevents GitHub Pages from running Jekyll |

## Features

- **Browse** – filterable grid of registry packages (images, services, libraries)
- **Search** – live search across name, namespace, description, and tags
- **Package detail** – one-click pull command for any package
- **Quick-start docs** – copy-to-clipboard code snippets
- **Responsive** – works on desktop and mobile
