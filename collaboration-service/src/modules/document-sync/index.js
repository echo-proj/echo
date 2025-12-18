import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import debounce from 'lodash.debounce';
import { broadcast } from '../../utils/websocket.js';
import { loadDocumentContent, saveDocumentContent } from './persistence.js';
import {
  MSG_SYNC,
  MSG_AWARENESS,
  MSG_QUERY_AWARENESS,
  handleSyncMessage,
  handleQueryAwarenessMessage,
  handleAwarenessMessage,
} from './handlers.js';

const DEBOUNCE_TIME = 2000;

export function createSaveFunction(documentId, documentTokens) {
  return debounce(async (ydoc) => {
    const token = documentTokens.get(documentId);
    if (!token) return;

    const state = Y.encodeStateAsUpdate(ydoc);
    await saveDocumentContent(documentId, token, state);
  }, DEBOUNCE_TIME);
}

export function getOrCreateDocEntry(documents, docName, documentTokens) {
  let entry = documents.get(docName);
  if (!entry) {
    const ydoc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(ydoc);
    const conns = new Set();
    const wsClients = new Map();
    const saveFunc = createSaveFunction(docName, documentTokens);

    ydoc.on('update', (update, origin) => {
      const enc = encoding.createEncoder();

      encoding.writeVarUint(enc, MSG_SYNC);
      syncProtocol.writeUpdate(enc, update);
      broadcast(conns, origin, encoding.toUint8Array(enc));
      saveFunc(ydoc);
    });

    awareness.on('update', ({ added, updated, removed }, origin) => {
      const changed = added.concat(updated).concat(removed);

      if (origin && wsClients.has(origin)) {
        const set = wsClients.get(origin);
        for (const c of added) set.add(c);
        for (const c of removed) set.delete(c);
      }

      const enc = encoding.createEncoder();

      encoding.writeVarUint(enc, MSG_AWARENESS);
      encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(awareness, changed));
      broadcast(conns, origin, encoding.toUint8Array(enc));
    });

    entry = { ydoc, awareness, conns, wsClients, saveFunc, loaded: false };
    documents.set(docName, entry);
  }
  return entry;
}

export async function ensureLoaded(documents, documentTokens, docName) {
  const token = documentTokens.get(docName);
  if (!token) {
    return;
  }

  const entry = documents.get(docName);
  if (!entry || entry.loaded) return;

  const existing = await loadDocumentContent(token, docName);

  if (existing && existing.byteLength > 0) {
    Y.applyUpdate(entry.ydoc, existing);
  }
  entry.loaded = true;
}

export function handleDocumentMessage(data, ws) {
  try {
    const msg = data instanceof Uint8Array ? data : new Uint8Array(data);
    const dec = decoding.createDecoder(msg);
    const type = decoding.readVarUint(dec);

    const entry = ws.documentEntry;
    if (!entry) return;

    switch (type) {
      case MSG_SYNC:
        handleSyncMessage(dec, ws, entry);
        break;
      case MSG_QUERY_AWARENESS:
        handleQueryAwarenessMessage(ws, entry);
        break;
      case MSG_AWARENESS:
        handleAwarenessMessage(dec, ws, entry);
        break;
      default:
        break;
    }
  } catch (e) {}
}

export function handleDocumentClose(ws, documents, documentId) {
  const entry = documents.get(documentId);

  if (entry && entry.conns.size === 1) {
    const saveFunc = entry.saveFunc;

    if (saveFunc && typeof saveFunc.flush === 'function') {
      try {
        saveFunc.flush();
      } catch {}
    }
  }

  if (entry) {
    const clientSet = entry.wsClients.get(ws) || new Set();

    if (clientSet.size > 0) {
      awarenessProtocol.removeAwarenessStates(entry.awareness, Array.from(clientSet), null);
    }

    entry.wsClients.delete(ws);
    entry.conns.delete(ws);
  }
}
