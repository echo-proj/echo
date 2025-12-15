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

const WS_PORT = process.env.PORT || 3001;
const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';

const app = express();
app.use(express.json());

const documentTokens = new Map();

const documents = new Map();

 

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
  }, 2000);
}

registerHttpEndpoints(app, { documents, wsPort: WS_PORT });

const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messageQueryAwareness = 3;

function getOrCreateDocEntry(docName) {
  let entry = documents.get(docName);
  if (!entry) {
    const ydoc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(ydoc);
    const conns = new Set();
    const wsClients = new Map();
    const saveFunc = createSaveFunction(docName);

    ydoc.on('update', (update, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const msg = encoding.toUint8Array(encoder);
      for (const ws of conns) {
        if (ws !== origin && ws.readyState === ws.OPEN) {
          try { ws.send(msg); } catch {}
        }
      }
      saveFunc(ydoc);
    });

    awareness.on('update', ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed);
      if (origin && wsClients.has(origin)) {
        const set = wsClients.get(origin);
        added.forEach((c) => set.add(c));
        removed.forEach((c) => set.delete(c));
      }
      const enc = encoding.createEncoder();
      encoding.writeVarUint(enc, messageAwareness);
      encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
      const buff = encoding.toUint8Array(enc);
      for (const ws of conns) {
        if (ws !== origin && ws.readyState === ws.OPEN) {
          try { ws.send(buff); } catch {}
        }
      }
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
  const pathDoc = (pathname || '').replace(/^\/+/, '');
  const documentId = pathDoc || query.documentId;

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
  ws.documentId = documentId;

  const entry = getOrCreateDocEntry(documentId);
  entry.conns.add(ws);
  entry.wsClients.set(ws, new Set());
  await ensureLoaded(documentId);

  ws.on('message', (data) => {
    const message = new Uint8Array(data);
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);
    if (messageType === messageSync) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.readSyncMessage(decoder, encoder, entry.ydoc, ws);
      const reply = encoding.toUint8Array(encoder);
      if (reply.length > 1 && ws.readyState === ws.OPEN) {
        try { ws.send(reply); } catch {}
      }
    } else if (messageType === messageQueryAwareness) {
      const enc = encoding.createEncoder();
      encoding.writeVarUint(enc, messageAwareness);
      encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(
        entry.awareness, Array.from(entry.awareness.getStates().keys())
      ));
      try { ws.send(encoding.toUint8Array(enc)); } catch {}
    } else if (messageType === messageAwareness) {
      const update = decoding.readVarUint8Array(decoder);
      awarenessProtocol.applyAwarenessUpdate(entry.awareness, update, ws);
    } else if (messageType === messageAuth) {
    }
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
