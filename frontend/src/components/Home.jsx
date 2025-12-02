import axios from 'axios';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiCheckCircle, FiEye, FiFileText, FiMessageSquare, FiCalendar, FiUploadCloud, FiX, FiSend, FiChevronsUp, FiHome, FiSettings, FiClock, FiLogOut, FiMenu, FiChevronRight, FiMap, FiArrowRight, FiCheck } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import ReactMarkdown from 'react-markdown';
import heroImage from '../assets/hero.png';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- Helper Components ---

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{label}</span>
    </button>
);

const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
        case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

const DashboardCard = ({ title, icon, children, className = "" }) => (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4 border-b border-slate-700/50 pb-3">
            <div className="text-amber-400 text-xl">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

// --- Main App Component ---

function Home() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [language, setLanguage] = useState('english');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [qaHistory, setQaHistory] = useState([]);
    const [history, setHistory] = useState([]);

    const addToHistory = (newItem) => {
        setHistory(prev => [newItem, ...prev]);
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);
        setError(null);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        formData.append('language', language);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Backend returns { msg: [ { fileName, fileSummary } ] }
            const resultData = response.data.msg[0];
            const summaryData = JSON.parse(resultData.fileSummary);

            const resultObj = {
                ...summaryData,
                from: 'document',
                fileName: resultData.fileName,
                date: new Date().toLocaleString()
            };
            setResults(resultObj);
            addToHistory(resultObj);
            setQaHistory([]);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze documents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcedureGeneration = async (e) => {
        e.preventDefault();
        const goal = e.target.goal.value;
        if (!goal) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/roadmap`, {
                text: goal,
                language: language
            });
            // Backend returns { msg: JSON_STRING }
            const roadmapData = JSON.parse(response.data.msg);

            const resultObj = {
                ...roadmapData,
                from: 'roadmap',
                fileName: goal,
                date: new Date().toLocaleString()
            };
            setResults(resultObj);
            addToHistory(resultObj);
            setQaHistory([]);
        } catch (err) {
            console.error(err);
            setError("Failed to generate roadmap. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleQA = async (e) => {
        e.preventDefault();
        const question = e.target.qaInput.value;
        if (!question) return;

        const newHistory = [...qaHistory, { question, answer: "Thinking..." }];
        setQaHistory(newHistory);
        e.target.qaInput.value = "";

        // Prepare context for backend
        let contextList = [];
        if (results.summary) contextList.push(results.summary);
        if (results.timeline) contextList.push(results.timeline.join('\n'));
        if (results.favourable_terms) contextList.push(results.favourable_terms.join('\n'));
        if (results.clauses_to_watch) contextList.push(results.clauses_to_watch.join('\n'));

        try {
            const response = await axios.post(`${API_URL}/qa`, {
                question,
                context: contextList,
                language: language
            });

            setQaHistory(prev => {
                const updated = [...prev];
                updated[updated.length - 1].answer = response.data.msg;
                return updated;
            });
        } catch (err) {
            console.error(err);
            setQaHistory(prev => {
                const updated = [...prev];
                updated[updated.length - 1].answer = "Error: Could not get answer.";
                return updated;
            });
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('results-container');
        if (!element) return;

        try {
            const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#0f172a' });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`legal-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
            // Fallback or alert
        }
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0b1120] border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
                            <span className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-amber-900/20">LC</span>
                            <span>LegalClassifier</span>
                        </Link>
                    ) : (
                        <span className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white text-sm mx-auto">LC</span>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarItem icon={<FiHome />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setResults(null); }} />
                    <SidebarItem icon={<FiClock />} label="History" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setResults(null); }} />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors px-4 py-2">
                        <FiLogOut className="text-xl" />
                        {isSidebarOpen && <span>Exit App</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 bg-[#0f172a]/95 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-8 z-10">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
                        <FiMenu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:border-amber-500"
                        >
                            <option value="english">English</option>
                            <option value="tamil">Tamil</option>
                            <option value="malayalam">Malayalam</option>
                            <option value="hindi">Hindi</option>
                        </select>
                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-amber-400">
                            US
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                    {/* Empty State / Initial View */}
                    {activeTab === 'dashboard' && !results && (
                        <div className="max-w-7xl mx-auto animate-fade-in-up flex flex-col lg:flex-row items-center gap-12 py-8">
                            {/* Left Column: Content & Actions */}
                            <div className="flex-1 space-y-8">
                                <div>
                                    <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
                                        Legal Clarity, <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Simplified.</span>
                                    </h1>
                                    <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                                        Transform complex legal documents into clear summaries and actionable roadmaps with our AI-powered assistant.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Document Analysis Action */}
                                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <FiFileText size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 mb-4">
                                                <FiUploadCloud size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">Analyze Document</h3>
                                            <p className="text-slate-400 text-sm mb-4">Get summaries & risk analysis.</p>
                                            <label className="inline-flex items-center justify-center w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-slate-600">
                                                <FiUploadCloud className="mr-2" /> Upload File
                                                <input type="file" className="hidden" onChange={handleFileUpload} multiple />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Roadmap Action */}
                                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <FiMap size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 mb-4">
                                                <FiMap size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">Create Roadmap</h3>
                                            <p className="text-slate-400 text-sm mb-4">Step-by-step legal guides.</p>
                                            <form onSubmit={handleProcedureGeneration} className="flex gap-2">
                                                <input name="goal" type="text" placeholder="e.g. Buy a house" className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-slate-200 placeholder-slate-500" />
                                                <button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-amber-900/20">
                                                    {isLoading ? <Spinner /> : <FiArrowRight />}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-slate-500 font-medium pt-2">
                                    <span className="flex items-center gap-2"><FiCheckCircle className="text-amber-500" /> AI Powered</span>
                                    <span className="flex items-center gap-2"><FiCheckCircle className="text-amber-500" /> Secure & Private</span>
                                    <span className="flex items-center gap-2"><FiCheckCircle className="text-amber-500" /> Instant Results</span>
                                </div>
                            </div>

                            

                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && !results && (
                        <div className="max-w-5xl mx-auto animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <FiClock className="text-amber-500" /> Analysis History
                            </h2>
                            {history.length === 0 ? (
                                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <FiClock className="mx-auto text-4xl text-slate-600 mb-3" />
                                    <p className="text-slate-400">No history yet. Start a new analysis!</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {history.map((item, index) => (
                                        <div key={index} onClick={() => { setResults(item); setActiveTab('dashboard'); }} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:border-amber-500/30 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.from === 'document' ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-900/20 text-amber-400'}`}>
                                                    {item.from === 'document' ? <FiFileText size={20} /> : <FiMap size={20} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{item.fileName}</h3>
                                                    <p className="text-xs text-slate-500">{item.date}</p>
                                                </div>
                                            </div>
                                            <FiChevronRight className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results Dashboard */}
                    {results && (
                        <div id="results-container" className="max-w-7xl mx-auto animate-fade-in p-4">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <button onClick={() => setResults(null)} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                                        <FiChevronRight className="rotate-180" /> Back to Workspace
                                    </button>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {results.from === 'document' ? <FiFileText className="text-amber-500" /> : <FiMap className="text-amber-500" />}
                                        {results.fileName || "Procedural Roadmap"}
                                    </h2>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleExportPDF} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm font-medium">Export PDF</button>
                                    <button onClick={() => setResults(null)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-900/20 text-sm font-medium">New Analysis</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Critical Info */}
                                <div className="space-y-6">
                                    {/* Alerts Card */}
                                    <DashboardCard title="Critical Attention" icon={<FiAlertTriangle />}>
                                        {results.alerts?.length > 0 ? (
                                            <ul className="space-y-3">
                                                {results.alerts.map((alert, i) => (
                                                    <li key={i} className={`p-3 rounded-lg border text-sm ${getSeverityClass(alert.severity)}`}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold uppercase text-xs tracking-wider">{alert.severity} Priority</span>
                                                        </div>
                                                        {alert.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500">
                                                <FiCheckCircle className="mx-auto text-3xl mb-2 text-green-500/50" />
                                                <p>No critical alerts found.</p>
                                            </div>
                                        )}
                                    </DashboardCard>

                                    {/* AI Assistant Chat (Embedded in Dashboard) */}
                                    <DashboardCard title="Legal Assistant" icon={<FiMessageSquare />} className="h-[400px] flex flex-col">
                                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700">
                                            {qaHistory.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                                    <FiMessageSquare size={40} className="mb-2" />
                                                    <p className="text-sm">Ask questions about this document.</p>
                                                </div>
                                            )}
                                            {qaHistory.map((qa, i) => (
                                                <div key={i} className="space-y-2">
                                                    {/* User Question */}
                                                    <div className="flex justify-end">
                                                        <div className="bg-amber-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-md break-words whitespace-pre-wrap">
                                                            {qa.question}
                                                        </div>
                                                    </div>
                                                    {/* Bot Answer */}
                                                    <div className="flex justify-start">
                                                        <div className="bg-slate-700 text-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[90%] text-sm shadow-sm border border-slate-600/50 leading-relaxed break-words overflow-hidden">
                                                            <ReactMarkdown components={{
                                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mt-2 space-y-1" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mt-2 space-y-1" {...props} />,
                                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                                strong: ({ node, ...props }) => <strong className="font-bold text-amber-300" {...props} />
                                                            }}>
                                                                {qa.answer}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleQA} className="flex gap-2 mt-auto pt-4 border-t border-slate-700/50">
                                            <input name="qaInput" type="text" placeholder="Ask a question..." className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                            <button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-500 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-amber-900/20"><FiSend /></button>
                                        </form>
                                    </DashboardCard>
                                </div>

                                {/* Right Column: Detailed Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Summary / Roadmap */}
                                    <DashboardCard title={results.from === 'document' ? "Executive Summary" : "Step-by-Step Guide"} icon={<FiFileText />}>
                                        {results.summary && (
                                            <div className="text-slate-300 leading-relaxed">
                                                <ReactMarkdown components={{
                                                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mt-2 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-amber-300" {...props} />
                                                }}>
                                                    {results.summary}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                        {results.timeline && (
                                            <ol className="relative border-l border-slate-700 space-y-6 ml-2 mt-4">
                                                {results.timeline.map((step, i) => (
                                                    <li key={i} className="ml-6">
                                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-800 border border-amber-500 rounded-full -left-3">
                                                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                                        </span>
                                                        <h4 className="font-bold text-slate-200 mb-1">Step {i + 1}</h4>
                                                        <p className="text-slate-400 text-sm">{step}</p>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                    </DashboardCard>

                                    {/* Favourable Terms / Key Points */}
                                    {(results.favourable_terms || results.key_points) && (
                                        <DashboardCard title="Key Highlights" icon={<FiCheckCircle />}>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(results.favourable_terms || results.key_points).map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </DashboardCard>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;