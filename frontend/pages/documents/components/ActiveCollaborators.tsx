import { useState } from 'react';
import styles from './ActiveCollaborators.module.scss';

interface ActiveCollaboratorsProps {
  users: Array<{ name: string; color: string }>;
}

export function ActiveCollaborators({ users }: ActiveCollaboratorsProps) {
  const [showPopover, setShowPopover] = useState(false);
  const maxVisible = 10;
  const uniqueUsers = Array.from(new Map(users.map(u => [u.name + ":" + u.color, u])).values());
  const visibleUsers = uniqueUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, uniqueUsers.length - maxVisible);

  if (uniqueUsers.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.avatarGroup}>
        {visibleUsers.map((user, index) => (
          <div
            key={index}
            className={styles.avatar}
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={styles.avatarMore}
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
          >
            +{remainingCount}
            {showPopover && (
              <div className={styles.popover}>
                <div className={styles.popoverHeader}>All Collaborators ({uniqueUsers.length})</div>
                <div className={styles.popoverContent}>
                  {uniqueUsers.map((user, index) => (
                    <div key={index} className={styles.popoverUser}>
                      <div
                        className={styles.popoverAvatar}
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.popoverName}>{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
