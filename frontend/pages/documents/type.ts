export interface Document {
    id: string;
    title: string;
    ownerUsername: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDocumentRequest {
    title: string;
}
