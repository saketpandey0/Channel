import { useMemo, useState } from 'react';
import type { ProfileUser, ProfileViewContext, ProfileTabConfig } from '../types/profile';
import StoriesTab from '../components/profile/tabs/StoriesTab';
import NotificationsTab from '../components/profile/tabs/NotificationsTab';
import AboutTab from '../components/profile/tabs/AboutTab';
import BookmarksTab from '../components/profile/tabs/BookmarksTab';


export const useProfileTabs = (user: ProfileUser | null, viewContext: ProfileViewContext) => {
  const [activeTab, setActiveTab] = useState('stories');

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
