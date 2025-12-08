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

export interface AddCollaboratorRequest {
    username: string;
}

export interface UserSearchResult {
    id: string;
    username: string;
    fullName: string | null;
    profilePicture: string | null;
}
