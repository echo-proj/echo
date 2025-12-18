import { addUserConnection, removeUserConnection } from './connectionManager.js';
import { broadcastDocumentUpdate } from './notificationBroadcaster.js';

export function setupNotificationWebSocket(ws, userId) {
  addUserConnection(userId, ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', userId }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    removeUserConnection(userId, ws);
  });
}

export const notificationBroadcaster = {
  broadcastDocumentUpdate,
};
