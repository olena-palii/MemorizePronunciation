import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const certDir = path.resolve('certificate');
export const keyPath = path.join(certDir, 'dev-key.pem');
export const certPath = path.join(certDir, 'dev-cert.pem');

function getCertExpirationTime(certPath) {
  try {
    const output = execSync(`openssl x509 -enddate -noout -in ${certPath}`).toString();
    const match = output.match(/notAfter=(.+)/);
    if (!match) return 0;
    const expiry = new Date(match[1]);
    return expiry.getTime();
  } catch (err) {
    return 0; // Treat as expired
  }
}

export function certExpiresSoon(certPath, thresholdMs = 1000 * 60 * 60) {
  const now = Date.now();
  const expiry = getCertExpirationTime(certPath);
  const diff = expiry - now;
  console.log(`[${new Date().toISOString()}]: Certificate expires in ${Math.round(diff / (1000 * 60 * 60))} hours at ${new Date(expiry).toISOString()}`);
  return diff <= thresholdMs;
}

export function generateCert() {
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);
  console.log(`[${new Date().toISOString()}]: Generating certificate...`);
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${keyPath} -out ${certPath} -days 1 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"`);
  console.log(`[${new Date().toISOString()}]: Certificate regenerated`);
}
