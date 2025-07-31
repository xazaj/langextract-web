# LangExtract Web

A web-based intelligent text extraction platform powered by large language models. Built with Next.js and TypeScript.

## Features

- **Intelligent Extraction** - Extract structured information from unstructured text using LLMs
- **Multiple LLM Support** - Compatible with Gemini, OpenAI, and other language models
- **Interactive Visualization** - Real-time animated display of extraction results
- **Example-Driven** - Improve accuracy through few-shot learning examples
- **Precise Positioning** - Character-level positioning for extracted entities
- **Export Results** - Download extraction results as JSON

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern CSS framework
- **Radix UI** - High-quality React components
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/xazaj/langextract-web.git
cd langextract-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Input Text** - Enter the text you want to extract information from
2. **Describe Extraction** - Specify what information you want to extract
3. **Add Examples** - Provide at least one example of expected extraction results
4. **Configure API** - Enter your LLM API key (Gemini, OpenAI, etc.)
5. **Extract** - Click the extract button to process the text
6. **View Results** - Explore the interactive visualization of extracted entities

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xazaj/langextract-web)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables (if needed)
4. Deploy automatically

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Add any required API keys here
# GEMINI_API_KEY=your_api_key_here
# OPENAI_API_KEY=your_api_key_here
```

## Project Structure

```
src/
├── app/
│   ├── api/extract/route.ts    # API route for text extraction
│   ├── page.tsx               # Main page component
│   └── layout.tsx             # Root layout
├── components/
│   ├── features/
│   │   ├── extraction-form.tsx           # Extraction form component
│   │   └── extraction-visualizer.tsx     # Results visualization
│   └── ui/                    # Reusable UI components
└── lib/
    ├── types.ts              # TypeScript type definitions
    ├── utils.ts              # Utility functions
    ├── config.ts             # Configuration
    └── llm-service.ts        # LLM service abstraction
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Google's [LangExtract](https://github.com/google/langextract) project
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)