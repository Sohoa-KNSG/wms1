const net = require('net');
const fs = require('fs');
const path = require('path');

const JOBS_FILE = path.join(__dirname, '..', 'jobs.json');
let processedJobs = new Set();

if (fs.existsSync(JOBS_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
        processedJobs = new Set(data);
    } catch (e) {}
}

function saveJobs() {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(Array.from(processedJobs)));
}

function getStatus() {
    return { status: 'UP' };
}

function print(jobId, labelData) {
    return new Promise((resolve, reject) => {
        if (processedJobs.has(jobId)) {
            return resolve({ success: true, message: 'Duplicate job ignored', jobId });
        }

        const client = new net.Socket();
        client.setTimeout(5000);

        client.connect(9100, '192.168.123.100', () => {
            client.write(labelData);
            client.destroy();
            processedJobs.add(jobId);
            saveJobs();
            resolve({ success: true, jobId });
        });

        client.on('error', (err) => {
            reject(new Error('Failed to connect to printer: ' + err.message));
        });

        client.on('timeout', () => {
            client.destroy();
            reject(new Error('Printer connection timed out'));
        });
    });
}

module.exports = { getStatus, print };
