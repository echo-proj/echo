export function registerNotificationEndpoint(app, notificationBroadcaster) {
  app.post('/notify', (req, res) => {
    const { userIds, documentId } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    notificationBroadcaster.broadcastDocumentUpdate(userIds, documentId);

    res.status(200).json({ success: true });
  });
}
