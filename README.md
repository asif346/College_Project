# Re:Zero AI Website Builder

## About This Project

This project is a modern, AI-powered website builder built from scratch by a human (with a little help from AI!). The goal was to create a tool that lets anyone generate, preview, and iteratively improve beautiful websites using natural language prompts.

## Features

- **AI Website Generation:** Describe your website idea and get a complete, modern site (HTML, CSS, JS) instantly.
- **Live Preview:** See your website update in real time as you generate or improve it.
- **Improvement Suggestions:** Not happy with the result? Suggest improvements and the AI will update your site.
- **Resizable Panels:** Adjust the layout to focus on chat, code, or preview as you like.
- **One-Click Deployment:** Easily deploy your site live with Netlify or Vercel.
- **Modern UI:** Built with shadcn-ui and Tailwind CSS for a clean, responsive experience.

## Tech Stack

- [Vite](https://vitejs.dev/) (blazing fast dev server)
- [React](https://react.dev/) (UI framework)
- [TypeScript](https://www.typescriptlang.org/) (type safety)
- [shadcn-ui](https://ui.shadcn.com/) (UI components)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)

## Getting Started (Local Development)

You'll need [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal) to view the app in your browser.

## How to Use

1. **Start a new chat** and describe the website you want (e.g., "Build me a portfolio site").
2. **Preview your site** instantly in the live preview panel.
3. **Suggest improvements** using the Improvement button if you want changes.
4. **Deploy your site** live with one click (Netlify or Vercel supported).

## Deployment

### Deploy to Netlify (Recommended)
- Click the Deploy button in the app and choose "Deploy Live (Netlify)".
- Download the ZIP and drag it to [Netlify Drop](https://app.netlify.com/drop) for an instant live link.

### Deploy to Vercel
- Click the Deploy button and choose "Deploy to Vercel".
- Download the ZIP and upload it to [Vercel](https://vercel.com/new).

### Manual Deployment
- Download your site as HTML and upload it to any static hosting provider.

## Custom Domains

If you deploy with Netlify or Vercel, you can connect your own custom domain through their dashboard.

## Contributing

Pull requests and suggestions are welcome! If you have ideas for new features or improvements, feel free to open an issue or PR.

## License

MIT
