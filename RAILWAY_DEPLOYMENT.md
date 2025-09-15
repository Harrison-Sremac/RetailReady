# Railway Deployment Guide for RetailReady

This guide will help you deploy the RetailReady compliance management application to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

## Deployment Steps

### 1. Connect Your Repository

1. Log into Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your preferred Git provider)
4. Choose your `retailReady2` repository
5. Railway will automatically detect the project structure

### 2. Configure Environment Variables

In your Railway project dashboard:

1. Go to the "Variables" tab
2. Add the following environment variables:

```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_actual_openai_api_key_here
```

**Important**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key.

### 3. Add Persistent Volume (for Database)

Since the application uses SQLite, you need persistent storage:

1. In your Railway project, go to "Settings"
2. Click "Add Volume"
3. Set the mount path to `/data`
4. This will persist your SQLite database across deployments

### 4. Deploy

1. Railway will automatically start building and deploying your application
2. The build process will:
   - Install all dependencies (root, backend, frontend)
   - Build the React frontend
   - Start the Node.js server
3. Once deployed, Railway will provide you with a public URL

### 5. Verify Deployment

1. Visit your Railway app URL
2. You should see the RetailReady application interface
3. Test the health endpoint: `https://your-app.railway.app/api/health`
4. Try uploading a PDF to test the full functionality

## Project Structure

The deployment includes:

- **Backend**: Express.js API server with SQLite database
- **Frontend**: React application built and served statically
- **Database**: SQLite with persistent volume storage
- **File Uploads**: Temporary storage for PDF processing

## Configuration Files Added

The following files were added for Railway deployment:

- `railway.json` - Railway-specific configuration
- `nixpacks.toml` - Build configuration
- `Dockerfile` - Container configuration
- `.dockerignore` - Docker ignore patterns
- `railway.env.example` - Environment variables template

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Server port (Railway sets this automatically) |
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for PDF parsing |
| `RAILWAY_PUBLIC_DOMAIN` | Auto | Railway-provided public domain |
| `FRONTEND_URL` | No | Custom frontend URL (optional) |

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are properly listed in package.json files
   - Ensure Node.js version compatibility

2. **Database Issues**
   - Verify the persistent volume is mounted at `/data`
   - Check database initialization logs

3. **API Key Issues**
   - Ensure your OpenAI API key is valid and has sufficient credits
   - Check the environment variables are set correctly

4. **CORS Issues**
   - The app automatically handles CORS for Railway domains
   - If using a custom domain, update the `FRONTEND_URL` variable

### Logs and Monitoring

- View application logs in the Railway dashboard
- Monitor resource usage and performance
- Set up alerts for critical errors

## Scaling and Performance

- Railway automatically handles scaling based on traffic
- Consider upgrading to a paid plan for better performance
- Monitor database size and consider migration to PostgreSQL for larger datasets

## Security Considerations

- Keep your OpenAI API key secure and never commit it to version control
- Use Railway's built-in HTTPS
- Consider implementing rate limiting for production use
- Regularly update dependencies for security patches

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Community: [discord.gg/railway](https://discord.gg/railway)
- Project Issues: Create an issue in your repository

## Next Steps

After successful deployment:

1. Set up a custom domain (optional)
2. Configure monitoring and alerts
3. Set up automated backups for the database
4. Consider implementing CI/CD for automatic deployments
5. Add SSL certificates for custom domains

---

**Note**: This deployment uses Railway's free tier limitations. For production use with high traffic, consider upgrading to a paid plan.
