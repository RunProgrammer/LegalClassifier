import axios from 'axios';
import { useState, useRef } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiEye, FiFileText, FiMessageSquare, FiCalendar, FiUploadCloud, FiX, FiSend, FiChevronsUp } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Helper Components & Functions ---

const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>;

const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
        case 'high': return 'bg-red-500 text-white';
        case 'medium': return 'bg-orange-500 text-white';
        case 'low': return 'bg-yellow-500 text-black';
        default: return 'bg-gray-500 text-white';
    }
};

const AccordionCard = ({ title, icon, children, isOpen, onToggle }) => (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left">
            <div className="flex items-center gap-3">
                <div className="text-2xl text-slate-400">{icon}</div>
                <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
            </div>
            <FiChevronsUp className={`text-2xl text-slate-400 transform transition-transform ${isOpen ? '' : 'rotate-180'}`} />
        </button>
        {isOpen && <div className="p-4 pt-0 animate-fade-in">{children}</div>}
    </div>
);

const FileUploadZone = ({ onUpload, isLoading }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => setFiles(Array.from(e.target.files));
    const handleDragEvents = (e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };
    const handleDrop = (e) => {
        handleDragEvents(e, false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length) {
            setFiles(droppedFiles);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onUpload(e, files);
    };

    return (
        <form onSubmit={handleSubmit} onDragEnter={(e) => handleDragEvents(e, true)} onDragOver={(e) => handleDragEvents(e, true)} onDragLeave={(e) => handleDragEvents(e, false)} onDrop={handleDrop}
            className={`w-full bg-slate-800 p-8 rounded-lg flex flex-col items-center gap-4 border-2 border-dashed ${isDragging ? 'border-violet-500' : 'border-slate-600'} transition-colors`}>
            <FiUploadCloud className="h-16 w-16 text-slate-500" />
            <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
            <p className="text-sm text-slate-400">Drag & Drop or Click to Select Files</p>
            <input type="file" multiple name="fileIP" id="file-upload" className="hidden" onChange={handleFileChange} />
            <label htmlFor="file-upload" className="cursor-pointer bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600">Select Files</label>
            {files.length > 0 && (
                <div className="w-full mt-4 text-left">
                    <h4 className="font-semibold">Selected files:</h4>
                    <ul className="list-disc list-inside text-slate-300">
                        {files.map(file => <li key={file.name}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>)}
                    </ul>
                </div>
            )}
            <button type="submit" disabled={isLoading || files.length === 0} className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 flex justify-center">
                {isLoading ? <Spinner /> : 'Analyze Documents'}
            </button>
        </form>
    );
};

const ProcedureWalkthrough = ({ onGenerate, isLoading }) => {
    return (
        <form onSubmit={onGenerate} className="w-full bg-slate-800 p-8 rounded-lg flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Legal Procedure Walkthrough</h2>
            <p className="text-sm text-slate-400">Describe your goal and get a step-by-step plan.</p>
            <textarea name="goal" placeholder="e.g., I want to buy a flat in Bangalore" className="p-2 bg-slate-700 border-slate-600 rounded-md h-24 text-white" disabled={isLoading} />
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 flex justify-center">
                {isLoading ? <Spinner /> : 'Generate Roadmap'}
            </button>
        </form>
    );
};

const FloatingChatWidget = ({ history, onSendMessage, isLoading, isOpen, setIsOpen }) => (
    <>
        <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg z-50">
            {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
        </button>
        {isOpen && (
            <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl flex flex-col z-40 animate-fade-in">
                <header className="p-4 bg-slate-900 rounded-t-lg"><h3 className="text-xl font-semibold text-cyan-400">Chat Assistant</h3></header>
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {history.map((qa, index) => (
                        <div key={index}>
                            <p className="font-semibold text-slate-300">You: {qa.question}</p>
                            <p className="whitespace-pre-wrap text-cyan-200">AI: {qa.answer}</p>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-center p-4"><Spinner /></div>}
                </div>
                <form onSubmit={onSendMessage} className="p-4 flex gap-2 border-t border-slate-700">
                    <input type="text" name="qaInput" placeholder="Ask a question..." className="flex-grow p-2 bg-slate-700 border-slate-600 rounded-md text-white" disabled={isLoading} />
                    <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2 rounded-md disabled:bg-gray-500"><FiSend /></button>
                </form>
            </div>
        )}
    </>
);


// --- Main Home Component ---

function Home() {
    const [language, setLanguage] = useState('english');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [qaHistory, setQaHistory] = useState([]);
    const [currentGoal, setCurrentGoal] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [openSections, setOpenSections] = useState({ alerts: true, favourable: true, watch: true, summary: true, timeline: true });

    const timelineRef = useRef(null);

    const handleSectionToggle = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFileUpload = async (e, files) => {
        e.preventDefault();
        if (!files || files.length === 0) {
            setError("Please select at least one file to upload.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults(null);
        setQaHistory([]);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        formData.append("language", language);
        try {
            const res = await axios.post("http://127.0.0.1:8000/upload", formData);
            const apiResponse = res.data.msg[0];
            const structuredData = JSON.parse(apiResponse.fileSummary);
            setResults({ ...structuredData, from: 'document' });
            setIsChatOpen(true);
        } catch (err) {
            setError("Failed to analyze documents. Ensure the backend is running and the API response is valid JSON.");
            console.error("API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcedureGeneration = async (e) => {
        e.preventDefault();
        const goal = e.target.goal.value;
        if (!goal.trim()) {
            setError("Please describe your goal.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults(null);
        setQaHistory([]);
        setCurrentGoal(goal);
        try {
            const res = await axios.post("http://127.0.0.1:8000/roadmap", { text: goal, language });
            const data = JSON.parse(res.data.msg);
            setResults({ ...data, from: 'roadmap' });
            setIsChatOpen(true);
        } catch (err) {
            setError("Failed to generate the procedure. Please try again.");
            console.error("API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQA = async (e) => {
        e.preventDefault();
        const qaInput = e.target.qaInput.value;
        if (!qaInput.trim() || !results) return;
        setIsLoading(true);
        e.target.qaInput.value = '';

        try {
            let contextStrings = [];
            if (results.from === 'document') {
                contextStrings = [results.summary];
            } else if (results.from === 'roadmap') {
                const roadmapContext = `User's Goal: ${currentGoal}\n\nTimeline:\n${results.timeline.join('\n')}\n\nKey Points:\n${results.key_points.join('\n')}`;
                contextStrings = [roadmapContext];
            }
            const res = await axios.post('http://127.0.0.1:8000/qa', {
                question: qaInput,
                context: contextStrings,
                language: language
            });
            setQaHistory(prev => [...prev, { question: qaInput, answer: res.data.msg }]);
        } catch (err) {
            setError("Could not get an answer. Please try again.");
            e.target.qaInput.value = qaInput;
        } finally {
            setIsLoading(false);
        }
    };

    // In Home.jsx, replace the entire function with this one.

// In Home.jsx, replace the entire handleExportPDF function with this.

// In Home.jsx, replace the entire handleExportPDF function with this.

const handleExportPDF = () => {
    if (!results || !results.timeline) {
        setError("No timeline data available to export.");
        return;
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = margin;

        // --- Set Title ---
        pdf.setFontSize(18);
        pdf.text("Procedural Roadmap", margin, yPosition);
        yPosition += 15;

        // --- Add Timeline Steps ---
        pdf.setFontSize(12);
        
        results.timeline.forEach((step, index) => {
            // Add a bullet point circle for visual structure
            pdf.circle(margin, yPosition - 1.5, 1.5, 'F'); // 'F' for fill

            // Use splitTextToSize to handle automatic line wrapping
            const textLines = pdf.splitTextToSize(`Step ${index + 1}: ${step}`, pdf.internal.pageSize.getWidth() - (margin * 2) - 5);

            // Check if there is enough space on the page for the text block
            if (yPosition + (textLines.length * 7) > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }

            pdf.text(textLines, margin + 5, yPosition);
            yPosition += (textLines.length * 7) + 5; // Move y-position down for the next item
        });

        pdf.save("roadmap.pdf");

    } catch (err) {
        console.error("PDF export failed:", err);
        setError("Could not generate the PDF file.");
    }
};
    // In Home.jsx, inside the Home component

const handleExportAnalysisPDF = () => {
    if (!results || results.from !== 'document') {
        setError("No document analysis data available to export.");
        return;
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = margin;

        // --- Helper function to add a new section and handle page breaks ---
        const addSection = (title, content, titleSize = 16, contentSize = 12) => {
            if (yPosition > pageHeight - margin) { // Check for page break before adding a new section
                pdf.addPage();
                yPosition = margin;
            }
            
            pdf.setFontSize(titleSize);
            pdf.text(title, margin, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(contentSize);

            content.forEach(item => {
                let text;
                if (typeof item === 'object') { // For alerts with severity
                    text = `[${item.severity}] ${item.message}`;
                } else { // For simple bullet points
                    text = `- ${item}`;
                }
                
                const textLines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
                
                if (yPosition + (textLines.length * 7) > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                pdf.text(textLines, margin, yPosition);
                yPosition += (textLines.length * 7) + 3;
            });
            
            yPosition += 10; // Add extra space between sections
        };
        
        // --- Build the PDF Document ---
        pdf.setFontSize(22);
        pdf.text("Document Analysis Report", margin, yPosition);
        yPosition += 20;

        if (results.alerts?.length > 0) {
            addSection("To be addressed (Alerts)", results.alerts);
        }
        if (results.favourable_terms?.length > 0) {
            addSection("Favourable Terms", results.favourable_terms);
        }
        if (results.clauses_to_watch?.length > 0) {
            addSection("Clauses to Watch", results.clauses_to_watch);
        }
        if (results.summary) {
            addSection("Summary", [results.summary]);
        }
        
        pdf.save("document_analysis.pdf");

    } catch (err) {
        console.error("PDF export failed:", err);
        setError("Could not generate the analysis PDF file.");
    }
};

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-slate-900 to-purple-900 p-4 md:p-8 text-white font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold">LegalClassifier</h1>
                    <p className="text-lg text-slate-300 mt-2">Your AI-Powered Legal & Procedural Navigator</p>
                    <div className="mt-4 flex justify-center items-center gap-2">
                        <label htmlFor="language-select" className="text-slate-300">Language:</label>
                        <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className='p-2 bg-slate-700 rounded-md text-white'>
                            <option value="english">English</option>
                            <option value="tamil">Tamil</option>
                            <option value="malayalam">Malayalam</option>
                            <option value="hindi">Hindi</option>
                        </select>
                    </div>
                </header>

                {!results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <FileUploadZone onUpload={handleFileUpload} isLoading={isLoading} />
                        <ProcedureWalkthrough onGenerate={handleProcedureGeneration} isLoading={isLoading} />
                    </div>
                )}
                
                {error && <div className="bg-red-500 p-4 rounded-md text-center mt-8" onClick={() => setError(null)}>{error}</div>}
                
                {results && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-white">Analysis Dashboard</h2>
                            <div className='flex gap-4'>
                                <button onClick={handleExportAnalysisPDF} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md">
                                    Export Analysis 📃
                                </button>
                                <button onClick={() => setResults(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Start Over</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <AccordionCard title="To be addressed" icon={<FiAlertTriangle />} isOpen={openSections.alerts} onToggle={() => handleSectionToggle('alerts')}>
                                {results.alerts?.length > 0 ? (
                                    <ul className="space-y-2">{results.alerts.map((alert, i) => (
                                        <li key={i} className="flex items-center gap-3 bg-slate-700 p-3 rounded-md">
                                            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getSeverityClass(alert.severity)}`}>{alert.severity}</span>
                                            <span>{alert.message}</span>
                                        </li>))}
                                    </ul>
                                ) : <p className="text-slate-400">No critical issues found.</p>}
                            </AccordionCard>

                            {results.favourable_terms && (
                                <AccordionCard title="Favourable Terms" icon={<FiCheckCircle />} isOpen={openSections.favourable} onToggle={() => handleSectionToggle('favourable')}>
                                    {results.favourable_terms.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2 text-slate-300">{results.favourable_terms.map((point, i) => <li key={i}>{point}</li>)}</ul>
                                    ) : <p className="text-slate-400">No specific favourable terms identified.</p>}
                                </AccordionCard>
                            )}

                            {results.clauses_to_watch && (
                                <AccordionCard title="Clauses to Watch" icon={<FiEye />} isOpen={openSections.watch} onToggle={() => handleSectionToggle('watch')}>
                                    {results.clauses_to_watch.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2 text-slate-300">{results.clauses_to_watch.map((point, i) => <li key={i}>{point}</li>)}</ul>
                                    ) : <p className="text-slate-400">No specific clauses needed special attention.</p>}
                                </AccordionCard>
                            )}
                            
                            {results.summary && (
                                <AccordionCard title="Summary" icon={<FiFileText />} isOpen={openSections.summary} onToggle={() => handleSectionToggle('summary')}>
                                    <p className="whitespace-pre-wrap text-slate-300">{results.summary}</p>
                                </AccordionCard>
                            )}
                            
                            {results.timeline && (
                                <AccordionCard title="Time Line / Roadmap" icon={<FiCalendar />} isOpen={openSections.timeline} onToggle={() => handleSectionToggle('timeline')}>
                                    <button onClick={handleExportPDF} className="mb-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md">Export to PDF</button>
                                    <div ref={timelineRef} className="p-4 bg-slate-700 text-white rounded-md">
                                        <ol className="relative border-l border-slate-500 space-y-6">
                                            {results.timeline.map((step, i) => (
                                                <li key={i} className="ml-6">
                                                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full -left-3 ring-8 ring-slate-700">
                                                        <svg className="w-2.5 h-2.5 text-blue-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/></svg>
                                                    </span>
                                                    <p className="text-slate-300">{step}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </AccordionCard>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {results && <FloatingChatWidget history={qaHistory} onSendMessage={handleQA} isLoading={isLoading} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </div>
    );
}

export default Home;