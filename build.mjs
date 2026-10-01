// Fetches 10 cats, encrypts them with SITE_PASSWORD (PBKDF2 -> AES-GCM), writes data.json.
import { webcrypto as crypto } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const password = process.env.SITE_PASSWORD;
if (!password) throw new Error('SITE_PASSWORD not set');

const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png');
if (!res.ok) throw new Error('cat api ' + res.status);
const cats = (await res.json()).map(c => ({ url: c.url, w: c.width, h: c.height }));
const payload = JSON.stringify({ date: new Date().toISOString().slice(0, 10), cats });

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(payload));
const b64 = b => Buffer.from(b).toString('base64');
writeFileSync('data.json', JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
console.log('wrote data.json');
