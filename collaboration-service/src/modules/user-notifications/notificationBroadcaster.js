import { getUserConnections } from './connectionManager.js';
import { send } from '../../utils/websocket.js';

export function broadcastDocumentUpdate(userIds, documentId) {
  const message = JSON.stringify({
    type: 'DOCUMENT_LIST_UPDATE',
    documentId,
  });

  for (const userId of userIds) {
    const connections = getUserConnections(userId);
    broadcastToUser(message, connections)
  }
}

export function broadcastToUser(message, connections) {
  for (const ws of connections) {
    send(ws, message);
  }
}
