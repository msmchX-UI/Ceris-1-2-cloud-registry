# Ceris-1-2 Cloud Registry

A unified cloud registry for discovering, publishing, and managing container images, services, and packages.

## Website

Open `index.html` in any modern browser (or serve the directory with any static-file server) to view the registry website.

```bash
# Quick local preview
npx serve .
# then open http://localhost:3000
```

## Files

| File | Description |
|------|-------------|
| `index.html` | Main registry website (single-page) |
| `styles.css` | All styling – responsive, CSS-variable–driven |
| `app.js` | Package data, search, filter, and detail logic |

## Features

- **Browse** – filterable grid of registry packages (images, services, libraries)
- **Search** – live search across name, namespace, description, and tags
- **Package detail** – one-click pull command for any package
- **Quick-start docs** – copy-to-clipboard code snippets
- **Responsive** – works on desktop and mobile
