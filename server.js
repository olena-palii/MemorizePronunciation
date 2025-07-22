import fs from 'fs';
import https from 'https';
import { handler } from './build/handler.js';
import { certExpiresSoon, generateCert, keyPath, certPath } from './certificate.js';

const ip = '0.0.0.0';
const port = 5050;

let server;

function createServer() {
    const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };

    server = https.createServer(options, handler);

    server.listen(port, ip, () => {
        console.log(`[${new Date().toISOString()}]: SvelteKit running at https://localhost:${port}`);
    });
}

function reloadServerIfNeeded() {
    if (certExpiresSoon(certPath)) {
        console.log(`[${new Date().toISOString()}]: Certificate expiring soon. Regenerating...`);
        generateCert();
        server.close(() => {
            console.log(`[${new Date().toISOString()}]: Restarting server with new certificate...`);
            createServer();
        });
    } else {
        console.log(`[${new Date().toISOString()}]: Certificate still valid. No action taken.`);
    }
}

// Startup
if (!fs.existsSync(certPath) || certExpiresSoon(certPath)) generateCert();
createServer();

// Recheck every 10 minutes
setInterval(reloadServerIfNeeded, 10 * 60 * 1000);