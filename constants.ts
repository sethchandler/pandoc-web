import { Format } from './types';

export const INPUT_FORMATS: Format[] = [
  Format.AsciiDoc,
  Format.CommonMark,
  Format.ConTeXt,
  Format.Creole,
  Format.DocBook,
  Format.HTML,
  Format.JiraWiki,
  Format.JSON,
  Format.LaTeX,
  Format.Markdown,
  Format.MarkdownGithub,
  Format.MarkdownMMD,
  Format.MarkdownPHPExtra,
  Format.MarkdownStrict,
  Format.MediaWiki,
  Format.Muse,
  Format.OPML,
  Format.OrgMode,
  Format.PlainText,
  Format.RichText,
  Format.RST,
  Format.TEI,
  Format.Textile,
  Format.Txt2Tags,
  Format.XHTML,
];

export const OUTPUT_FORMATS: Format[] = [
  Format.AsciiDoc,
  Format.Beamer,
  Format.BibTeX,
  Format.BibLaTeX,
  Format.CommonMark,
  Format.ConTeXt,
  Format.Creole,
  Format.CSLJSON,
  Format.CSLYAML,
  Format.CSV,
  Format.DocBook,
  Format.DOCX,
  Format.ePub,
  Format.HTML,
  Format.ICML,
  Format.JATS,
  Format.JiraWiki,
  Format.JSON,
  Format.LaTeX,
  Format.Markdown,
  Format.MarkdownGithub,
  Format.MarkdownMMD,
  Format.MarkdownPHPExtra,
  Format.MarkdownStrict,
  Format.MediaWiki,
  Format.Muse,
  Format.ODT,
  Format.OPML,
  Format.OrgMode,
  Format.PDF,
  Format.PlainText,
  Format.RichText,
  Format.RST,
  Format.TEI,
  Format.Textile,
  Format.TSV,
  Format.XHTML,
  Format.YAML,
];


export const BINARY_FORMATS: Format[] = [
  Format.ePub,
  Format.DOCX,
  Format.ODT,
  Format.PDF,
];

export const DEFAULT_INPUT_TEXT = `
# Welcome to Pandoc Web!

This is a simple tool to help you convert text from one format to another. It's designed for beginners, so let's walk through an example.

The text you're reading right now is written in **Markdown**, a simple way to format text.

## How it works

1.  **Write or paste your text** in the box below.
2.  Make sure the **input format** (currently "Markdown") matches your text.
3.  **Choose the output format** you want to convert to.
4.  Click the **"Convert Document"** button.

### Here's a quick example

You can include things like lists:

*   Item 1
*   Item 2
*   Item 3

And even code blocks:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

Now, try converting this document to HTML or another format to see the magic happen!
`.trim();
