import axios from 'axios';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL;

export async function validateDocumentAccess(token, documentId) {
  try {
    const response = await axios.post(
      `${SPRING_BOOT_URL}/api/documents/validate-access`,
      { documentId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch {
    return { hasAccess: false };
  }
}

export async function validateUserToken(token) {
  try {
    const response = await axios.get(
        `${SPRING_BOOT_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    const userId = response.data && (response.data.id || response.data.userId);
    const username = response.data && response.data.username;
    return { valid: true, userId, username };
  } catch (e) {
    return { valid: false };
  }
}
