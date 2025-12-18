export function send(ws, data) {
  if (ws && ws.readyState === ws.OPEN) {
    try {
      ws.send(data);
    } catch {}
  }
}

export function broadcast(conns, origin, data) {
  for (const ws of conns) {
    if (ws !== origin) send(ws, data);
  }
}
