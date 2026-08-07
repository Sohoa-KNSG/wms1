require('dotenv').config();
const express = require('express');
const cors = require('cors');
const scaleService = require('./services/scaleService');
const printService = require('./services/printService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow all origins for now, configure as needed
app.use(express.json());

// Middleware for token
const authMiddleware = (req, res, next) => {
    if (req.path === '/health') {
        return next();
    }
    const token = req.header('X-Device-Agent-Token');
    if (process.env.DEVICE_AGENT_TOKEN && token !== process.env.DEVICE_AGENT_TOKEN) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
};

app.use(authMiddleware);

app.get('/health', (req, res) => res.json({ status: 'UP' }));

app.get('/scale/status', (req, res) => {
    res.json(scaleService.getStatus());
});

app.get('/printer/status', (req, res) => {
    res.json(printService.getStatus());
});

app.get('/scale/weight', (req, res) => {
    res.json(scaleService.getCurrentWeight());
});

app.post('/printer/print', async (req, res) => {
    const { jobId, labelData } = req.body;
    if (!jobId || !labelData) {
        return res.status(400).json({ success: false, error: 'jobId and labelData are required' });
    }
    
    try {
        const result = await printService.print(jobId, labelData);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    scaleService.init();
});
