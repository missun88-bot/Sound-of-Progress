# The Sound of Progress

**The Sound of Progress** is an interactive scrollytelling adaptation of a Tableau visualization created for a Data ChangeMakers data challenge in partnership with Noise Solution.

The story explores results from **35 young people across 228 music mentoring sessions**, focusing on autonomy, competence, relatedness, participant ratings, and the language found in session reflections.

> **Live site:** after GitHub Pages is enabled, the URL will normally be  
> `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/`

## About the project

Noise Solution uses music mentoring to create conditions that support basic psychological needs and wellbeing. This visualization moves from overall patterns to individual experiences and finally to the words behind the scores.

This web version is a portfolio-oriented adaptation of the original Tableau visualization, preserving its visual language while adding scrollytelling, animation and interaction.

## Story structure

1. **What the overall results reveal** — patterns across autonomy, competence and relatedness, followed by participants' overall ratings.
2. **One pattern, many personal paths** — 35 circular profiles showing how individual experiences vary.
3. **What progress sounds like** — anonymized reflection language adds context and voice to the quantitative results.
4. **Project background & data process** — methodology, participant background, data caveats and project credits.

## Run locally

### Windows

Double-click `START-WINDOWS.bat`, or open Command Prompt in the project folder and run:

```cmd
npm install
npm run dev
```

Then open the local address shown in the terminal.

### macOS / Linux

```bash
npm install
npm run dev
```

## Publish with GitHub Pages

This repository includes an automated GitHub Pages workflow.

1. Create a new GitHub repository.
2. Upload or push **the contents of this folder** to the repository root.
3. Make sure the default branch is `main`.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment → Source**, select **GitHub Actions**.
6. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.
7. GitHub will show the live site URL after deployment succeeds.

The project uses a relative Vite build path, so it works whether the repository is called `sound-of-progress`, another project name, or a root `username.github.io` site.

## Main files

- `app/story.tsx` — story content, charts, animations and interactions
- `app/globals.css` — visual design and responsive layout
- `app/data/noise-data.json` — privacy-conscious web dataset
- `public/assets/` — project logos
- `main.tsx` — browser entry point
- `.github/workflows/deploy-pages.yml` — automatic GitHub Pages deployment

## Data and privacy

The web dataset omits participant IDs and session IDs. Individual profiles use neutral labels, qualitative excerpts are anonymized, and individual demographic combinations are not displayed.

The visualization distinguishes AI-derived psychological-needs scores from participants' separately reported overall ratings. Missing overall ratings are displayed as `NA`.

## Credits

**Visualization and web story:** Iris Sun  
**Data:** Noise Solution  
**Project:** Data ChangeMakers × Noise Solution

## Reuse

No open-source license is included by default. This repository is prepared primarily as a portfolio and project showcase. Data, partner branding and project materials should not be assumed to be freely reusable.
