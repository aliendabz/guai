import axios from 'axios';
const fetchModels = async () => {
    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        return response.data.models.map((model) => model.name);
    }
    catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
};
const generateResponse = async (selectedModel, input, useOpenRouter, openRouterApiKey, messages) => {
    try {
        let apiUrl = 'http://localhost:11434/api/generate';
        let requestData = {
            model: selectedModel,
            prompt: input,
            stream: true,
        };
        if (useOpenRouter && openRouterApiKey) {
            apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            requestData = {
                model: selectedModel,
                prompt: input,
                stream: true,
            };
        }
        const response = await axios.post(apiUrl, requestData, {
            headers: useOpenRouter ? {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
            } : { 'Content-Type': 'application/json' },
            responseType: 'stream',
        });
        return response;
    }
    catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
};
export { fetchModels, generateResponse };
