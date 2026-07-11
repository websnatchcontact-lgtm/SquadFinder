# Local Development Guide

## Prerequisites

- **Node.js**: v24.x (as defined in `.replit` for maximum compatibility)
- **pnpm**: v11+ (the project uses pnpm workspaces and requires pnpm v11 or higher)

## Environment Variables

The application gracefully falls back to default values for local development if environment variables are missing, meaning **no environment variables are strictly required** to run the app locally.

### Optional Variables
- `PORT`: The port for the development server (Defaults to `5173`)
- `BASE_PATH`: The base routing path for Vite and Wouter (Defaults to `/`)
- `NODE_ENV`: Standard Node environment flag (set to `production` during build)
- `REPL_ID`: Injected automatically when running on Replit (used to selectively enable Replit-specific Vite plugins like the cartographer and dev banner)

## How to run locally (Windows, macOS, Linux)

This project uses pnpm workspaces. To run the frontend locally:

1. Install dependencies from the root directory:
   ```bash
   pnpm install
   ```

2. Start the development server for the `squadfinder` app:
   ```bash
   pnpm --filter @workspace/squadfinder run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## How to run on Replit

1. Click the **Run** button at the top of your Replit workspace.
2. Replit will automatically execute `pnpm install` and start the server using the configuration in `.replit`.

## How to build

To compile the application for production:

```bash
pnpm --filter @workspace/squadfinder run build
```

This will create a `dist/public` folder inside `artifacts/squadfinder/` containing the compiled static assets.

## How to deploy

Since SquadFinder is a static Single Page Application (SPA) powered by Vite, it can be deployed to any static hosting provider.

1. Run the build command above.
2. Deploy the `artifacts/squadfinder/dist/public` directory to services like **Vercel**, **Netlify**, **GitHub Pages**, or deploy directly via **Replit Autoscale**.

---

*Note: The project previously contained Replit-specific configurations (like ignoring Windows-specific binaries in `pnpm-workspace.yaml` and strictly requiring `PORT`/`BASE_PATH` in `vite.config.ts`). These have been patched to safely support cross-platform local development without breaking native Replit compatibility.*
