import { registerDocumentReloadEndpoint } from './documentReload.js';
import { registerNotificationEndpoint } from './notifications.js';

export function registerHttpEndpoints(app, { documents, notificationBroadcaster }) {
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', activeDocuments: documents.size });
  });

  registerDocumentReloadEndpoint(app, documents);
  registerNotificationEndpoint(app, notificationBroadcaster);
}
