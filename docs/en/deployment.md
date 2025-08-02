# Deployment Guide

This guide covers various deployment options for iPrompt.

## Deploy to Cloudflare Pages

### Prerequisites

- Cloudflare account
- GitHub repository (recommended) or direct file upload

### Method 1: GitHub Integration (Recommended)

1. **Login to Cloudflare Dashboard**
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to "Workers & Pages"

2. **Create New Project**
   - Click "Create application"
   - Select "Pages"
   - Click "Connect to Git"

3. **Connect GitHub Repository**
   - Authorize Cloudflare to access your GitHub
   - Select the iPrompt repository
   - Click "Begin setup"

4. **Configure Build Settings**
   - **Project name**: iprompt (or your preferred name)
   - **Production branch**: main
   - **Build settings**:
     - Build command: `npm run build:web`
     - Build output directory: `dist`
     - Root directory: `/`
   - **Environment variables**:
     - NODE_VERSION: `18`

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build completion
   - Access the provided `.pages.dev` URL

### Method 2: Direct Upload

1. **Build Locally**
   ```bash
   npm install
   npm run build:web
   ```

2. **Upload to Cloudflare Pages**
   - Create new Pages project in Cloudflare Dashboard
   - Select "Upload assets"
   - Upload all files from `dist` directory

## Deploy to Vercel

1. Click the "Deploy with Vercel" button in README
2. Connect your GitHub account
3. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
4. Deploy

## Deploy to Netlify

1. Click the "Deploy to Netlify" button in README
2. Connect your GitHub account
3. Configure build settings:
   - Build command: `npm run build:web`
   - Publish directory: `dist`
4. Deploy

## Custom Domain

### Cloudflare Pages
1. Go to project settings
2. Click "Custom domains"
3. Add your domain
4. Configure DNS records as instructed

### Vercel
1. Go to project settings
2. Navigate to "Domains"
3. Add your domain
4. Update DNS settings

## Environment Variables

If you need to configure environment variables:
1. Go to project settings
2. Find "Environment variables" section
3. Add required variables

## Post-Deployment Verification

1. **Check Multi-language Support**
   - Visit the app and switch languages
   - Ensure translation files load correctly

2. **Test Local Storage**
   - Create some prompts
   - Refresh page to verify persistence

3. **Verify Routing**
   - Direct access to sub-paths
   - Ensure SPA routing works properly

## Troubleshooting

### Build Failures
- Check Node.js version is correctly set
- Ensure all dependencies are declared in `package.json`

### 404 Errors
- Verify `_redirects` file exists in `public` directory
- Check build output includes the file

### Static Asset Loading Issues
- Check `vite.config.ts` for `base` configuration
- Ensure relative paths are used

## Performance Optimization

1. **Enable Compression**
   - Most platforms enable Brotli/gzip automatically

2. **Configure Caching**
   - Static assets should have long cache headers
   - HTML files should have short cache headers

3. **Use CDN**
   - Platforms like Cloudflare and Vercel provide global CDN automatically