import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { 
    ClipboardDocumentIcon, 
    CheckIcon, 
    ClockIcon, 
    SparklesIcon, 
    ArrowPathIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const ResultCard = ({ title, content, type, copied, onCopy }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800">{title}</h3>
            <button
                onClick={() => onCopy(content, type)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
                title="Copy"
            >
                {copied === type ? (
                    <CheckIcon className="w-5 h-5 text-green-500" />
                ) : (
                    <ClipboardDocumentIcon className="w-5 h-5" />
                )}
            </button>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
    </div>
);

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'history'
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState('');
    
    // History state
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const { data } = await api.get('/ai/history');
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.post('/ai/generate-email', { prompt });
            setResult(data);
            toast.success('Successfully generated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(''), 2000);
    };

    const loadHistoryItem = (item) => {
        setResult(item);
        setPrompt(item.prompt);
        setActiveTab('generator');
        toast.success('Loaded from history!');
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* View Tabs */}
            <div className="flex items-center space-x-3 mb-5 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setActiveTab('generator')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        activeTab === 'generator'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generator
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        activeTab === 'history'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <ClockIcon className="w-4 h-4 mr-2" />
                    History {history.length > 0 && `(${history.length})`}
                </button>
            </div>

            {activeTab === 'generator' ? (
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                    {/* Input Section */}
                    <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">New Campaign</h2>
                        <p className="text-xs text-gray-500 mb-4">Enter your target prospect, company context, or job role.</p>
                        <form onSubmit={handleGenerate} className="flex-1 flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-2">Context / Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="flex-1 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow resize-none"
                                placeholder="e.g. SDE-2 role at Stripe, backend systems, scalable microservices, strong DSA background..."
                            />
                            <button
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating with AI...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <SparklesIcon className="w-5 h-5 mr-2" />
                                        Generate Outreach Pack
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Output Section */}
                    <div className="w-full lg:w-2/3 flex flex-col overflow-y-auto pr-1">
                        {result ? (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Generated Outreach Pack</h2>
                                    <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2.5 py-1 rounded-full border border-primary-200">
                                        4 Assets Ready
                                    </span>
                                </div>
                                <ResultCard 
                                    title="Subject Line" 
                                    content={result.subject} 
                                    type="subject" 
                                    copied={copied} 
                                    onCopy={copyToClipboard} 
                                />
                                <ResultCard 
                                    title="Cold Email" 
                                    content={result.emailBody} 
                                    type="email" 
                                    copied={copied} 
                                    onCopy={copyToClipboard} 
                                />
                                <ResultCard 
                                    title="LinkedIn DM" 
                                    content={result.linkedInDM} 
                                    type="linkedin" 
                                    copied={copied} 
                                    onCopy={copyToClipboard} 
                                />
                                <ResultCard 
                                    title="Follow-up Email" 
                                    content={result.followUpEmail} 
                                    type="followup" 
                                    copied={copied} 
                                    onCopy={copyToClipboard} 
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white border border-gray-200 rounded-xl p-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <ClipboardDocumentIcon className="w-8 h-8" />
                                </div>
                                <p className="text-base font-medium text-gray-700 mb-1">No email generated yet</p>
                                <p className="text-sm text-gray-500 text-center max-w-sm">
                                    Provide brief context or a role on the left, and MailGen AI will formulate your subject line, email, follow-up, and LinkedIn DM.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* History Section */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Generation History</h2>
                            <p className="text-xs text-gray-500">View and reuse past email campaigns generated with MailGen AI.</p>
                        </div>
                        <button
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {historyLoading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Loading your history...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <ClockIcon className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-sm">No email history found yet. Generate your first email!</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-4 divide-y divide-gray-100 pr-2">
                            {history.map((item) => (
                                <div key={item._id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 text-sm">{item.subject}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1">Prompt: "{item.prompt}"</p>
                                    </div>
                                    <button
                                        onClick={() => loadHistoryItem(item)}
                                        className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md border border-primary-200 transition-colors whitespace-nowrap"
                                    >
                                        Open in Editor
                                        <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
