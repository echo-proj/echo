import http from 'http';
import express from 'express';
import {WebSocketServer} from 'ws';
import url from 'url';
import {validateDocumentAccess, validateUserToken} from './utils/auth.js';
import {
    getOrCreateDocEntry,
    ensureLoaded,
    handleDocumentMessage,
    handleDocumentClose,
} from './modules/document-sync/index.js';
import {handleQueryAwarenessMessage} from './modules/document-sync/handlers.js';
import {setupNotificationWebSocket, notificationBroadcaster} from './modules/user-notifications/index.js';
import {registerHttpEndpoints} from './modules/http/index.js';

const WS_PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

const documentTokens = new Map();
const documents = new Map();

registerHttpEndpoints(app, {documents, notificationBroadcaster});

const server = http.createServer(app);
const wss = new WebSocketServer({server});

wss.on('connection', async (ws, req) => {
    const parsed = url.parse(req.url, true);
    const {query, pathname} = parsed;
    const token = query.token;

    if (!token) {
        ws.close(1008, 'Token is required');
        return;
    }

    if (pathname === '/notifications') {
        const userValidation = await validateUserToken(token);
        if (!userValidation.valid) {
            ws.close(1008, 'Invalid token');
            return;
        }

        setupNotificationWebSocket(ws, userValidation.userId);
        return;
    }

    const documentId = (pathname || '').replace(/^\/+/, '');

    if (!documentId) {
        ws.close(1008, 'DocumentId is required');
        return;
    }

    const validation = await validateDocumentAccess(token, documentId);
    if (!validation.hasAccess) {
        ws.close(1008, 'Access denied');
        return;
    }

    documentTokens.set(documentId, token);

    const entry = getOrCreateDocEntry(documents, documentId, documentTokens);
    entry.conns.add(ws);
    entry.wsClients.set(ws, new Set());

    ws.documentEntry = entry;

    ws.on('message', (data) => {
        handleDocumentMessage(data, ws);
    });

    ws.on('close', () => {
        handleDocumentClose(ws, documents, documentId);
    });

    handleQueryAwarenessMessage(ws, entry);
    await ensureLoaded(documents, documentTokens, documentId);
});

server.listen(WS_PORT, () => {
    console.log(`Collaboration service running on port ${WS_PORT}`);
});
