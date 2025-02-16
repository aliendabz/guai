import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from 'sonner';
import { useLocalStorage } from './hooks/use-local-storage';
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
    const { toast } = useToast();
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
                toast({
                    title: "Error fetching models",
                    description: error.message || "Make sure Ollama is running.",
                    duration: 5000,
                });
                console.error('Error fetching models:', error);
            }
            finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    }, [toast, setSelectedModel, selectedModel]);
    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatContainerRef.current) {
        }
    });
}
