import http from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import * as Y from 'yjs';
import axios from 'axios';
import url from 'url';

const PORT = process.env.PORT || 3001;
const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Collaboration WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

const documentTokens = new Map();

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
    if (response.data && response.data.byteLength > 0) return new Uint8Array(response.data);
    return null;
  } catch (error) {
    return null;
  }
}

setPersistence({
  bindState: async (docName, ydoc) => {
    const token = documentTokens.get(docName);
    if (!token) return;
    const existing = await loadDocumentContent(token, docName);
    if (existing && existing.byteLength > 0) {
      Y.applyUpdate(ydoc, existing);
    }
  },
  writeState: async () => {
    // The client already saves to backend via auto-save in TiptapEditor
    // This is just to satisfy the y-websocket API requirement
    return Promise.resolve();
  },
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

  documentTokens.set(documentId, token);
  ws.documentId = documentId;

  setupWSConnection(ws, req, { docName: documentId, gc: true });

  ws.on('close', () => {
    documentTokens.delete(documentId);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
