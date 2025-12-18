import axios from 'axios';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL;

export async function loadDocumentContent(token, documentId) {
  try {
    const response = await axios.get(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'arraybuffer' }
    );

    if (response.data && response.data.byteLength > 0) {
      return new Uint8Array(response.data);
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function saveDocumentContent(documentId, token, state) {
  try {
    await axios.post(
      `${SPRING_BOOT_URL}/api/documents/${documentId}/content`,
      Buffer.from(state),
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          Authorization: `Bearer ${token}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
  } catch (error) {}
}
