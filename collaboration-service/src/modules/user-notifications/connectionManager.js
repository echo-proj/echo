const userConnections = new Map();

export function addUserConnection(userId, ws) {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId).add(ws);
}

export function removeUserConnection(userId, ws) {
  const connections = userConnections.get(userId);
  if (connections) {
    connections.delete(ws);
    if (connections.size === 0) {
      userConnections.delete(userId);
    }
  }
}

export function getUserConnections(userId) {
  return userConnections.get(userId) || new Set();
}
