import http from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import * as Y from 'yjs';
import axios from 'axios';
import url from 'url';

const PORT = process.env.PORT || 3001;
const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';
const SAVE_DEBOUNCE_MS = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Collaboration WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

const saveTimers = new Map();
const documentTokens = new Map();

async function validateDocumentAccess(token, documentId) {
  try {
    const response = await axios.post(
      `${SPRING_BOOT_URL}/api/documents/validate-access`,
      { documentId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return { hasAccess: false, userId: null, username: null };
  }
}

async function loadDocumentContent(token, documentId) {
  try {
    const response = await axios.get(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'arraybuffer',
      }
    );

    if (response.data && response.data.byteLength > 0) {
      return new Uint8Array(response.data);
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function saveDocumentContent(token, documentId, state) {
  try {
    await axios.post(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      state,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(`Failed to save document ${documentId}:`, error.message);
  }
}

setPersistence({
  provider: 'custom',
  bindState: async (docName, ydoc) => {
    const token = documentTokens.get(docName);
    if (!token) return;

    const existingContent = await loadDocumentContent(token, docName);
    if (existingContent && existingContent.byteLength > 0) {
      Y.applyUpdate(ydoc, existingContent);
    }
  },
  writeState: async (docName, ydoc) => {
    const token = documentTokens.get(docName);
    if (!token) return;

    if (saveTimers.has(docName)) {
      clearTimeout(saveTimers.get(docName));
    }

    const timer = setTimeout(async () => {
      const state = Y.encodeStateAsUpdate(ydoc);
      await saveDocumentContent(token, docName, state);
      saveTimers.delete(docName);
    }, SAVE_DEBOUNCE_MS);

    saveTimers.set(docName, timer);
  }
});

wss.on('connection', async (ws, req) => {
  const { query } = url.parse(req.url, true);
  const token = query.token;
  const documentId = query.documentId;

  if (!token || !documentId) {
    ws.close(1008, 'Token and documentId are required');
    return;
  }

  const validation = await validateDocumentAccess(token, documentId);

  if (!validation.hasAccess) {
    ws.close(1008, 'Access denied');
    return;
  }

  ws.userId = validation.userId;
  ws.username = validation.username;
  ws.documentId = documentId;
  ws.token = token;

  documentTokens.set(documentId, token);

  setupWSConnection(ws, req, { docName: documentId, gc: true });

  ws.on('close', () => {
    const remainingConnections = Array.from(wss.clients).filter(
      client => client.documentId === documentId
    );

    if (remainingConnections.length === 0) {
      documentTokens.delete(documentId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Spring Boot URL: ${SPRING_BOOT_URL}`);
  console.log(`Auto-save debounce: ${SAVE_DEBOUNCE_MS}ms`);
});
