import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFileText, FiMap, FiMessageSquare, FiShield, FiLock, FiAward, FiHelpCircle, FiChevronDown, FiCheck } from 'react-icons/fi';
import heroImage from '../assets/hero.png';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-amber-500 selection:text-white overflow-x-hidden">

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[80vh]">
                {/* Abstract CSS Background */}
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-[#0f172a]">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                    {/* Glowing Orbs/Gradients for "Gold" feel */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] opacity-40"></div>
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] opacity-30"></div>

                    {/* Geometric Shapes representing Order */}
                    <div className="absolute top-1/4 left-10 w-24 h-24 border border-slate-700/30 rounded-lg rotate-12 animate-float-slow"></div>
                    <div className="absolute bottom-1/4 right-10 w-32 h-32 border border-amber-500/10 rounded-full animate-float-slower"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 mb-8 animate-fade-in-up backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                                <span className="text-sm text-amber-500 font-semibold tracking-widest uppercase">Intelligent Legal Assistance</span>
                    </div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-white animate-fade-in-up delay-100 font-serif">
                                Legal Complexity, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Simplified.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200 font-light">
                                We transform intricate legal procedures into clear, actionable roadmaps.
                                Analyze documents with precision and navigate the law with confidence.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center animate-fade-in-up delay-300">
                                <Link to="/app" className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all hover:shadow-[0_0_25px_rgba(217,119,6,0.4)] flex items-center gap-3 text-lg">
                                    Begin Assessment
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="#features" className="px-8 py-4 bg-transparent hover:bg-slate-800/50 text-slate-300 font-semibold rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all text-lg">
                                    Learn More
                                </a>
                            </div>
                        </div>

                        <div className="flex-1 relative hidden lg:block">
                            <img src={heroImage} alt="Legal AI Dashboard" className="relative z-10 h-[450px] w-full max-w-lg mx-auto drop-shadow-2xl animate-float" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Signals Section */}
            <section className="py-12 bg-slate-900/50 border-y border-slate-800/50">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm uppercase tracking-widest mb-8">Trusted by Professionals & Individuals Alike</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock Logos */}
                        <div className="text-2xl font-bold text-slate-400 flex items-center gap-2"><FiShield /> LegalTech</div>
                        <div className="text-2xl font-bold text-slate-400 flex items-center gap-2"><FiAward /> LawDaily</div>
                        <div className="text-2xl font-bold text-slate-400 flex items-center gap-2"><FiCheck /> SecureDocs</div>
                        <div className="text-2xl font-bold text-slate-400 flex items-center gap-2"><FiLock /> PrivacyFirst</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-[#0f172a] relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-serif">Core Capabilities</h2>
                        <p className="text-slate-400 max-w-xl mx-auto font-light">Essential tools designed to provide clarity and assurance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FiFileText className="text-4xl text-amber-500" />}
                            title="Document Analysis"
                            description="Upload contracts or legal texts. Our system extracts favourable terms and highlights potential risks instantly."
                        />
                        <FeatureCard
                            icon={<FiMap className="text-4xl text-amber-500" />}
                            title="Procedural Roadmaps"
                            description="Define your objective. Receive a structured, step-by-step timeline to achieve your legal goals efficiently."
                        />
                        <FeatureCard
                            icon={<FiMessageSquare className="text-4xl text-amber-500" />}
                            title="Legal Assistant"
                            description="Consult our intelligent assistant for immediate clarification on documents or procedural queries."
                        />
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-24 bg-slate-900/30 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-800 mb-6">
                                <FiLock className="text-green-500" />
                                <span className="text-sm text-green-500 font-medium uppercase tracking-wide">Enterprise Grade Security</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white font-serif">Your Data, Protected.</h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                                We understand the sensitivity of legal documents. Our platform is built with privacy-first architecture to ensure your information remains confidential.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <FiCheck className="text-amber-500 text-xl" />
                                    <span>End-to-end encryption for all file uploads</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <FiCheck className="text-amber-500 text-xl" />
                                    <span>No permanent storage of analyzed documents</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <FiCheck className="text-amber-500 text-xl" />
                                    <span>Anonymous processing protocols</span>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full"></div>
                            <div className="relative bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
                                <FiShield className="text-8xl text-amber-500 mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">Secure Processing</h3>
                                <p className="text-slate-400">Our AI models process data in isolated environments, ensuring no leakage or training on your private data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-[#0f172a]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-serif">Frequently Asked Questions</h2>
                        <p className="text-slate-400">Common queries about our legal assistance platform.</p>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Is the legal advice provided by the AI binding?"
                            answer="No. LegalClassifier provides informational assistance and procedural roadmaps based on general legal knowledge. It is not a substitute for professional legal counsel from a qualified attorney."
                        />
                        <FaqItem
                            question="What file formats do you support?"
                            answer="We currently support PDF and DOCX formats for document analysis. We are working on adding support for image-based documents (OCR) soon."
                        />
                        <FaqItem
                            question="Is my data shared with third parties?"
                            answer="Absolutely not. Your documents are processed solely for the purpose of analysis and are not shared, sold, or stored permanently on our servers."
                        />
                        <FaqItem
                            question="Can I use this for any jurisdiction?"
                            answer="Our AI is trained on general legal principles and Indian procedural law. While it can analyze documents from various jurisdictions, specific procedural roadmaps are best optimized for Indian contexts."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-slate-900"></div>
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white font-serif">Secure Your Peace of Mind</h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
                        Experience the simplicity of modern legal assistance today.
                    </p>
                    <Link to="/app" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-amber-900/30 transition-all transform hover:-translate-y-1">
                        Start Your Assessment <FiArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0b1120] py-12 border-t border-slate-900">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-500 text-sm font-light">
                        &copy; {new Date().getFullYear()} LegalClassifier. All rights reserved.
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-slate-500 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider">Privacy</a>
                        <a href="#" className="text-slate-500 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider">Terms</a>
                        <a href="#" className="text-slate-500 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-amber-500/30 transition-all hover:bg-slate-800/50 group">
        <div className="mb-6 p-4 rounded-lg bg-slate-900/80 inline-block group-hover:scale-110 transition-transform border border-slate-800 shadow-lg">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-slate-100 font-serif">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-light">{description}</p>
    </div>
);

const StepCard = ({ number, title, description }) => (
    <div className="relative z-10 flex flex-col items-center text-center group">
        <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-slate-800 group-hover:border-amber-500/50 transition-colors flex items-center justify-center text-3xl font-bold text-amber-500 mb-6 shadow-2xl shadow-black/50">
            {number}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white font-serif">{title}</h3>
        <p className="text-slate-400 max-w-xs font-light">{description}</p>
    </div>
);

const FaqItem = ({ question, answer }) => (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden group">
        <details className="group">
            <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-slate-200 group-hover:text-amber-500 transition-colors">{question}</h3>
                <FiChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-slate-700/30 pt-4">
                {answer}
            </div>
        </details>
    </div>
);

export default LandingPage;
