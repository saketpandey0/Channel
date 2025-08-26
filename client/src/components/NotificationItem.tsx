import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'STORY_PUBLISHED': return '📝';
      case 'COMMENT_RECEIVED': return '💬';
      case 'CLAP_RECEIVED': return '👏';
      case 'FOLLOWER_GAINED': return '👤';
      case 'STORY_ACCEPTED': return '✅';
      case 'STORY_REJECTED': return '❌';
      case 'MENTION_RECEIVED': return '📢';
      default: return '🔔';
    }
  };

  return (
    <div 
      className="relative p-4 cursor-pointer rounded-lg"
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
          <p className="text-gray-400 text-xs mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};


export default NotificationItem;