import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { useLocalStorage } from './hooks/use-local-storage';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
function App() {
    // State variables
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', '');
    const [openRouterApiKey, setOpenRouterApiKey] = useLocalStorage('openRouterApiKey', '');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [useOpenRouter, setUseOpenRouter] = useState(false);
    const chatContainerRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    // Fetch models from Ollama API on component mount
    useEffect(() => {
        const fetchModels = async () => {
            setIsLoadingModels(true);
            try {
                const response = await axios.get('http://localhost:11434/api/tags');
                const modelNames = response.data.models.map((model) => model.name);
                setModels(modelNames);
                if (modelNames.length > 0 && !selectedModel) {
                    setSelectedModel(modelNames[0]);
                }
            }
            catch (error) {
                toast.error(error.message || "Make sure Ollama is running.");
                console.error('Error fetching models:', error);
            }
            finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    }, [setSelectedModel, selectedModel]);
    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    // Send message to AI API
    const sendMessage = useCallback(async () => {
        if (!input || isGenerating)
            return;
        // Validate OpenRouter API key
        if (useOpenRouter && !/^[a-zA-Z0-9]{32}$/.test(openRouterApiKey)) {
            toast("Please provide a valid 32-character API key.");
            return;
        }
        // Add user message to chat
        const timestamp = new Date().toLocaleTimeString();
        const userMessage = { role: 'user', content: input, timestamp };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');
        // Add temporary AI message to chat
        let aiMessage = { role: 'assistant', content: '', timestamp: new Date().toLocaleTimeString() };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setIsGenerating(true);
        try {
            let apiUrl = 'http://localhost:11434/api/generate';
            let requestData = {
                model: selectedModel,
                prompt: input,
                stream: true,
            };
            // Use OpenRouter API if enabled and API key is provided
            if (useOpenRouter && openRouterApiKey) {
                apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                requestData = {
                    model: selectedModel,
                    messages: [...messages].map(m => ({ role: m.role, content: m.content })),
                    stream: true,
                };
            }
            // Send request to AI API
            const response = await axios.post(apiUrl, requestData, {
                headers: useOpenRouter ? {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'Content-Type': 'application/json',
                } : { 'Content-Type': 'application/json' },
                responseType: 'stream',
            });
            let currentContent = '';
            response.data.on('data', (chunk) => {
                const textDecoder = new TextDecoder();
                const chunkText = textDecoder.decode(chunk);
                try {
                    const jsonLines = chunkText.split('\n').filter((line) => line.trim() !== '');
                    jsonLines.forEach((jsonLine) => {
                        if (jsonLine.trim() === '')
                            return;
                        const parsedData = JSON.parse(jsonLine);
                        const contentChunk = useOpenRouter ? parsedData.choices[0].delta.content : parsedData.response;
                        if (contentChunk) {
                            currentContent += contentChunk;
                            setMessages(prevMessages => {
                                const newMessages = [...prevMessages];
                                newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: currentContent };
                                return newMessages;
                            });
                        }
                    });
                }
                catch (parseError) {
                    console.error('Error parsing JSON:', parseError, chunkText);
                }
            });
            // Handle stream completion
            response.data.on('end', () => {
                setIsGenerating(false);
            });
            // Handle stream error
            response.data.on('error', (streamError) => {
                setIsGenerating(false);
                toast(streamError.message || "An error occurred while streaming the response.");
                console.error('Streaming error:', streamError);
            });
        }
        catch (error) {
            setIsGenerating(false);
            let errorMessage = error.message || "Failed to send message.";
            if (error.response && error.response.data) {
                errorMessage = error.response.data.error || errorMessage;
            }
            toast(errorMessage);
            console.error('Error sending message:', error);
        }
    }, [input, messages, selectedModel, openRouterApiKey, useOpenRouter, setIsGenerating]);
    // Clear chat messages
    const clearMessages = () => {
        setMessages([]);
    };
    return (_jsxs("div", { className: "flex flex-col h-screen bg-gray-100", children: [_jsx(Toaster, { richColors: true, position: "bottom-right" }), _jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "AI Chat" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Select, { onValueChange: setSelectedModel, "aria-label": "Select AI Model", disabled: isLoadingModels, children: [_jsxs(SelectTrigger, { className: "w-[150px] sm:w-[220px]", children: [_jsx(SelectValue, { placeholder: isLoadingModels ? "Loading..." : "Select a model" }), isLoadingModels && (_jsx(Loader2, { className: "h-4 w-4 animate-spin" }))] }), _jsx(SelectContent, { children: models.map((model) => (_jsx(SelectItem, { value: model, children: model }, model))) })] }), _jsxs(Drawer, { children: [_jsx(DrawerTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "icon", "aria-label": "Open settings", children: _jsx(Settings, { className: "h-4 w-4" }) }) }), _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: "Settings" }), _jsx(DrawerDescription, { children: "Manage your preferences for AI Chat." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "openrouter", className: "text-right", children: "Use OpenRouter" }), _jsx("div", { className: "col-span-3 flex items-center space-x-2", children: _jsx(Switch, { id: "openrouter", checked: useOpenRouter, onCheckedChange: setUseOpenRouter, "aria-label": "Use OpenRouter" }) })] }), useOpenRouter && (_jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "openrouter-api-key", className: "text-right", children: "OpenRouter API Key" }), _jsx(Input, { id: "openrouter-api-key", type: "password", value: openRouterApiKey, onChange: (e) => setOpenRouterApiKey(e.target.value), className: "col-span-3", "aria-label": "OpenRouter API Key" })] }))] }), _jsx(DrawerFooter, { children: _jsx(DrawerClose, { children: _jsx(Button, { children: "Close" }) }) })] })] }), _jsx(Button, { variant: "outline", size: "icon", "aria-label": "Clear Conversation", onClick: clearMessages, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }), _jsx("main", { className: "flex-grow overflow-auto", children: _jsx("div", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "space-y-4", ref: chatContainerRef, children: messages.map((message, index) => (_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-gray-700", children: message.role === 'user' ? 'U' : 'AI' }) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: `p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`, children: [_jsx("div", { className: "font-bold", children: message.role === 'user' ? 'You' : 'AI' }), _jsx(ReactMarkdown, { className: "prose", children: message.content })] }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: message.timestamp })] })] }, index))) }) }) }), _jsx("footer", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex", children: [_jsx(Input, { type: "text", placeholder: "Type your message...", className: "flex-grow rounded-l-md border-r-0", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter') {
                                    sendMessage();
                                }
                            }, disabled: isGenerating, "aria-label": "Chat input" }), _jsxs(Button, { onClick: sendMessage, className: "rounded-l-none", disabled: isGenerating, "aria-label": "Send message", children: [isGenerating ? "Generating..." : "Send", isGenerating && _jsx(Loader2, { className: "h-4 w-4 animate-spin ml-2" })] })] }) })] }));
}
export default App;
