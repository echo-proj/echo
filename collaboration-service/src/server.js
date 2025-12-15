import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import axios from 'axios';
import url from 'url';
import debounce from 'lodash.debounce';
import { registerHttpEndpoints } from './http.js';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';
const WS_PORT = process.env.PORT || 3001;
const DEBOUNCE_TIME = 2000;

const app = express();
app.use(express.json());

const documentTokens = new Map();
const documents = new Map();

function send(ws, data) {
  if (ws && ws.readyState === ws.OPEN) {
    try { ws.send(data); } catch {}
  }
}

function broadcast(conns, origin, data) {
  for (const ws of conns) {
    if (ws !== origin) send(ws, data);
  }
}

async function validateDocumentAccess(token, documentId) {
  try {
    const response = await axios.post(
      `${SPRING_BOOT_URL}/api/documents/validate-access`,
      { documentId },
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  } catch {
    return { hasAccess: false };
  }
}

async function loadDocumentContent(token, documentId) {
  try {
    const response = await axios.get(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      { headers: { 'Authorization': `Bearer ${token}` }, responseType: 'arraybuffer' }
    );
    if (response.data && response.data.byteLength > 0) {
      return new Uint8Array(response.data);
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function saveDocumentContent(documentId, token, state) {
  try {
    await axios.post(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      Buffer.from(state),
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${token}`
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );
  } catch (error) {
  }
}

function createSaveFunction(documentId) {
  return debounce(async (ydoc) => {
    const token = documentTokens.get(documentId);
    if (!token) return;

    const state = Y.encodeStateAsUpdate(ydoc);
    await saveDocumentContent(documentId, token, state);
  }, DEBOUNCE_TIME);
}

registerHttpEndpoints(app, { documents });

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;
const MSG_QUERY_AWARENESS = 3;

function handleSyncMessage(dec, ws, entry) {
  const enc = encoding.createEncoder();
  encoding.writeVarUint(enc, MSG_SYNC);
  syncProtocol.readSyncMessage(dec, enc, entry.ydoc, ws);

  const reply = encoding.toUint8Array(enc);

  if (reply.length > 1) send(ws, reply);
}

function handleQueryAwarenessMessage(ws, entry) {
  const enc = encoding.createEncoder();
  encoding.writeVarUint(enc, MSG_AWARENESS);
  encoding.writeVarUint8Array(
    enc,
    awarenessProtocol.encodeAwarenessUpdate(
      entry.awareness,
      Array.from(entry.awareness.getStates().keys())
    )
  );
  send(ws, encoding.toUint8Array(enc));
}

function handleAwarenessMessage(dec, ws, entry) {
  const update = decoding.readVarUint8Array(dec);
  awarenessProtocol.applyAwarenessUpdate(entry.awareness, update, ws);
}

function getOrCreateDocEntry(docName) {
  let entry = documents.get(docName);
  if (!entry) {
    const ydoc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(ydoc);
    const conns = new Set();
    const wsClients = new Map();
    const saveFunc = createSaveFunction(docName);

    ydoc.on('update', (update, origin) => {
      const enc = encoding.createEncoder();

      encoding.writeVarUint(enc, MSG_SYNC);
      syncProtocol.writeUpdate(enc, update);
      broadcast(conns, origin, encoding.toUint8Array(enc));
      saveFunc(ydoc);
    });

    awareness.on('update', ({ added, updated, removed }, origin) => {
      const changed = added.concat(updated).concat(removed);

      if (origin && wsClients.has(origin)) {
        const set = wsClients.get(origin);
        for (const c of added) set.add(c);
        for (const c of removed) set.delete(c);
      }

      const enc = encoding.createEncoder();

      encoding.writeVarUint(enc, MSG_AWARENESS);
      encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(awareness, changed));
      broadcast(conns, origin, encoding.toUint8Array(enc));
    });

    entry = { ydoc, awareness, conns, wsClients, saveFunc, loaded: false };
    documents.set(docName, entry);
  }
  return entry;
}

async function ensureLoaded(docName) {
  const token = documentTokens.get(docName);
  if (!token) {
    return;
  }

  const entry = getOrCreateDocEntry(docName);

  if (entry.loaded) return;

  const existing = await loadDocumentContent(token, docName);

  if (existing && existing.byteLength > 0) {
    Y.applyUpdate(entry.ydoc, existing);
  }
  entry.loaded = true;
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws, req) => {
  const parsed = url.parse(req.url, true);
  const { query, pathname } = parsed;
  const token = query.token;
  const documentId = (pathname || '').replace(/^\/+/, '');

  if (!token || !documentId) {
    ws.close(1008, 'Token and documentId are required');
    return;
  }

  const validation = await validateDocumentAccess(token, documentId);
  if (!validation.hasAccess) {
    ws.close(1008, 'Access denied');
    return;
  }

  documentTokens.set(documentId, token);


  const entry = getOrCreateDocEntry(documentId);
  entry.conns.add(ws);
  entry.wsClients.set(ws, new Set());
  await ensureLoaded(documentId);

  ws.on('message', (data) => {
    try {
      const msg = data instanceof Uint8Array ? data : new Uint8Array(data);
      const dec = decoding.createDecoder(msg);
      const type = decoding.readVarUint(dec);

      switch (type) {
        case MSG_SYNC:
          handleSyncMessage(dec, ws, entry);
          break;
        case MSG_QUERY_AWARENESS:
          handleQueryAwarenessMessage(ws, entry);
          break;
        case MSG_AWARENESS:
          handleAwarenessMessage(dec, ws, entry);
          break;
        default:
          break;
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    const entry = documents.get(documentId);

    if (entry && entry.conns.size === 1) {
      const saveFunc = entry.saveFunc;

      if (saveFunc && typeof saveFunc.flush === 'function') {
        try { saveFunc.flush(); } catch {}
      }
    }

    if (entry) {
      const clientSet = entry.wsClients.get(ws) || new Set();

      if (clientSet.size > 0) {
        awarenessProtocol.removeAwarenessStates(entry.awareness, Array.from(clientSet), null);
      }

      entry.wsClients.delete(ws);
      entry.conns.delete(ws);
    }
  });
});

server.listen(WS_PORT);
