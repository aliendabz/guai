
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import ReactMarkdown from 'react-markdown';
import { useToast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { useLocalStorage } from './hooks/use-local-storage';
import { cn } from './lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Vaul } from 'vaul'
import { Loader2 } from "lucide-react"

// Define the message interface
interface Message {
  role: string;
  content: string;
  timestamp: string;
}

function App() {
  // State variables
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', '');
  const [openRouterApiKey, setOpenRouterApiKey] = useLocalStorage('openRouterApiKey', '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Fetch models from Ollama API on component mount
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response: AxiosResponse<any> = await axios.get('http://localhost:11434/api/tags');
        const modelNames = response.data.models.map((model: { name: string }) => model.name);
        setModels(modelNames);
        if (modelNames.length > 0 && !selectedModel) {
          setSelectedModel(modelNames[0]);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching models",
          description: error.message || "Make sure Ollama is running.",
          duration: 5000,
        })
        console.error('Error fetching models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [toast, setSelectedModel, selectedModel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      