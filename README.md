# Monthly Budget Calculator - ETF Investment Planner

A modern, responsive budget calculator that helps you optimize your spending and maximize ETF investments.

## Features

- 📊 **Monthly Budget Planning** - Track income and expenses across essential and discretionary categories
- 💰 **Investment Optimization** - Calculate ideal investment splits (ETF, Bitcoin, Ethereum)
- 📈 **10-Year Projections** - Visualize long-term investment growth
- 📱 **Revolut Import** - Import your Revolut CSV statements for automatic expense categorization
- 🌍 **Multi-language Support** - English and Croatian (Hrvatski)
- 🎨 **Dark/Light Theme** - Beautiful UI with theme switching
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## Development

### Prerequisites

- Node.js 20+
- Yarn

### Install Dependencies

```bash
yarn install
```

### Run Development Server

```bash
yarn dev
```

### Build for Production

```bash
yarn build
```

### Preview Production Build

```bash
yarn preview
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push to main/master branch**:
   - The workflow will automatically build and deploy your app
   - The workflow runs on every push to `main` or `master` branch

3. **Access your deployed app**:
   - If your repo is `username/investment-calculator`, your app will be available at:
     `https://username.github.io/investment-calculator/`
   - If your repo is `username.github.io`, your app will be available at:
     `https://username.github.io/`

### Manual Deployment

If you need to deploy manually:

```bash
# Build with GitHub Pages configuration
GITHUB_PAGES=true GITHUB_REPOSITORY=username/investment-calculator yarn build

# Then push the dist folder to the gh-pages branch
# (GitHub Actions handles this automatically)
```

### Configuration

The base path is automatically configured based on your repository name. If you need to customize it, edit `vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES === 'true' 
  ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'investment-calculator'}/`
  : '/',
```

## Project Structure

```
src/
├── components/          # Shared components (ThemeToggle, ControlIsland)
├── react/
│   └── budget/         # Budget calculator feature
│       ├── components/  # Budget-specific components
│       ├── hooks/       # Custom hooks
│       ├── locales/     # Translation files (en.json, hr.json)
│       ├── utils/       # Utility functions
│       └── config.ts    # Category configurations
└── main.tsx            # App entry point
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **DaisyUI** - UI components
- **Chart.js** - Data visualization
- **i18next** - Internationalization
- **Vitest** - Testing

## License

MIT
