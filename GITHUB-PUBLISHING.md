# GitHub publishing checklist

## Recommended repository setup

Create a new **public** repository, for example:

`Sound-of-Progress`

When creating it, leave **Add a README**, **.gitignore**, and **license** unchecked because this package already contains the files it needs.

## Upload

Upload the **contents of this folder**, not the ZIP file itself.

Make sure `.github/workflows/deploy-pages.yml` is included. The `.github` folder can be easy to miss because its name starts with a dot.

## Turn on the live site

1. Commit the files to the `main` branch.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Go to **Actions** and open **Deploy to GitHub Pages**.
5. Wait for both the build and deploy jobs to turn green.
6. Open the Pages URL shown by GitHub.

## Future updates

Any commit pushed to `main` automatically rebuilds and republishes the site.

## Local preview

```cmd
npm install
npm run dev
```

Keep the Command Prompt window open while testing.

## Files not to upload

Do not upload these generated folders if they appear on your computer:

- `node_modules`
- `dist`

They are intentionally excluded by `.gitignore`.
