# GitHub Pages Deployment Setup Guide

## Overview

This repository is configured for automatic deployment to GitHub Pages. The setup uses GitHub Actions to build and deploy your battery research documentation as a live website.

## Files Created

The following files have been added to enable GitHub Pages deployment:

1. **`.github/workflows/deploy-pages.yml`** - GitHub Actions workflow for building and deploying to GitHub Pages
2. **`_config.yml`** - Jekyll configuration file (required for GitHub Pages)
3. **`index.html`** - Landing page with navigation to all research documents
4. **`Gemfile`** - Ruby dependencies for Jekyll build process
5. **`.gitignore`** - Excludes build artifacts from git tracking

## Configuration Details

### GitHub Actions Workflow (`deploy-pages.yml`)

- **Triggers:** Automatically runs on push to `main` or `master` branches
- **Manual Trigger:** Can be triggered manually via GitHub Actions UI
- **Build Process:** Uses Jekyll to build the static site
- **Deployment:** Automatically deploys to GitHub Pages via `gh-pages` branch
- **Permissions:** Configured to write to Pages and create deployments

### Jekyll Configuration (`_config.yml`)

- **Theme:** Minimal theme (clean, professional look)
- **Markdown Engine:** Kramdown (supports GitHub-flavored markdown)
- **Includes:** All markdown documents in the site build
- **URL:** Set to `https://abhip2006.github.io/battery-research`
- **Base URL:** `/battery-research` (adjust if deploying to different path)

### Index Page (`index.html`)

- Professional landing page with gradient styling
- Links to all research documents
- Category organization
- Statistics dashboard
- Responsive design for mobile and desktop

## Setup Instructions

### Step 1: Ensure You're on the Correct Branch

```bash
git checkout main
# or if your main branch is named 'master'
git checkout master
```

If your main branch has a different name, you'll need to update the workflow file:

```bash
# Find your main branch name
git branch -a

# Edit the deploy-pages.yml workflow to match your main branch name
```

### Step 2: Commit the New Files

```bash
git add .github/workflows/deploy-pages.yml
git add _config.yml
git add index.html
git add Gemfile
git add .gitignore
git add GITHUB_PAGES_SETUP.md
```

```bash
git commit -m "Set up GitHub Pages deployment with Jekyll"
```

### Step 3: Push to Remote

```bash
git push origin main
```
(or `master` if that's your main branch)

### Step 4: Configure GitHub Pages Settings

1. Go to your GitHub repository on GitHub.com
2. Navigate to **Settings** → **Pages**
3. Under "Source", select:
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
4. Click **Save**

### Step 5: Verify Deployment

After pushing, GitHub Actions will automatically:
1. Build the site using Jekyll
2. Create/update the `gh-pages` branch
3. Deploy to GitHub Pages

**Check the status:**
- Go to **Actions** tab in your GitHub repository
- Look for the "Deploy to GitHub Pages" workflow
- It should show a green checkmark when successful

**View your site:**
- Once deployed, your site will be available at: `https://abhip2006.github.io/battery-research`
- The URL will be shown in the Pages settings

## Important Notes

### Branch Workflow from `claude/parallel-agents-deploy-011CUwtEYqPFCvg8GKStbV9J`

If you need to deploy from your current feature branch:

1. **Option A: Merge to main first** (Recommended)
   ```bash
   git checkout main
   git pull origin main
   git merge claude/parallel-agents-deploy-011CUwtEYqPFCvg8GKStbV9J
   git push origin main
   ```

2. **Option B: Temporarily update workflow to use current branch**
   - Edit `.github/workflows/deploy-pages.yml`
   - Change the `branches` line to include your current branch name
   - This is useful for testing before merging to main

### URL Configuration

The `_config.yml` file has:
```yaml
url: "https://abhip2006.github.io"
baseurl: "/battery-research"
```

**If your repository path is different**, update these values:
- Change `abhip2006` to your GitHub username
- Change `battery-research` to your repository name

### Local Testing (Optional)

To test the site locally before deployment:

```bash
# Install dependencies (requires Ruby)
bundle install

# Build and serve locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

## What Gets Deployed

The workflow will deploy:
- All Markdown files (`.md`)
- The `index.html` landing page
- The `visualization-data.json` file
- All other static assets

The `_site/` directory (build output) is excluded from git tracking via `.gitignore`.

## Troubleshooting

### Actions Workflow Fails

1. Check the workflow logs:
   - Go to **Actions** → "Deploy to GitHub Pages"
   - Click the failed run
   - Expand each job to see error messages

2. Common issues:
   - **Wrong branch name:** Ensure the workflow matches your main branch
   - **Missing permissions:** GitHub Pages needs write permissions (already configured)
   - **Gemfile conflicts:** Delete `Gemfile.lock` if you're updating dependencies

### Site Not Updating After Push

1. Verify the workflow completed successfully (green checkmark in Actions)
2. Clear your browser cache (Ctrl+Shift+Delete)
3. Check the Pages settings show `gh-pages` as the source
4. Wait 2-3 minutes for deployment to complete

### URL Issues

If your site shows a 404:
- Verify the `baseurl` in `_config.yml` matches your repository name
- Check that GitHub Pages is enabled in Settings → Pages
- Ensure the workflow ran and the `gh-pages` branch exists

## Customization

### Change the Theme

Edit `_config.yml`:
```yaml
theme: jekyll-theme-minimal  # Change to: cayman, slate, midnight, etc.
```

### Update Site Metadata

Edit `_config.yml`:
```yaml
title: Your New Title
description: Your new description
```

### Modify the Landing Page

Edit `index.html` to change the design, colors, or content structure.

## Workflow Automation Features

The GitHub Actions workflow includes:

- **Automatic builds** on every push to main branch
- **Automatic deployment** to `gh-pages` branch
- **Automatic page URL** generation
- **Concurrency control** to prevent simultaneous deployments
- **Manual trigger option** (Actions → Deploy to GitHub Pages → Run workflow)

## Next Steps

1. Verify all files are created
2. Push changes to your main branch
3. Monitor the Actions tab for deployment completion
4. Visit your live site when deployment is complete
5. Share the GitHub Pages URL with stakeholders

---

For more information about GitHub Pages and Jekyll, see:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
