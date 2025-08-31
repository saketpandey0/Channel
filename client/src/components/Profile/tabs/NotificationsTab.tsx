import { motion, AnimatePresence } from "motion/react";
import { useNotifications } from "../../../hooks/useNotifications";
import NotificationItem from "../../NotificationItem";
import type { ProfileViewContext } from "../../../types/profile";

interface NotificationsTabProps {
  userId: string;
  viewContext: ProfileViewContext;
  onNotificationClick: (notification: any) => void;
  hovered: number | null;
  setHovered: (index: number | null) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  userId,
  viewContext,
  onNotificationClick,
  hovered,
  setHovered
}) => {
  const { data: notifications, isLoading } = useNotifications(userId);

  if (!viewContext.isOwner) {
    return <div className="p-6 text-center text-gray-600">Access denied</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="px-2 pb-1">
      {notifications.map((notification: any, index: any) => (
        <div
          key={notification.id}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className="relative mt-4"
        >
          <AnimatePresence>
            {hovered === index && (
              <motion.div
                layoutId="hovered-content"
                className="absolute inset-0 h-full w-full rounded-xl bg-neutral-200 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          <NotificationItem
            notification={notification}
            onClick={() => onNotificationClick(notification)}
          />
        </div>
      ))}
    </div>
  );
};


export default NotificationsTab;