<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Universal Prompt Generator Pro

An enterprise-grade platform for designing, testing, and managing high-quality LLM prompts. Features include a template library, model-specific compilation, quality scoring, and an agentic workbench for complex workflows.

## ✨ Features

- 🎯 **Prompt Template Library**: Create, organize, and version control prompt templates
- 🔬 **Interactive Playground**: Test prompts with multiple LLM models
- 🤖 **Agentic Workbench**: Build complex AI workflows with a visual node-based editor
- 🔧 **Tool Library**: Integrate external APIs and services
- 📚 **Knowledge Library**: Manage and index knowledge sources (PDFs, websites, APIs)
- 📊 **Quality Scoring**: Automated quality assessment for prompts
- 🚀 **Deployments**: Deploy and manage prompt versions in production
- 📈 **Analytics Dashboard**: Track usage, performance, and quality metrics
- 🧪 **A/B Testing**: Compare prompt versions with data-driven insights

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **Gemini API Key** - Get yours at [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/UniPromptGen2.git
   cd UniPromptGen2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

This is a **React + TypeScript** application built with:

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **UI**: Tailwind CSS
- **State Management**: React Hooks + Immer
- **LLM Integration**: Google Gemini API
- **Workflow Editor**: React Flow
- **Charts**: Recharts

### Project Structure

```
UniPromptGen2/
├── components/       # Reusable React components
│   ├── common/      # Shared UI components
│   ├── editor/      # Template editor components
│   ├── library/     # Library view components
│   ├── playground/  # Playground components
│   └── workbench/   # Agentic workbench components
├── pages/           # Main application pages
├── services/        # API and business logic services
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types.ts         # TypeScript type definitions
└── src/             # Python backend (optional)
```

## 📖 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔧 Configuration

### TypeScript

The project uses TypeScript with strict type checking. Configuration is in `tsconfig.json`.

### Vite

Build configuration is in `vite.config.ts`. Key features:
- React plugin for fast refresh
- Path aliases (`@/` maps to root)
- Environment variable injection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features (when applicable)
4. Update documentation as needed

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [View in AI Studio](https://ai.studio/apps/drive/1GF737KXvF1YTcYeDCqoSskgzWnG-i7MI)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

## 🙏 Acknowledgments

Built with [Google AI Studio](https://ai.studio/) and powered by [Gemini API](https://ai.google.dev/gemini-api).

