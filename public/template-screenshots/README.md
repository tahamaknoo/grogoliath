# Template Screenshots

Drop static thumbnail screenshots here using the template ID as the filename:

- `starter-1.png`
- `starter-2.png`
- ...
- `starter-19.png`

## Conventions

- **Format**: PNG (or JPG — change the lookup in `TemplatesView.jsx` if you want jpg)
- **Aspect ratio**: 16:10 (e.g. `1600 x 1000`) — what the card displays
- **Content**: capture the top portion of the rendered template (hero + a bit below). Don't try to fit the whole page — it'll look squished.
- **Background**: white or whatever the template's natural background is. The card crops to `object-cover object-top`.

## Fallback

If a screenshot is missing, the card automatically falls back to the icon-based design (category-colored tile + title + description). So you can roll out screenshots one at a time without breaking anything.

## How to capture

Easiest path: open each starter template in the preview modal, screenshot the top portion of the iframe, save as `starter-<n>.png` here. Or run a Puppeteer script against the saved templates table.

User-saved (custom) templates always show the icon — no screenshot lookup happens for them.
