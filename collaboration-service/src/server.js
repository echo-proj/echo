import http from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import axios from 'axios';
import url from 'url';

const PORT = process.env.PORT || 3001;
const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Collaboration WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

async function validateDocumentAccess(token, documentId) {
  try {
    const response = await axios.post(
      `${SPRING_BOOT_URL}/api/internal/validate-document-access`,
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

  setupWSConnection(ws, req, { docName: documentId });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Spring Boot URL: ${SPRING_BOOT_URL}`);
});
