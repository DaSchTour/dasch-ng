# Documentation Deployment

This document describes how the documentation site is deployed to GitHub Pages.

## Overview

The documentation site is built with VitePress and TypeDoc and automatically deployed to GitHub Pages using GitHub Actions.

**Live Site:** [dasch.ng](https://dasch.ng)

## Automatic Deployment

The documentation is automatically deployed when changes are pushed to the `main` branch.

### Workflow

The deployment workflow (`.github/workflows/deploy-docs.yml`) performs the following steps:

1. **Build Libraries** - Builds all Nx libraries
2. **Generate TypeDoc** - Generates API documentation from TypeScript/JSDoc comments
3. **Build VitePress** - Builds the VitePress static site
4. **Deploy to GitHub Pages** - Uploads and deploys the built site

### Custom Domain

The custom domain `dasch.ng` is configured via the `CNAME` file in `apps/docs/public/`.

## Manual Deployment

You can manually trigger a deployment using the GitHub Actions UI:

1. Go to the repository's **Actions** tab
2. Select the **Deploy Documentation** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Local Preview

To preview the documentation locally:

```bash
# Development server with hot reload
npm run docs:dev

# Build and preview production version
npm run docs:build
npm run docs:preview
```

## GitHub Pages Configuration

To set up GitHub Pages for the first time:

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy on the next push to `main`

### Custom Domain Setup

To configure the custom domain `dasch.ng`:

1. In repository **Settings** → **Pages** → **Custom domain**
2. Enter `dasch.ng`
3. Click **Save**
4. Configure your DNS provider to point to GitHub Pages:
   - Add an `A` record pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Or add a `CNAME` record pointing to `<username>.github.io`

## Build Outputs

- **TypeDoc Output:** `apps/docs/api/`
- **VitePress Build:** `apps/docs/.vitepress/dist/`
- **Deployed Files:** All files from `apps/docs/.vitepress/dist/`

## Static Assets

Files in `apps/docs/public/` are copied to the root of the built site:

- `CNAME` - Custom domain configuration
- `.nojekyll` - Prevents Jekyll processing on GitHub Pages

## Troubleshooting

### Build Fails

If the build fails in GitHub Actions:

1. Check the workflow logs in the **Actions** tab
2. Test the build locally: `npm run docs:build`
3. Ensure all libraries build successfully: `nx run-many -t build`

### Custom Domain Not Working

1. Verify DNS records are configured correctly
2. Check the `CNAME` file contains `dasch.ng`
3. Wait for DNS propagation (can take up to 48 hours)
4. Enable HTTPS in repository **Settings** → **Pages** (after DNS is configured)

### 404 Errors

If you get 404 errors for routes:

1. Ensure `base` in `apps/docs/.vitepress/config.mts` is set to `'/'`
2. Check that `.nojekyll` file is present in the build output
3. Verify all internal links in markdown files are correct

## Related Documentation

- [VitePress Deployment Guide](https://vitepress.dev/guide/deploy#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [TypeDoc Documentation](https://typedoc.org/)
