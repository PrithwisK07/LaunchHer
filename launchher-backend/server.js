const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { runAutomation } = require('./automator');

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LaunchHer Backend running on port ${PORT}`);
});