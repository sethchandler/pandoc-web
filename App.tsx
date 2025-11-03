import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Format } from './types';
import { INPUT_FORMATS, OUTPUT_FORMATS, DEFAULT_INPUT_TEXT, BINARY_FORMATS } from './constants';
import { convertText } from './services/geminiService';

// --- UI & Icon Components ---

const ConvertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
    <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
  </svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 7.414V13a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const ButtonSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-sky-200"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-sky-200" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-sky-200" style={{ animationDelay: '0.4s' }}></div>
        <span className="text-white">Converting...</span>
    </div>
);

const CONVERSION_MESSAGES = [
    "Preparing your document for conversion...",
    "Establishing a secure connection to the AI engine...",
    "The AI is analyzing the input format...",
    "Translating content to the target format...",
    "Applying formatting rules and styles...",
    "Generating the final document structure...",
    "Performing quality checks on the output...",
    "Almost there, just polishing the final bits...",
];

const ConversionInProgress = ({ message }: { message: string }) => (
    <div className="text-center p-8 flex flex-col items-center justify-center h-full min-h-[16rem]">
        <div className="spinner"></div>
        <h3 className="text-lg font-semibold text-slate-700 mt-4">Conversion in Progress</h3>
        <p className="text-slate-600 mt-2">{message}</p>
    </div>
);

// --- Mappings & Constants ---

const extensionToFormatMap: Record<string, Format> = {
    'md': Format.Markdown,
    'markdown': Format.Markdown,
    'rst': Format.RST,
    'html': Format.HTML,
    'htm': Format.HTML,
    'tex': Format.LaTeX,
    'latex': Format.LaTeX,
    'rtf': Format.RichText,
    'txt': Format.PlainText,
    'json': Format.JSON,
    'adoc': Format.AsciiDoc,
    'asciidoc': Format.AsciiDoc,
    'org': Format.OrgMode,
    'wiki': Format.MediaWiki,
    'textile': Format.Textile,
    'xhtml': Format.XHTML,
    'dbk': Format.DocBook,
    'docbook': Format.DocBook,
    'tei': Format.TEI,
    'opml': Format.OPML,
    'jira': Format.JiraWiki,
    'creole': Format.Creole,
    'muse': Format.Muse,
    't2t': Format.Txt2Tags,
    'ctx': Format.ConTeXt,
};
const acceptedFileTypes = Object.keys(extensionToFormatMap).map(ext => `.${ext}`).join(',');

// --- Main App Component ---

export default function App() {
    const [inputText, setInputText] = useState<string>(DEFAULT_INPUT_TEXT);
    const [inputFormat, setInputFormat] = useState<Format>(Format.Markdown);
    const [outputFormat, setOutputFormat] = useState<Format>(Format.HTML);
    const [outputText, setOutputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>(CONVERSION_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
    const [copySuccess, setCopySuccess] = useState<string>('');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let intervalId: number | undefined;
        if (isLoading) {
            let messageIndex = 0;
            setLoadingMessage(CONVERSION_MESSAGES[0]); // Reset to first message on start
            intervalId = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % CONVERSION_MESSAGES.length;
                setLoadingMessage(CONVERSION_MESSAGES[messageIndex]);
            }, 2000); // Cycle every 2 seconds
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isLoading]);

    const handleConvert = useCallback(async () => {
        if (!inputText.trim()) {
            setError("Input text cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutputText('');
        setCopySuccess('');
        try {
            const result = await convertText(inputText, inputFormat, outputFormat);
            setOutputText(result);
            setActiveTab(outputFormat === Format.HTML ? 'preview' : 'raw');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [inputText, inputFormat, outputFormat]);

    const handleCopy = useCallback(() => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText).then(() => {
            setCopySuccess('Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy.');
        });
    }, [outputText]);
    
    const handleDownload = useCallback(() => {
        if (!outputText) return;
    
        const mimeTypeMap: Record<string, string> = {
            [Format.HTML]: 'text/html',
            [Format.XHTML]: 'application/xhtml+xml',
            [Format.RichText]: 'application/rtf',
            [Format.LaTeX]: 'application/x-tex',
            [Format.ConTeXt]: 'application/x-tex',
            [Format.Beamer]: 'application/x-tex',
            [Format.Markdown]: 'text/markdown',
            [Format.CommonMark]: 'text/markdown',
            [Format.MarkdownStrict]: 'text/markdown',
            [Format.MarkdownPHPExtra]: 'text/markdown',
            [Format.MarkdownGithub]: 'text/markdown',
            [Format.MarkdownMMD]: 'text/markdown',
            [Format.PlainText]: 'text/plain',
            [Format.RST]: 'text/x-rst',
            [Format.OrgMode]: 'text/x-org',
            [Format.AsciiDoc]: 'text/asciidoc',
            [Format.MediaWiki]: 'text/plain',
            [Format.Textile]: 'text/x-textile',
            [Format.Creole]: 'text/x-creole',
            [Format.Muse]: 'text/plain',
            [Format.Txt2Tags]: 'text/plain',
            [Format.JiraWiki]: 'text/plain',
            [Format.DocBook]: 'application/docbook+xml',
            [Format.TEI]: 'application/tei+xml',
            [Format.JATS]: 'application/jats+xml',
            [Format.OPML]: 'text/xml',
            [Format.ICML]: 'application/vnd.adobe.incopy-icml',
            [Format.JSON]: 'application/json',
            [Format.YAML]: 'application/x-yaml',
            [Format.CSV]: 'text/csv',
            [Format.TSV]: 'text/tab-separated-values',
            [Format.BibTeX]: 'application/x-bibtex',
            [Format.BibLaTeX]: 'application/x-bibtex',
            [Format.CSLJSON]: 'application/json',
            [Format.CSLYAML]: 'application/x-yaml',
            [Format.ePub]: 'application/epub+zip',
            [Format.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            [Format.ODT]: 'application/vnd.oasis.opendocument.text',
            [Format.PDF]: 'application/pdf',
        };
    
        const extensionMap: Record<string, string> = {
             [Format.HTML]: '.html',
             [Format.XHTML]: '.xhtml',
             [Format.RichText]: '.rtf',
             [Format.LaTeX]: '.tex',
             [Format.ConTeXt]: '.tex',
             [Format.Beamer]: '.tex',
             [Format.Markdown]: '.md',
             [Format.CommonMark]: '.md',
             [Format.MarkdownStrict]: '.md',
             [Format.MarkdownPHPExtra]: '.md',
             [Format.MarkdownGithub]: '.md',
             [Format.MarkdownMMD]: '.md',
             [Format.PlainText]: '.txt',
             [Format.RST]: '.rst',
             [Format.OrgMode]: '.org',
             [Format.AsciiDoc]: '.adoc',
             [Format.MediaWiki]: '.wiki',
             [Format.Textile]: '.textile',
             [Format.Creole]: '.creole',
             [Format.Muse]: '.muse',
             [Format.Txt2Tags]: '.t2t',
             [Format.JiraWiki]: '.jira',
             [Format.DocBook]: '.dbk',
             [Format.TEI]: '.xml',
             [Format.JATS]: '.xml',
             [Format.OPML]: '.opml',
             [Format.ICML]: '.icml',
             [Format.JSON]: '.json',
             [Format.YAML]: '.yaml',
             [Format.CSV]: '.csv',
             [Format.TSV]: '.tsv',
             [Format.BibTeX]: '.bib',
             [Format.BibLaTeX]: '.bib',
             [Format.CSLJSON]: '.json',
             [Format.CSLYAML]: '.yaml',
             [Format.ePub]: '.epub',
             [Format.DOCX]: '.docx',
             [Format.ODT]: '.odt',
             [Format.PDF]: '.pdf',
        };
    
        const isBinary = BINARY_FORMATS.includes(outputFormat as Format);
        let blob;

        if (isBinary) {
            try {
                const byteCharacters = atob(outputText);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: mimeTypeMap[outputFormat] });
            } catch (e) {
                console.error("Failed to decode base64 string:", e);
                setError("The returned content for the binary format was not valid base64. Cannot create download file.");
                return;
            }
        } else {
             blob = new Blob([outputText], { type: mimeTypeMap[outputFormat] ?? 'text/plain' });
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted-document${extensionMap[outputFormat] ?? '.txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [outputText, outputFormat]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setInputText(content);
            
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension) {
                const detectedFormat = extensionToFormatMap[extension];
                if (detectedFormat && INPUT_FORMATS.includes(detectedFormat)) {
                    setInputFormat(detectedFormat);
                }
            }
        };
        reader.onerror = () => {
            setError("Failed to read the selected file.");
            setUploadedFileName(null);
        };
        reader.readAsText(file);
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const isHtmlOutput = useMemo(() => [Format.HTML, Format.XHTML].includes(outputFormat as Format), [outputFormat]);
    const isBinaryOutput = useMemo(() => BINARY_FORMATS.includes(outputFormat as Format), [outputFormat]);

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
            <main className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">Pandoc Web</h1>
                    <p className="text-lg text-slate-600 mt-2">The friendly web-based document converter</p>
                </header>
                
                <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-8 flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <InfoIcon />
                    </div>
                    <div>
                        <h2 className="font-bold">Welcome, beginner!</h2>
                        <p className="text-sm">This tool helps you change documents from one format to another (like from Markdown to HTML). Just follow the steps below. The text editor is already filled with an example to get you started.</p>
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-8">
                    {/* Step 1: Input */}
                    <section>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                            <label htmlFor="input-format" className="block text-lg font-semibold text-slate-700">Step 1: Provide Input</label>
                             <button
                                onClick={handleUploadClick}
                                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                            >
                                <UploadIcon/> Upload File
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={acceptedFileTypes} />
                        
                        <label htmlFor="input-format-select" className="block text-sm font-medium text-slate-600 mb-1 mt-2">Input Format</label>
                        <select
                            id="input-format-select"
                            value={inputFormat}
                            onChange={(e) => setInputFormat(e.target.value as Format)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        >
                            {INPUT_FORMATS.map(format => <option key={format} value={format}>{format}</option>)}
                        </select>

                        {uploadedFileName && (
                            <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                                Loaded file: <span className="font-medium text-slate-800">{uploadedFileName}</span>
                            </div>
                        )}

                        <textarea
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                setUploadedFileName(null);
                            }}
                            placeholder="Paste your text here, or upload a file above."
                            className="mt-4 w-full h-80 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-mono text-sm"
                        />
                    </section>

                    {/* Step 2: Output */}
                    <section>
                        <label htmlFor="output-format" className="block text-lg font-semibold text-slate-700 mb-2">Step 2: Choose your output format</label>
                        <select
                            id="output-format"
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as Format)}
                             className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        >
                            {OUTPUT_FORMATS.map(format => <option key={format} value={format}>{format}</option>)}
                        </select>
                    </section>

                    {/* Step 3: Convert Button */}
                    <section className="text-center">
                        <button
                            onClick={handleConvert}
                            disabled={isLoading}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-sky-600 text-white font-bold text-lg rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            {isLoading ? <ButtonSpinner/> : <><ConvertIcon/> Convert Document</>}
                        </button>
                    </section>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Step 4: Output */}
                    {(outputText || isLoading) && !error && (
                        <section className="pt-6 border-t border-slate-200">
                             <h2 className="text-lg font-semibold text-slate-700 mb-4">Step 3: Your Converted Document</h2>
                             <div className="bg-slate-50 rounded-lg border border-slate-200 min-h-[20rem]">
                                {isLoading ? (
                                    <ConversionInProgress message={loadingMessage} />
                                ) : (
                                    <>
                                        {isHtmlOutput && !isBinaryOutput && (
                                            <div className="border-b border-slate-200 px-4">
                                                <button onClick={() => setActiveTab('preview')} className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>Preview</button>
                                                <button onClick={() => setActiveTab('raw')} className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'raw' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>Raw HTML</button>
                                            </div>
                                        )}
                                        <div className="p-4 relative">
                                            {isBinaryOutput ? (
                                                <div className="text-center p-8 flex flex-col items-center justify-center h-full min-h-[16rem]">
                                                    <h3 className="text-lg font-semibold text-slate-700">Binary File Generated</h3>
                                                    <p className="text-slate-600 mt-2">Your {outputFormat} file is ready to be downloaded.</p>
                                                    <p className="text-slate-500 text-sm mt-4">A preview is not available for this format.</p>
                                                </div>
                                            ) : activeTab === 'preview' && isHtmlOutput ? (
                                                <div
                                                    className="prose max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: outputText }}
                                                />
                                            ) : (
                                                <pre className="whitespace-pre-wrap break-words text-sm font-mono">{outputText}</pre>
                                            )}
                                        </div>
                                    </>
                                )}
                             </div>
                             <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                                 <button onClick={handleCopy} disabled={isBinaryOutput || !outputText} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                                     <CopyIcon/> Copy
                                 </button>
                                 <button onClick={handleDownload} disabled={!outputText} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                                     <DownloadIcon/> Download
                                 </button>
                                 {copySuccess && <span className="text-green-600 text-sm">{copySuccess}</span>}
                             </div>
                        </section>
                    )}
                </div>

                <footer className="text-center mt-8 text-slate-500 text-sm">
                    <p>Powered by Gemini API. Inspired by Pandoc.</p>
                </footer>
            </main>
        </div>
    );
}