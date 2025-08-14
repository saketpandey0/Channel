import { prisma } from "@repo/db";
import { Request, Response } from 'express';
import { getRedisClient } from '../utils/RedisClient';


const redis = getRedisClient();



export const getStoryAnalytics = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.userId;

        if(!userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const story = await prisma.story.findUnique({
            where: {id},
            include: {
                author: true,
            }
        });

        if(!story){
            return res.status(404).json({error: "Story not found"});
        }

        if(story.authorId !== userId){
            return res.status(401).json({error: "Unauthorized Access"});
        }

        const cacheKey = `analytics:story:${id}`;
        const cachedAnalytics = await redis.get(cacheKey);

        if(cachedAnalytics){    
            return res.status(200).json(JSON.parse(cachedAnalytics));
        }

        const [
            readingStats,
            dailyViews,
            topReferrers,
            readerCountries 
        ] = await Promise.all([
            prisma.readingHistory.aggregate({
                where: {
                    storyId: id,
                },
                _avg: {
                    progress: true,
                    readingTime: true,
                },
                _count: {
                    id: true,
                }
            }),
            //Daily views for late 30 Days
            prisma.$queryRaw`                                       
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM reading_history
                WHERE story_id = ${id}
                AND created_at >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `,
            //Top referrers
            prisma.$queryRaw`
                SELECT referrers, COUNT(*) as count
                FROM  story_views
                WHERE story_id = ${id}
                GROUP BY referrers
                ORDERBY count DESC
                LIMIT 10
            `,
            //Reader countries
            prisma.$queryRaw`
                SELECT country, COUNT(*) as readers
                FROM reading_history rh
                JOIN user_location ul ON rh.user_id = ul.user_id
                WHERE story_id = ${id}
                GROUP BY country
                ORDER BY readers DESC
                LIMIT 10
            `
        ]);

        const analytics = {
            views: story.viewCount,
            claps: story.clapCount,
            comments: story.commentCount,
            bookmarks: story.bookmarkCount,
            reads: readingStats._count.id,
            averageReadTime: readingStats._avg.readingTime || 0,
            averageProgress: readingStats._avg.progress || 0,
            dailyViews,
            topReferrers,
            readerCountries,
            engagementRate: story.viewCount > 0 ? (story.clapCount + story.commentCount) / story.viewCount : 0,
        };

        await redis.setex(cacheKey, 300, JSON.stringify(analytics));
        res.status(200).json({analytics});
    } catch(error: any){
        console.error("Error getting story analytics:", error);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getDashboardAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const cacheKey = `analytics:dashboard:${userId}`;
    const cachedDashboard = await redis.get(cacheKey);

    if (cachedDashboard) {
      return res.status(200).json({ analytics: JSON.parse(cachedDashboard) });
    }

    const [
      totalStats,
      recentStories,
      monthlyStats,
      topStories,
    ] = await Promise.all([
      // Total statistics
      prisma.story.aggregate({
        where: { authorId: userId, status: 'PUBLISHED' },
        _sum: { viewCount: true, clapCount: true, commentCount: true, bookmarkCount: true },
        _count: { id: true },
      }),

      // Recent stories performance
      prisma.story.findMany({
        where: { authorId: userId, status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          viewCount: true,
          clapCount: true,
          commentCount: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),

      // Monthly statistics
      prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(published_at, '%Y-%m') as month,
          COUNT(*) as stories_published,
          SUM(view_count) as total_views,
          SUM(clap_count) as total_claps
        FROM stories 
        WHERE author_id = ${userId} 
        AND status = 'PUBLISHED'
        AND published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(published_at, '%Y-%m')
        ORDER BY month DESC
      `,

      // Top performing stories
      prisma.story.findMany({
        where: { authorId: userId, status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          viewCount: true,
          clapCount: true,
          commentCount: true,
          publishedAt: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 10,
      }),
    ]);

    const analytics = {
      totalStories: totalStats._count.id,
      totalViews: totalStats._sum.viewCount || 0,
      totalClaps: totalStats._sum.clapCount || 0,
      totalComments: totalStats._sum.commentCount || 0,
      totalBookmarks: totalStats._sum.bookmarkCount || 0,
      recentStories,
      monthlyStats,
      topStories,
      averageViewsPerStory: totalStats._count.id > 0 ? (totalStats._sum.viewCount || 0) / totalStats._count.id : 0,
    };

    await redis.setex(cacheKey, 600, JSON.stringify(analytics));

    res.status(200).json({ analytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getPublicationAnalytics = async (req: Request, res: Response): Promise<any> => {
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

    const cacheKey = `analytics:publication:${id}`;
    const cachedAnalytics = await redis.get(cacheKey);

    if (cachedAnalytics) {
      return res.status(200).json({ analytics: JSON.parse(cachedAnalytics) });
    }

    const [
      storyStats,
      authorStats,
      monthlyGrowth,
      topStories,
    ] = await Promise.all([
      // Story statistics
      prisma.story.aggregate({
        where: { publicationId: id, status: 'PUBLISHED' },
        _sum: { viewCount: true, clapCount: true, commentCount: true, bookmarkCount: true },
        _count: { id: true },
      }),

      // Author statistics
      prisma.$queryRaw`
        SELECT 
          u.display_name,
          u.username,
          COUNT(s.id) as story_count,
          SUM(s.view_count) as total_views
        FROM stories s
        JOIN users u ON s.author_id = u.id
        WHERE s.publication_id = ${id}
        AND s.status = 'PUBLISHED'
        GROUP BY u.id
        ORDER BY total_views DESC
        LIMIT 10
      `,

      // Monthly growth
      prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(published_at, '%Y-%m') as month,
          COUNT(*) as stories_published,
          SUM(view_count) as total_views
        FROM stories 
        WHERE publication_id = ${id}
        AND status = 'PUBLISHED'
        AND published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(published_at, '%Y-%m')
        ORDER BY month DESC
      `,

      // Top stories
      prisma.story.findMany({
        where: { publicationId: id, status: 'PUBLISHED' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            }
          }
        },
        orderBy: { viewCount: 'desc' },
        take: 10,
      }),
    ]);

    const analytics = {
      totalStories: storyStats._count.id,
      totalViews: storyStats._sum.viewCount || 0,
      totalClaps: storyStats._sum.clapCount || 0,
      totalComments: storyStats._sum.commentCount || 0,
      totalBookmarks: storyStats._sum.bookmarkCount || 0,
      topAuthors: authorStats,
      monthlyGrowth,
      topStories,
    };

    // Cache for 15 minutes
    await redis.setex(cacheKey, 900, JSON.stringify(analytics));

    res.status(200).json({ analytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEarningsAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.session.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // This would integrate with payment processing (Stripe, etc.)
    const cacheKey = `analytics:earnings:${userId}`;
    const cachedEarnings = await redis.get(cacheKey);

    if (cachedEarnings) {
      return res.status(200).json({ earnings: JSON.parse(cachedEarnings) });
    }

    // Mock earnings data - replace with actual payment provider integration
    const earnings = {
      totalEarnings: 0,
      monthlyEarnings: 0,
      paidStories: 0,
      subscribers: 0,
      monthlyBreakdown: [],
      paymentHistory: [],
    };

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(earnings));

    res.status(200).json({ earnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};