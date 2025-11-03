# Pandoc Web

A user-friendly web application that simplifies document format conversion, inspired by the powerful Pandoc tool. This application uses the Google Gemini API to perform conversions between various text formats.

## Features

*   **Simple Interface**: A clean, step-by-step process for converting documents.
*   **Wide Format Support**: Convert between various formats.
*   **Live Preview**: Preview HTML output directly in the browser.
*   **Downloadable Files**: Download the converted output, including binary formats like ePub, DOCX, and PDF.

### Supported Input Formats
- AsciiDoc
- CommonMark
- ConTeXt
- Creole
- DocBook
- HTML
- Jira Wiki
- JSON
- LaTeX
- Markdown (and flavors like GFM, Strict, PHP Extra, MultiMarkdown)
- MediaWiki
- Muse
- OPML
- Org Mode
- Plain Text
- Rich Text Format (RTF)
- reStructuredText (RST)
- TEI
- Textile
- Txt2Tags
- XHTML

### Supported Output Formats
- AsciiDoc
- Beamer
- BibTeX & BibLaTeX
- CommonMark
- ConTeXt
- Creole
- CSL JSON & YAML
- CSV & TSV
- DocBook
- HTML & XHTML
- ICML
- JATS
- Jira Wiki
- JSON & YAML
- LaTeX
- Markdown (and flavors like GFM, Strict, PHP Extra, MultiMarkdown)
- MediaWiki
- Muse
- OPML
- Org Mode
- Plain Text
- Rich Text Format (RTF)
- reStructuredText (RST)
- TEI
- Textile
- ePub
- Microsoft Word (docx)
- OpenDocument Text (ODT)
- PDF

## How It Works

This application sends the input text and format specifications to the Google Gemini API. A specialized prompt instructs the model to act as a document converter, similar to Pandoc. The converted text or base64-encoded binary file is then returned and displayed or made available for download.

## Getting Started

### Prerequisites

*   A modern web browser.
*   A Google Gemini API key.

### API Key Configuration

This application requires a Google Gemini API key to function. The key must be provided as an environment variable named `API_KEY`.

**IMPORTANT**: The application code is designed to read the API key from `process.env.API_KEY`. You must ensure this variable is available in the environment where you run or deploy the application. The application does not include a user interface for entering the key.

### Running Locally

To run this application on your local machine, you need a simple local web server.

1.  **Clone or download the repository/files.**
2.  **Set the API Key**: How you set the `API_KEY` environment variable depends on your setup. For development, you might use a tool that injects environment variables or modify the server start script.
3.  **Start a local server**: Navigate to the project's root directory in your terminal and use a command like Python's built-in server:
    ```bash
    # For Python 3
    python -m http.server
    ```
4.  **Open the app**: Open your web browser and go to `http://localhost:8000`.

### Deploying to a Website (e.g., GitHub Pages)

You can host this application on any static web hosting service.

1.  **Upload the files** (`index.html`, `index.tsx`, etc.) to your web host.
2.  **Configure Environment Variable**: Your hosting provider must have a way to inject the `API_KEY` environment variable into your static site's runtime environment. For services like Vercel or Netlify, this can be done in the project's settings. For GitHub Pages, this is more complex and may require a CI/CD workflow (like GitHub Actions) to substitute the key at build time.
3.  **Access your site**: Once deployed, you can access the application via the URL provided by your host.
