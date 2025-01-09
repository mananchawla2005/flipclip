# FlipClip

A modern web application that makes research papers accessible and understandable by providing AI-powered summaries, explanations, and audio narrations.

## Features

- 📄 **Paper Search & Import**: Search and import papers from arXiv
- 🤖 **AI Summaries**: Get concise summaries of complex research papers
- 🎧 **Audio Explanations**: Listen to audio narrations of paper content
- 📝 **Article Breakdowns**: Read simplified explanations organized by sections
- 💡 **FAQ Generation**: Access common questions and answers about the paper
- 🔖 **Paper Clipping**: Bookmark papers for later reference
- 💬 **Interactive Chat**: Ask questions about specific papers

## Technology Stack

- **Frontend**: Vue 3 + Nuxt 3
- **AI/ML**: Google Gemini API for text generation and embeddings
- **Speech**: Azure Text-to-Speech
- **Image Generation**: Cloudflare Stable Diffusion
- **Vector Search**: pgvector for semantic search
- **Authentication**: Auth0
- **Storage**: Azure Blob Storage
- **Styling**: Tailwind CSS

## Getting Started

1. Clone the repository
2. Copy 

.env.example

 to 

.env

 and fill in the required API keys
3. Install dependencies:
```bash
npm install
```
4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Required environment variables in 

.env

:
- `NUXT_AUTH0_DOMAIN`: Auth0 domain
- `NUXT_AUTH0_CLIENT_ID`: Auth0 client ID
- `NUXT_AUTH0_CLIENT_SECRET`: Auth0 client secret
- `NUXT_GOOGLE_API_KEY`: Google AI API key
- `NUXT_AZURE_TTS`: Azure Text-to-Speech key
- `NUXT_CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `NUXT_CLOUDFLARE_ACCOUNT_SECRET`: Cloudflare API token
- `NUXT_AZURE_INDEX`: Azure Storage account key
- `NUXT_DB_URI`: PostgreSQL connection string

## License

MIT License