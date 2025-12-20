function safeClose(ws, code, reason) {
  try {
    ws.close(code, reason);
  } catch {}
}

function safeCancel(saveFunc) {
  try {
    if (saveFunc && typeof saveFunc.cancel === 'function') saveFunc.cancel();
  } catch {}
}

function safeDestroy(doc) {
  try {
    doc && typeof doc.destroy === 'function' && doc.destroy();
  } catch {}
}

function clearDocumentFromMemory(documents, documentId) {
  const entry = documents.get(documentId);

  if (!entry) return false;

  const { ydoc, saveFunc, conns } = entry;
  safeCancel(saveFunc);

  if (conns && conns.size) {
    for (const ws of conns) safeClose(ws, 1012, 'Server reload');
  }

  safeDestroy(ydoc);
  documents.delete(documentId);
  return true;
}

export function registerDocumentReloadEndpoint(app, documents) {
  app.post('/reload-document/:documentId', (req, res) => {
    const { documentId } = req.params;
    const ok = clearDocumentFromMemory(documents, documentId);
    res.status(200).json({ success: true, cleared: ok });
  });
}
