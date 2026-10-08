# chmald.github.io

Source for **[chmald.github.io](https://chmald.github.io)** — Christopher Maldonado's portfolio and index of public Azure AI reference architectures and demos.

The site is plain static HTML/CSS with a little progressive-enhancement JavaScript. There is no runtime framework, no external CDN, and no analytics or trackers. GitHub Pages serves it directly from the root of the `main` branch.

## How it works

| Path | Purpose |
|---|---|
| `data/projects.json` | **Single source of truth** — profile, featured list, tracks, and one entry per project. |
| `scripts/render.mjs` | Templates that turn the data into HTML (no dependencies). |
| `scripts/build.mjs` | Validates the data and writes `index.html`, `404.html`, `sitemap.xml`, and `robots.txt`. |
| `scripts/validate.mjs` | Data rules shared by build and check. |
| `scripts/check.mjs` | Validates data, confirms the committed HTML is up to date, lints links/headings/images, checks WCAG AA colour contrast for both themes, and scans for local paths or email addresses. |
| `assets/` | `styles.css`, `site.js` (track filter + image fallback), `favicon.svg`, `og-image.png`. |
| `index.html`, `404.html`, `sitemap.xml`, `robots.txt` | **Generated** — committed so content is in the HTML (SEO and no-JS friendly). Do not edit by hand. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is. |

Requires Node.js 18 or later. There are no packages to install.

```sh
npm run build   # regenerate the site from data/projects.json
npm run check   # validate everything (CI runs this on every push and pull request)
npm test        # same as check, plus the full contrast report
```

To preview locally, serve the folder with any static server (the site uses root-relative paths such as `/assets/styles.css`), for example `npx serve .` or `python -m http.server`.

## Add or update a project

1. Edit `data/projects.json` and add an object to `projects`:

   ```json
   {
     "id": "my-new-demo",
     "title": "My New Demo",
     "useCase": "One line describing the problem it solves (170 characters or fewer).",
     "description": "Two or three sentences used on featured cards.",
     "highlights": [],
     "repo": "https://github.com/chmald/my-new-demo",
     "tracks": ["Apps & AI"],
     "type": "app",
     "deployable": true,
     "hasTemplate": true,
     "services": ["Microsoft Foundry", "Azure AI Search"],
     "icon": "agent",
     "thumbnail": "",
     "thumbnailAlt": ""
   }
   ```

   | Field | Rules |
   |---|---|
   | `id` | Kebab-case and identical to the GitHub repository name. |
   | `repo` | `https://github.com/chmald/<id>`. |
   | `tracks` | One or more values from the top-level `tracks` list (`Apps & AI`, `Data`, `Infra`). |
   | `type` | `app`, `runbook`, or `workshop`. |
   | `hasTemplate` | `true` shows the **Deployable: `azd up`** badge; `false` shows **Guided workshop**. |
   | `services` | Up to six key Azure services, shown as chips. |
   | `icon` | Placeholder icon: `agent`, `tools`, `gauge`, `chat`, `book`, `code`, `document`, `phone`, `avatar`, `pipeline`. |
   | `thumbnail` | Optional. `https://raw.githubusercontent.com/chmald/<id>/main/docs/assets/<file>.png` — only use a file that exists in the repository. Leave `""` for the generated gradient placeholder. If a set image ever fails to load, the page falls back to the placeholder automatically. |
   | `thumbnailAlt` | Required when `thumbnail` is set. Describe the diagram. |
   | `highlights` | Optional bullets, shown only when the project is featured. |

2. To feature a project, put its `id` in the top-level `featured` array (maximum three).
3. Run `npm run build`, then `npm run check`.
4. Commit the data change **and** the regenerated HTML.

## Optional profile links

`profile.links` holds placeholder entries (LinkedIn, blog) with an empty `url`. Links with an empty `url` are not rendered. Fill in the URL to show one in the About section.

## Disclaimer

Personal projects and reference demos. Not official Microsoft products; provided as-is for learning and illustration. Opinions are my own.
