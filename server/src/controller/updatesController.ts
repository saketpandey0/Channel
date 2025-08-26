import prisma from "../db"
import { Request, Response } from 'express';
import { cache } from '../cache/redisCache';
import { transporter } from '../utils/transporter';

// GET /api/notifications - Get user notifications
export const getUserNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    let notifications;
    if (page === 1 && !unreadOnly) {
      const cacheArgs = [userId, page.toString(), limit.toString()];
      const cachedNotifications = await cache.get('notifications', cacheArgs);

      if (cachedNotifications) {
        notifications = JSON.parse(cachedNotifications);
      }
    }

    if (!notifications) {
      notifications = await prisma.notification.findMany({
        where,
        include: {
          story: {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      if (page === 1 && !unreadOnly) {
        const cacheArgs = [userId, page.toString(), limit.toString()];
        await cache.set('notifications', cacheArgs, notifications, 300);
      }
    }

    const totalNotifications = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/notifications/:id/read - Mark as read
export const markNotificationRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    await cache.evictPattern(`notifications:${userId}:*`);

    res.status(200).json({ notification: updatedNotification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/notifications/mark-all-read - Mark all as read
export const markAllNotificationsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    await cache.evictPattern(`notifications:${userId}:*`);

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/notifications/:id - Delete notification
export const deleteNotification = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.notification.delete({
      where: { id }
    });

    await cache.evictPattern(`notifications:${userId}:*`);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/publications/:id/newsletter - Send newsletter
export const sendNewsletter = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.userId;
    const { subject, content, storyIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        editors: { where: { userId } }
      }
    });

    if (!publication) {
      return res.status(404).json({ error: "Publication not found" });
    }

    const isOwner = publication.ownerId === userId;
    const isEditor = publication.editors.length > 0;

    if (!isOwner && !isEditor) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!publication.hasNewsletter) {
      return res.status(400).json({ error: "Newsletter is not enabled for this publication" });
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: {
        publicationId: id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    await prisma.notification.createMany({
      data: subscribers.map(sub => ({
        userId: sub.userId,
        type: "NEWSLETTER_SENT",
        title: `Newsletter: ${subject}`,
        message: `New newsletter from ${publication.name}`,
        data: { publicationId: id, subject, storyIds }, 
      })),
    });

    await Promise.all(
      subscribers.map(sub => cache.evictPattern(`notifications:${sub.userId}:*`))
    );

    const emailPromises = subscribers.map(sub =>
      transporter.sendMail({
        from: `"${publication.name}" <${process.env.EMAIL_USERNAME}>`,
        to: sub.user.email,
        subject,
        html: `<h2>${subject}</h2><p>${content}</p>`,
      })
    );
    await Promise.all(emailPromises);

    res.status(200).json({
      message: "Newsletter sent successfully",
      subscriberCount: subscribers.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/publications/:id/subscribers - Newsletter subscribers
export const getPublicationSubscribers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        editors: { where: { userId } }
      }
    });

    if (!publication) {
      return res.status(404).json({ error: "Publication not found" });
    }

    const isOwner = publication.ownerId === userId;
    const isEditor = publication.editors.length > 0;

    if (!isOwner && !isEditor) {
      return res.status(403).json({ error: "Access denied" });
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: {
        publicationId: id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            email: isOwner, 
          }
        }
      },
      orderBy: { subscribedAt: 'desc' },
    });

    const subscriberCount = subscribers.length;

    res.status(200).json({
      subscribers,
      count: subscriberCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/publications/:id/subscribe - Subscribe to publication
export const subscribeToPublication = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const publication = await prisma.publication.findUnique({
      where: { id }
    });

    if (!publication) {
      return res.status(404).json({ error: "Publication not found" });
    }

    if (!publication.hasNewsletter) {
      return res.status(400).json({ error: "This publication doesn't have a newsletter" });
    }

    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: {
        userId_publicationId: {
          userId,
          publicationId: id,
        }
      }
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ error: "Already subscribed to this publication" });
      } else {
        // Reactivate subscription
        const subscription = await prisma.newsletterSubscription.update({
          where: {
            userId_publicationId: {
              userId,
              publicationId: id,
            }
          },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
          }
        });

        return res.status(200).json({ subscription });
      }
    }

    const subscription = await prisma.newsletterSubscription.create({
      data: {
        userId,
        publicationId: id,
        isActive: true,
      }
    });

    res.status(201).json({ subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/publications/:id/subscribe - Unsubscribe
export const unsubscribeFromPublication = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: {
        userId_publicationId: {
          userId,
          publicationId: id,
        }
      }
    });

    if (!subscription || !subscription.isActive) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    await prisma.newsletterSubscription.update({
      where: {
        userId_publicationId: {
          userId,
          publicationId: id,
        }
      },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      }
    });

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};