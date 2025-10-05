import React from 'react';
import Avatar from '../atoms/Avatar';
import Label from '../atoms/Label';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface UserAvatarListProps {
  users: User[];
  maxDisplay?: number;
  className?: string;
}

const UserAvatarList: React.FC<UserAvatarListProps> = ({
  users,
  maxDisplay = 5,
  className = '',
}) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className={`user-avatar-list ${className}`}>
      {displayUsers.map((user) => (
        <div key={user.id} className="user-item">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="sm"
            className="user-avatar"
          />
          <Label text={user.name} className="user-name" />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="user-item">
          <div className="avatar-more">
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarList;
