import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSearchUsers, useAddCollaborator, useRemoveCollaborator } from '@/hooks/useUsers';
import { Collaborator, UserSearchResult } from '@/pages/documents/type';
import { UserPlus, Search, Loader2, UserMinus, Users, AlertCircle, X } from 'lucide-react';
import { getErrorMessage } from "@/lib/utils";
import styles from './CollaboratorSlidePanel.module.scss';

interface CollaboratorSlidePanelProps {
  documentId: string;
  collaborators: Collaborator[];
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const UserAvatar = ({ user }: { user: { username: string; profilePicture: string | null } }) => (
  <Avatar>
    <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-400 text-white font-semibold">
      {user.username.charAt(0).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

const UserItem = ({
  user,
  action
}: {
  user: Collaborator | UserSearchResult;
  action: React.ReactNode
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <UserAvatar user={user} />
      <div className="flex flex-col min-w-0">
        <p className="text-sm font-medium truncate">{user.username}</p>
        {user.fullName && (
          <p className="text-xs text-muted-foreground truncate">{user.fullName}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

export function CollaboratorSlidePanel({
  documentId,
  collaborators,
  isLoading = false,
  isOpen,
  onClose
}: CollaboratorSlidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(debouncedQuery);
  const addCollaboratorMutation = useAddCollaborator();
  const removeCollaboratorMutation = useRemoveCollaborator();

  const handleAddCollaborator = (user: UserSearchResult) => {
    addCollaboratorMutation.mutate(
      { documentId, data: { username: user.username } },
      { onSuccess: () => setSearchQuery('') }
    );
  };

  const handleRemoveCollaborator = (userId: string) => {
    removeCollaboratorMutation.mutate({ documentId, userId });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.slidePanel}>
        <div className={styles.header}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Manage Collaborators</h2>
            <Badge variant="default" className="ml-2">
              {collaborators.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className={styles.closeButton}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={styles.content}>
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Current Collaborators
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  People who can edit this document
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading collaborators...</span>
                </div>
              ) : collaborators.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center border border-dashed rounded-lg">
                  <Users className="w-10 h-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No collaborators yet</p>
                  <p className="text-xs text-muted-foreground/70">Add collaborators below to start collaborating</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {collaborators.map((collaborator) => (
                    <UserItem
                      key={collaborator.id}
                      user={collaborator}
                      action={
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                          disabled={removeCollaboratorMutation.isPending}
                          className="gap-1"
                        >
                          {removeCollaboratorMutation.isPending &&
                           removeCollaboratorMutation.variables?.userId === collaborator.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <UserMinus className="w-4 h-4" />
                              Remove
                            </>
                          )}
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t" />

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Add Collaborator
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Search for users to add as collaborators
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>

              {addCollaboratorMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {getErrorMessage(addCollaboratorMutation.error) || 'Failed to add collaborator'}
                  </AlertDescription>
                </Alert>
              )}

              {searchResults.length > 0 && (
                <div className="border rounded-lg p-2 max-h-64 overflow-y-auto space-y-1">
                  {searchResults.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      action={
                        <Button
                          size="sm"
                          onClick={() => handleAddCollaborator(user)}
                          disabled={addCollaboratorMutation.isPending}
                          className="gap-1"
                        >
                          {addCollaboratorMutation.isPending &&
                           addCollaboratorMutation.variables?.data.username === user.username ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Add
                            </>
                          )}
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}

              {debouncedQuery.trim() && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                  No users found matching &quot;{debouncedQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
