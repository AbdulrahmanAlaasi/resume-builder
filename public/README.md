# public/

Files in this directory are served at the site root by Cloudflare Pages.

## Logo

Save the project logo here as **`logo.png`**. The top-bar in [TopBar.tsx](../app/components/layout/TopBar.tsx) references it via `<img src="/logo.png" />`. If the file is missing the `<img>` is hidden gracefully (it won't break the layout), but the brand area will look empty.

Recommended:
- PNG with transparent background
- Square (the top bar renders it at 36×36 px)
- Around 256×256 to look crisp on retina displays
