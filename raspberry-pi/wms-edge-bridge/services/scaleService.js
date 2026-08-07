const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let currentWeight = 0;
let isStable = false;
let isConnected = false;
let isStale = true;
let lastUpdate = Date.now();
let port = null;

function init() {
    if (process.env.MOCK_SCALE === 'true') {
        isConnected = true;
        setInterval(() => {
            currentWeight = (Math.random() * 50).toFixed(2);
            isStable = Math.random() > 0.5;
            isStale = false;
            lastUpdate = Date.now();
        }, 1000);
        return;
    }
    
    connectScale();
}

function connectScale() {
    port = new SerialPort({
        path: '/dev/ttyUSB0',
        baudRate: 9600,
        autoOpen: false
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    
    port.on('open', () => {
        isConnected = true;
        console.log('Scale connected');
    });

    port.on('close', () => {
        isConnected = false;
        console.log('Scale disconnected, reconnecting in 5s');
        setTimeout(connectScale, 5000);
    });

    port.on('error', (err) => {
        isConnected = false;
        console.error('SerialPort Error:', err.message);
    });

    parser.on('data', (data) => {
        const str = data.toString().trim();
        if (str) {
            currentWeight = parseFloat(str) || currentWeight;
            isStable = true;
            isStale = false;
            lastUpdate = Date.now();
        }
    });

    port.open((err) => {
        if (err) {
            console.error('Error opening port:', err.message);
            setTimeout(connectScale, 5000);
        }
    });
}

setInterval(() => {
    if (Date.now() - lastUpdate > 3000) {
        isStale = true;
    }
}, 1000);

function getStatus() {
    return { connected: isConnected, stale: isStale };
}

function getCurrentWeight() {
    return {
        success: true,
        weight: parseFloat(currentWeight),
        unit: 'kg',
        stable: isStable,
        connected: isConnected,
        stale: isStale
    };
}

module.exports = { init, getStatus, getCurrentWeight };
