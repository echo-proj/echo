export interface Collaborator {
    id: string;
    username: string;
    fullName: string | null;
    profilePicture: string | null;
}

export interface Document {
    id: string;
    title: string;
    ownerUsername: string;
    collaborators?: Collaborator[];
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

interface DocumentVersion {
    id: string;
    documentId: string;
    versionNumber: number;
    label: string | null;
    createdByUsername: string;
    createdAt: string;
}

export default DocumentVersion

export interface CreateVersionRequest {
    label?: string;
}

export type UserState = { name: string; color: string };
export type RestoringState = { active: boolean; ts: number };
export type AwarenessState = { user?: UserState; restoring?: RestoringState };
export type ConnectionStatus = { status: 'connected' | 'connecting' | 'disconnected' };