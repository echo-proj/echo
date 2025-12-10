import http from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
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
const documents = new Map();

async function validateDocumentAccess(token, documentId) {
  try {
    const response = await axios.post(
      `${SPRING_BOOT_URL}/api/documents/validate-access`,
      {
        documentId: documentId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error validating document access:', error.message);
    return { hasAccess: false, userId: null, username: null };
  }
}

async function loadDocumentContent(token, documentId) {
  try {
    const response = await axios.get(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
      }
    );

    if (response.data && response.data.byteLength > 0) {
      return new Uint8Array(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error loading document content:', error.message);
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
    console.log(`Document ${documentId} saved successfully`);
  } catch (error) {
    console.error(`Error saving document ${documentId}:`, error.message);
  }
}

function scheduleSave(token, documentId, ydoc) {
  if (saveTimers.has(documentId)) {
    clearTimeout(saveTimers.get(documentId));
  }

  const timer = setTimeout(async () => {
    const state = Y.encodeStateAsUpdate(ydoc);
    await saveDocumentContent(token, documentId, state);
    saveTimers.delete(documentId);
  }, SAVE_DEBOUNCE_MS);

  saveTimers.set(documentId, timer);
}

wss.on('connection', async (ws, req) => {
  const { query } = url.parse(req.url, true);
  const token = query.token;
  const documentId = query.documentId;

  console.log('New connection attempt:', { documentId, hasToken: !!token });

  if (!token || !documentId) {
    console.log('Missing token or documentId, closing connection');
    ws.close(1008, 'Token and documentId are required');
    return;
  }

  const validation = await validateDocumentAccess(token, documentId);

  if (!validation.hasAccess) {
    console.log('Access denied for documentId:', documentId);
    ws.close(1008, 'Access denied');
    return;
  }

  console.log(`Access granted for user ${validation.username} (${validation.userId}) to document ${documentId}`);

  ws.userId = validation.userId;
  ws.username = validation.username;
  ws.documentId = documentId;
  ws.token = token;

  let ydoc = documents.get(documentId);

  if (!ydoc) {
    ydoc = new Y.Doc();
    documents.set(documentId, ydoc);

    const existingContent = await loadDocumentContent(token, documentId);

    if (existingContent && existingContent.byteLength > 0) {
      Y.applyUpdate(ydoc, existingContent);
      console.log(`Loaded existing content for document ${documentId}`);
    }

    ydoc.on('update', (_) => {
      const connections = Array.from(wss.clients).filter(
        client => client.documentId === documentId && client.token
      );

      if (connections.length > 0) {
        scheduleSave(connections[0].token, documentId, ydoc);
      }
    });
  }

  setupWSConnection(ws, req, { docName: documentId, gc: true });

  ws.on('close', () => {

    const remainingConnections = Array.from(wss.clients).filter(
      client => client.documentId === documentId
    );

    if (remainingConnections.length === 0) {
      console.log(`Last user disconnected from document ${documentId}, performing final save`);

      if (saveTimers.has(documentId)) {
        clearTimeout(saveTimers.get(documentId));
        saveTimers.delete(documentId);
      }

      const state = Y.encodeStateAsUpdate(ydoc);
      saveDocumentContent(token, documentId, state).then(() => {
        documents.delete(documentId);
        console.log(`Document ${documentId} cleaned up from memory`);
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Spring Boot URL: ${SPRING_BOOT_URL}`);
  console.log(`Auto-save debounce: ${SAVE_DEBOUNCE_MS}ms`);
});
