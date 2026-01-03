const express = require('express');
const { GameDig } = require('gamedig');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Enable CORS for all routes manually to avoid extra dependencies
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/api/check', async (req, res) => {
    const { address } = req.body;
    
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    const [ip, portStr] = address.split(':');
    const gamePort = parseInt(portStr) || 2456; 

    try {
        const state = await GameDig.query({
            type: 'valheim',
            host: ip,
            port: gamePort,
            maxAttempts: 3
        });
        res.json({ status: 'online', data: state });
    } catch (error) {
        // console.error('Server query failed:', error); // Optional logging
        res.json({ status: 'offline', error: 'Server unreachable' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
