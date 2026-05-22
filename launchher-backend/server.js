const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { runAutomation } = require('./automator');
const { extractBusinessDetails } = require('./ai');

const app = express();
app.use(cors());
app.use(express.json());

let connectedClients = [];

app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    connectedClients.push(res);

    req.on('close', () => {
        connectedClients = connectedClients.filter(client => client !== res);
    });
});

const broadcastUpdate = (data) => {
    connectedClients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};

app.post('/api/start-agent', async (req, res) => {
    const { userData } = req.body;
    
    res.status(200).json({ message: "AI Agent dispatched." });

    try {
        await runAutomation(userData, broadcastUpdate);
    } catch (error) {
        broadcastUpdate({ status: 'error', message: error.message });
    }
});

/**
 * 3. The "Chat to Form" Endpoint
 * Takes raw natural language, uses AI to extract JSON, and triggers the bot.
 */
app.post('/api/chat-to-form', async (req, res) => {
    const { message } = req.body;
    
    // Respond immediately so the frontend knows we received the message
    res.status(200).json({ status: "Received, AI is processing..." });

    try {
        // 1. Tell the frontend we are thinking
        broadcastUpdate({ step: 'ai_parsing', message: 'AI is analyzing your business details to find the right NIC codes...' });
        
        // 2. Let Gemini do the heavy lifting
        const userData = await extractBusinessDetails(message);
        console.log("🤖 Gemini Extracted:", userData);

        // 3. Hand the formatted data over to Playwright
        await runAutomation(userData, broadcastUpdate);

    } catch (error) {
        console.error(error);
        broadcastUpdate({ status: 'error', message: 'Failed to process AI request.' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LaunchHer Backend running on port ${PORT}`);
});