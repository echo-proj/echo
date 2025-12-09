import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchUsers, useAddCollaborator } from '@/hooks/useUsers';
import { UserSearchResult } from '@/pages/documents/type';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import styles from './CollaboratorManager.module.scss';
import Image from "next/image";
import {getErrorMessage} from "@/lib/utils";

interface CollaboratorManagerProps {
  documentId: string;
}

export function CollaboratorManager({ documentId }: CollaboratorManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(debouncedQuery);
  const addCollaboratorMutation = useAddCollaborator();

  const handleAddCollaborator = (user: UserSearchResult) => {
    addCollaboratorMutation.mutate(
      {
        documentId,
        data: { username: user.username },
      },
      {
        onSuccess: () => {
          setSearchQuery('');
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {isSearching && (
            <Loader2 className={styles.loadingIcon} />
          )}
        </div>

        {addCollaboratorMutation.isError && (
          <div className={styles.error}>
            {getErrorMessage(addCollaboratorMutation.error) || 'Failed to add collaborator'}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className={styles.resultsContainer}>
            {searchResults.map((user) => (
              <div key={user.id} className={styles.userItem}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.profilePicture ? (
                      <Image src={user.profilePicture} alt={user.username} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <p className={styles.username}>{user.username}</p>
                    {user.fullName && (
                      <p className={styles.fullName}>{user.fullName}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddCollaborator(user)}
                  disabled={addCollaboratorMutation.isPending}
                  className={styles.addButton}
                >
                  {addCollaboratorMutation.isPending && addCollaboratorMutation.variables?.data.username === user.username ? (
                    <>
                      <Loader2 className={styles.buttonSpinner} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus />
                      Add
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {debouncedQuery.trim() && !isSearching && searchResults.length === 0 && (
          <div className={styles.noResults}>
            <p>No users found matching &quot;{debouncedQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
