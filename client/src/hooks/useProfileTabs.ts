import { useMemo, useState } from 'react';
import type { ProfileUser, ProfileViewContext, ProfileTabConfig } from '../types/profile';
import StoriesTab from '../components/Profile/tabs/StoriesTab';
import NotificationsTab from '../components/Profile/tabs/NotificationsTab';
import AboutTab from '../components/Profile/tabs/AboutTab';
import BookmarksTab from '../components/Profile/tabs/BookmarksTab';


export const useProfileTabs = (user: ProfileUser | null, defaultTab: string | null, viewContext: ProfileViewContext) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'stories');

  const tabs: ProfileTabConfig[] = useMemo(() => {
    if (!user) return [];

    return [
      {
        id: 'stories',
        name: 'Stories',
        count: user.storyCount,
        visible: true,
        component: StoriesTab
      },
      {
        id: 'notifications',
        name: 'Notifications',
        visible: viewContext.isOwner,
        component: NotificationsTab
      },
      {
        id: 'bookmarks',
        name: 'Bookmarks',
        visible: viewContext.isOwner,
        component: BookmarksTab
      },
      {
        id: 'about',
        name: 'About',
        visible: true,
        component: AboutTab
      }
    ];
  }, [user, viewContext]);

  return { tabs, activeTab, setActiveTab };
};
