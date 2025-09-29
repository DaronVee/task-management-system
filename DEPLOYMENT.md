# Deployment Guide: GitHub to Netlify Auto-Deploy

This guide explains how to set up automatic deployment from GitHub to Netlify for the Task Management System frontend while keeping the Claude Code backend local.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  Netlify (CDN)  │◄──▶│   Supabase DB   │
│  (Source Code)  │    │   (Frontend)    │    │  (Real-time)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       ▲
                                                       │
                                               ┌─────────────────┐
                                               │  Local Backend  │
                                               │ (Claude Code +  │
                                               │ Python Scripts) │
                                               └─────────────────┘
```

## Benefits of This Architecture

- **Frontend**: Professional deployment with CDN, HTTPS, custom domains
- **Backend**: Claude Code remains local for AI-powered brain dump processing
- **Real-time sync**: Supabase handles real-time data synchronization
- **Auto-deploy**: Push to GitHub → Automatic Netlify deployment
- **Environment isolation**: Sensitive backend configuration stays local

## Prerequisites

1. **GitHub Account**: Free account at github.com
2. **Netlify Account**: Free account at netlify.com (connects to GitHub)
3. **Supabase Project**: Existing project with task management schema
4. **Local Environment**: Working task management system

## Step-by-Step Deployment

### 1. Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `task-management-system` (or your preference)
3. Description: `AI-powered task management with Claude Code brain dump processing`
4. Set to **Public** or **Private** (your choice)
5. **Do NOT** initialize with README, .gitignore, or license (already exists locally)
6. Click "Create repository"

### 2. Push Code to GitHub

```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/task-management-system.git

# Push code
git branch -M main
git push -u origin main
```

### 3. Set Up Netlify Deployment

1. **Login to Netlify**: Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. **Import Project**: Click "New site from Git" → "GitHub"
3. **Select Repository**: Choose your `task-management-system` repository
4. **Configure Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: Will be set automatically from `netlify.toml`

### 4. Configure Environment Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
```

*Note: Get these values from your Supabase project dashboard (Settings → API)*

### 5. Update Supabase Authentication Settings

1. Go to your **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Site URL** and **Redirect URLs**:
   ```
   https://your-app-name.netlify.app
   ```
3. Add to **Additional Redirect URLs** if using custom domain later

### 6. Test Deployment

1. **Trigger Deploy**: Push any change to your main branch
2. **Monitor Build**: Watch the build process in Netlify dashboard
3. **Test App**: Visit your Netlify URL and verify:
   - App loads correctly
   - Supabase connection works
   - Real-time updates function
   - No console errors

## Workflow After Setup

### Daily Development Workflow

1. **Process Brain Dumps Locally**:
   ```bash
   # Use Claude Code for brain dump processing
   python scripts/process_morning.py
   ```

2. **Sync Data**:
   ```bash
   # Sync processed tasks to Supabase
   python backend/sync.py push
   ```

3. **View Results**: Check your Netlify app URL to see tasks in the professional UI

### Code Updates Workflow

1. **Local Development**:
   ```bash
   cd frontend
   npm run dev  # Test changes locally
   ```

2. **Deploy Changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main  # Triggers automatic Netlify deployment
   ```

### Environment Management

- **Local Development**: Uses `frontend/.env.local`
- **Production**: Uses Netlify environment variables
- **Backend**: Always runs locally with `backend/.env`

## Important Files

### `netlify.toml`
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"
```

### `.gitignore`
```gitignore
# Critical: Never commit these files
.env
.env.local
backend/.env
```

### `frontend/.env.example`
Template for required environment variables (safe to commit)

## Troubleshooting

### Build Failures
- **Check build logs** in Netlify dashboard
- **Verify environment variables** are set correctly
- **Test build locally**: `cd frontend && npm run build`

### Authentication Issues
- **Verify Supabase URLs** are added to authentication settings
- **Check environment variables** match your Supabase project
- **Test API connection** using browser dev tools

### Real-time Sync Issues
- **Verify Supabase connection** from Netlify app
- **Check local backend** is running and syncing properly
- **Test direct database access** via Supabase dashboard

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use Netlify UI for production environment variables
   - Keep backend service keys local only

2. **Repository Settings**:
   - Set appropriate repository visibility (public/private)
   - Use branch protection rules if collaborating
   - Review Netlify deploy permissions

3. **Database Security**:
   - Use Row Level Security (RLS) in Supabase
   - Limit API permissions to minimum required
   - Regular security audits of access patterns

## Next Steps

1. **Custom Domain**: Add your own domain in Netlify dashboard
2. **HTTPS**: Automatic with Netlify (Let's Encrypt)
3. **Performance**: Monitor Core Web Vitals in Netlify Analytics
4. **Scaling**: Configure build notifications and deploy previews

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

*This deployment strategy provides professional hosting for your frontend while maintaining the powerful local Claude Code backend for AI-powered task processing.*