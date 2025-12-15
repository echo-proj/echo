export function registerHttpEndpoints(app, { documents, wsPort }) {
  app.post('/reload-document/:documentId', async (req, res) => {
    const { documentId } = req.params;
    try {
      const entry = documents.get(documentId);
      if (entry) {
        const { ydoc, saveFunc, conns } = entry;
        if (saveFunc && saveFunc.cancel) {
          try { saveFunc.cancel(); } catch {}
        }
        if (conns && conns.size > 0) {
          for (const ws of conns) {
            try { ws.close(1012, 'Server reload'); } catch {}
          }
        }
        try { ydoc.destroy(); } catch {}
        documents.delete(documentId);
      }
      res.status(200).json({ success: true, message: 'Document cleared, will reload on next connection' });
    } catch (error) {
      res.status(500).json({ success: false, error: error?.message || 'unknown error' });
    }
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', activeDocuments: documents.size, wsPort });
  });
}
