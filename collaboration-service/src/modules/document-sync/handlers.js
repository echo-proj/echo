import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import { send } from '../../utils/websocket.js';

export const MSG_SYNC = 0;
export const MSG_AWARENESS = 1;
export const MSG_QUERY_AWARENESS = 3;

export function handleSyncMessage(dec, ws, entry) {
  const enc = encoding.createEncoder();
  encoding.writeVarUint(enc, MSG_SYNC);
  syncProtocol.readSyncMessage(dec, enc, entry.ydoc, ws);

  const reply = encoding.toUint8Array(enc);

  if (reply.length > 1) send(ws, reply);
}

export function handleQueryAwarenessMessage(ws, entry) {
  const enc = encoding.createEncoder();
  encoding.writeVarUint(enc, MSG_AWARENESS);
  encoding.writeVarUint8Array(
    enc,
    awarenessProtocol.encodeAwarenessUpdate(
      entry.awareness,
      Array.from(entry.awareness.getStates().keys())
    )
  );
  send(ws, encoding.toUint8Array(enc));
}

export function handleAwarenessMessage(dec, ws, entry) {
  const update = decoding.readVarUint8Array(dec);
  awarenessProtocol.applyAwarenessUpdate(entry.awareness, update, ws);
}
