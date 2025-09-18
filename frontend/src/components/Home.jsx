import axios from 'axios';
import { useState } from 'react';

// --- Reusable UI Components ---

function Spinner() {
    return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>;
}

function FileUpload({ onUpload, isLoading }) {
    return (
        <form onSubmit={onUpload} className="w-full bg-slate-800 p-8 rounded-lg flex flex-col items-center gap-4 border-2 border-dashed border-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <h2 className="text-xl font-semibold text-white">Legal Docs Upload (For Explanation)</h2>
            <p className="text-sm text-slate-400">Upload PDF, DOCX, or TXT files</p>
            <input type="file" multiple name="fileIP" className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-violet-600 file:text-white hover:file:bg-violet-500" disabled={isLoading} />
            <button type="submit" disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 flex justify-center">
                {isLoading ? <Spinner /> : 'Analyze Documents'}
            </button>
        </form>
    );
}

function ProcedureWalkthrough({ onGenerate, isLoading }) {
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
}

// --- Main Home Component ---

function Home() {
    const [language, setLanguage] = useState('english');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [qaInput, setQaInput] = useState('');
    const [qaHistory, setQaHistory] = useState([]);
    const [currentGoal, setCurrentGoal] = useState('');

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const files = e.target.fileIP.files;
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
        setCurrentGoal(goal); // Save the goal for Q&A context
        try {
            const res = await axios.post("http://127.0.0.1:8000/roadmap", { text: goal, language });
            const data = JSON.parse(res.data.msg);
            setResults({ ...data, from: 'roadmap' });
        } catch (err) {
            setError("Failed to generate the procedure. Please try again.");
            console.error("API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQA = async (e) => {
        e.preventDefault();
        if (!qaInput.trim() || !results) return;
        setIsLoading(true);
        const currentQuestion = qaInput;
        setQaInput('');
        try {
            let contextForQa = [];
            if (results.from === 'document') {
                contextForQa = [{ summary: results.summary }];
            } else if (results.from === 'roadmap') {
                const roadmapContext = `User's Goal: ${currentGoal}\n\nTimeline:\n${results.timeline.join('\n')}\n\nKey Points:\n${results.key_points.join('\n')}`;
                contextForQa = [{ summary: roadmapContext }];
            }
            
            const res = await axios.post('http://127.0.0.1:8000/qa', {
                question: currentQuestion,
                context: contextForQa,
                language: language
            });
            setQaHistory(prev => [...prev, { question: currentQuestion, answer: res.data.msg }]);
        } catch (err) {
            setError("Could not get an answer. Please try again.");
            setQaInput(currentQuestion);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-blue-950 p-4 md:p-8 text-white font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold">Legall Classifier</h1>
                    <p className="text-lg text-slate-300 mt-2">Your AI-Powered Legal & Procedural Navigator</p>
                </header>

                {!results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
                        <ProcedureWalkthrough onGenerate={handleProcedureGeneration} isLoading={isLoading} />
                    </div>
                )}

                {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}
                
                {error && <div className="bg-red-500 p-4 rounded-md text-center mt-8">{error}</div>}
                
                {results && (
                    <div className="mt-8 bg-slate-900 p-6 rounded-lg border border-slate-700 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-white">Analysis Dashboard</h2>
                            <button onClick={() => setResults(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Start Over</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="bg-slate-800 p-6 rounded-lg">
                                    <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ To be addressed</h3>
                                    {results.alerts && results.alerts.length > 0 ? (
                                        <ul className="space-y-2">{results.alerts.map((alert, i) => (
                                            <li key={i} className="bg-red-900/50 p-3 rounded-md border border-red-500/50">
                                                <strong className="text-red-300">Severity: {alert.severity}</strong> - {alert.message}
                                            </li>))}
                                        </ul>
                                    ) : <p className="text-slate-400">No critical issues found.</p>}
                                </div>

                                {results.favourable_terms && (
                                    <div className="bg-slate-800 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-green-400 mb-4">👍 Favourable Terms</h3>
                                        {results.favourable_terms.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-2 text-slate-300">{results.favourable_terms.map((point, i) => <li key={i}>{point}</li>)}</ul>
                                        ) : <p className="text-slate-400">No specific favourable terms identified.</p>}
                                    </div>
                                )}
                                
                                {results.clauses_to_watch && (
                                    <div className="bg-slate-800 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-yellow-400 mb-4">🧐 Clauses to Watch</h3>
                                        {results.clauses_to_watch.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-2 text-slate-300">{results.clauses_to_watch.map((point, i) => <li key={i}>{point}</li>)}</ul>
                                        ) : <p className="text-slate-400">No specific clauses needed special attention.</p>}
                                    </div>
                                )}
                                
                                {results.key_points && (
                                    <div className="bg-slate-800 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-blue-400 mb-4">✅ Key Points</h3>
                                        <ul className="list-disc list-inside space-y-2 text-slate-300">{results.key_points.map((point, i) => <li key={i}>{point}</li>)}</ul>
                                    </div>
                                )}
                                
                                {results.summary && (
                                    <div className="bg-slate-800 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold text-blue-400 mb-4">📄 Summary</h3>
                                        <p className="whitespace-pre-wrap text-slate-300">{results.summary}</p>
                                    </div>
                                )}

                                <div className="bg-slate-800 p-6 rounded-lg">
                                    <h3 className="text-xl font-semibold text-cyan-400 mb-4">💬 Chat Assistant</h3>
                                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto p-2">{qaHistory.map((qa, index) => (
                                        <div key={index}>
                                            <p className="font-semibold text-slate-300">You: {qa.question}</p>
                                            <p className="whitespace-pre-wrap text-cyan-200">AI: {qa.answer}</p>
                                        </div>))}
                                    </div>
                                    <form onSubmit={handleQA} className="flex gap-2">
                                        <input type="text" value={qaInput} onChange={(e) => setQaInput(e.target.value)} placeholder="Ask a follow-up question..." className="flex-grow p-2 bg-slate-700 border-slate-600 rounded-md text-white" disabled={isLoading} />
                                        <button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2 rounded-md disabled:bg-gray-500">Send</button>
                                    </form>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold text-blue-400 mb-4">🗓️ Time Line / Roadmap</h3>
                                {results.timeline && results.timeline.length > 0 ? (
                                    <ol className="relative border-l border-slate-600 space-y-6">
                                        {results.timeline.map((step, i) => (
                                            <li key={i} className="ml-6">
                                                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full -left-3 ring-8 ring-slate-800">
                                                    <svg className="w-2.5 h-2.5 text-blue-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/>
                                                    </svg>
                                                </span>
                                                <p className="text-slate-300">{step}</p>
                                            </li>
                                        ))}
                                    </ol>
                                ) : <p className="text-slate-400">No procedural timeline available.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;