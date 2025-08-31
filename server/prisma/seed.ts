import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - remove if you want to keep existing data)
  await prisma.$transaction([
    prisma.apiUsage.deleteMany(),
    prisma.systemConfig.deleteMany(),
    prisma.emailTemplate.deleteMany(),
    prisma.moderationAction.deleteMany(),
    prisma.siteNotification.deleteMany(),
    prisma.contentFlag.deleteMany(),
    prisma.adminLog.deleteMany(),
    prisma.storyMedia.deleteMany(),
    prisma.media.deleteMany(),
    prisma.report.deleteMany(),
    prisma.newsletterSubscription.deleteMany(),
    prisma.readingHistory.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.clapComment.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.bookmark.deleteMany(),
    prisma.clap.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.publicationTag.deleteMany(),
    prisma.storyTag.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.storySubmission.deleteMany(),
    prisma.publicationWriter.deleteMany(),
    prisma.publicationEditor.deleteMany(),
    prisma.storyVersion.deleteMany(),
    prisma.story.deleteMany(),
    prisma.publication.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      username: 'saketpan782',
      email: 'saketpan782@gmail.com',
      password: hashedPassword,
      name: 'Saket Pandey',
      bio: 'System Administrator and Platform Manager',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      isVerified: true,
      isEmailVerified: true,
      provider: 'EMAIL',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      location: 'Gurugram, India',
      website: 'https://saketpandey.dev',
      twitter: '@saketpan782',
      linkedin: 'saket-pandey',
      github: 'saketpan782',
      followersCount: 1250,
      followingCount: 180,
      bookmarkCount: 95,
      lastLoginAt: new Date(),
      loginCount: 47,
    },
  });

  // 2. Create Sample Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'John Doe',
        bio: 'Tech enthusiast and writer. Passionate about AI and web development.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        isVerified: true,
        isEmailVerified: true,
        role: 'WRITER',
        location: 'San Francisco, CA',
        twitter: '@johndoe',
        github: 'johndoe',
        followersCount: 892,
        followingCount: 156,
        bookmarkCount: 43,
      },
    }),
    prisma.user.create({
      data: {
        username: 'janesmith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Jane Smith',
        bio: 'Designer and creative writer. Love crafting stories about design and technology.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        isVerified: true,
        isEmailVerified: true,
        role: 'EDITOR',
        location: 'New York, NY',
        website: 'https://janesmith.design',
        linkedin: 'jane-smith-design',
        followersCount: 1456,
        followingCount: 234,
        bookmarkCount: 67,
      },
    }),
    prisma.user.create({
      data: {
        username: 'alexchen',
        email: 'alex.chen@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Alex Chen',
        bio: 'Data scientist and machine learning engineer. Writing about AI trends.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        isEmailVerified: true,
        role: 'WRITER',
        location: 'Toronto, Canada',
        github: 'alexchen',
        followersCount: 743,
        followingCount: 98,
        bookmarkCount: 28,
      },
    }),
  ]);

  // 3. Create Tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest trends and insights in technology',
        color: '#3B82F6',
        storyCount: 25,
        followerCount: 1200,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Artificial Intelligence',
        slug: 'artificial-intelligence',
        description: 'AI developments and machine learning insights',
        color: '#8B5CF6',
        storyCount: 18,
        followerCount: 890,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design principles and creative processes',
        color: '#EC4899',
        storyCount: 15,
        followerCount: 654,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Programming',
        slug: 'programming',
        description: 'Code tutorials and development best practices',
        color: '#10B981',
        storyCount: 32,
        followerCount: 1456,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Startup',
        slug: 'startup',
        description: 'Entrepreneurship and startup journey stories',
        color: '#F59E0B',
        storyCount: 12,
        followerCount: 567,
      },
    }),
  ]);

  // 4. Create Publications
  const techPublication = await prisma.publication.create({
    data: {
      slug: 'tech-insights',
      name: 'Tech Insights',
      description: 'Deep dives into technology trends and innovations',
      bio: 'A publication dedicated to exploring the latest in technology, AI, and digital transformation.',
      logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
      ownerId: adminUser.id,
      isPublic: true,
      allowSubmissions: true,
      requireApproval: true,
      website: 'https://techinsights.dev',
      twitter: '@techinsights',
      email: 'editor@techinsights.dev',
      hasNewsletter: true,
      newsletterFrequency: 'weekly',
      followerCount: 2340,
      storyCount: 45,
    },
  });

  const designPublication = await prisma.publication.create({
    data: {
      slug: 'design-collective',
      name: 'Design Collective',
      description: 'A community for designers and creative professionals',
      bio: 'Sharing design inspiration, tutorials, and industry insights for the creative community.',
      logo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=400&fit=crop',
      ownerId: users[1].id, // Jane Smith
      isPublic: true,
      allowSubmissions: true,
      requireApproval: false,
      website: 'https://designcollective.io',
      twitter: '@designcollective',
      hasNewsletter: true,
      newsletterFrequency: 'monthly',
      followerCount: 1876,
      storyCount: 28,
    },
  });

  // 5. Add Publication Editors and Writers
  await Promise.all([
    prisma.publicationEditor.create({
      data: {
        publicationId: techPublication.id,
        userId: users[0].id, // John Doe as editor
        role: 'SENIOR_EDITOR',
      },
    }),
    prisma.publicationWriter.create({
      data: {
        publicationId: techPublication.id,
        userId: users[2].id, // Alex Chen as writer
      },
    }),
    prisma.publicationEditor.create({
      data: {
        publicationId: designPublication.id,
        userId: adminUser.id, // Admin as editor
        role: 'MANAGING_EDITOR',
      },
    }),
  ]);

  // 6. Create Media Files
  const mediaFiles = await Promise.all([
    prisma.media.create({
      data: {
        filename: 'ai-future-hero.jpg',
        originalName: 'ai-future-landscape.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        path: '/uploads/images/ai-future-hero.jpg',
        type: 'IMAGE',
        uploadedBy: adminUser.id,
      },
    }),
    prisma.media.create({
      data: {
        filename: 'design-principles-cover.png',
        originalName: 'design-principles.png',
        mimeType: 'image/png',
        size: 756000,
        path: '/uploads/images/design-principles-cover.png',
        type: 'IMAGE',
        uploadedBy: users[1].id,
      },
    }),
    prisma.media.create({
      data: {
        filename: 'coding-tutorial-video.mp4',
        originalName: 'react-hooks-tutorial.mp4',
        mimeType: 'video/mp4',
        size: 15600000,
        path: '/uploads/videos/coding-tutorial-video.mp4',
        type: 'VIDEO',
        uploadedBy: users[0].id,
      },
    }),
  ]);

  // 7. Create Stories
  const stories = [];

  // Admin's story
  const adminStory = await prisma.story.create({
    data: {
      slug: 'future-of-ai-development-2025',
      title: 'The Future of AI Development in 2025',
      subtitle: 'Exploring emerging trends and technologies shaping the AI landscape',
      content: `
        <h2>Introduction</h2>
        <p>As we progress through 2025, artificial intelligence continues to evolve at an unprecedented pace. This comprehensive analysis examines the key trends, breakthrough technologies, and emerging paradigms that are reshaping the AI development landscape.</p>
        
        <h2>Key Trends</h2>
        <p>The integration of large language models with specialized AI systems has opened new possibilities for creating more sophisticated and context-aware applications. Developers are increasingly focusing on building AI systems that can understand nuanced human requirements and deliver personalized experiences.</p>
        
        <h2>Technical Innovations</h2>
        <p>Recent advancements in transformer architectures and multi-modal AI systems have enabled developers to create applications that can seamlessly process text, images, and audio inputs simultaneously. This convergence is particularly evident in the latest generation of AI-powered development tools.</p>
        
        <h2>Challenges and Opportunities</h2>
        <p>While the rapid pace of AI development presents exciting opportunities, it also introduces new challenges around ethical AI development, bias mitigation, and ensuring responsible deployment of AI systems at scale.</p>
        
        <h2>Looking Ahead</h2>
        <p>The future of AI development lies in creating more transparent, interpretable, and human-aligned systems that can augment human capabilities while maintaining safety and ethical standards.</p>
      `,
      plainTextContent: 'The Future of AI Development in 2025. Exploring emerging trends and technologies shaping the AI landscape. Introduction. As we progress through 2025, artificial intelligence continues to evolve at an unprecedented pace...',
      excerpt: 'A comprehensive analysis of AI development trends and emerging technologies shaping the future of artificial intelligence in 2025.',
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-08-25T10:00:00Z'),
      authorId: adminUser.id,
      publicationId: techPublication.id,
      readTime: 8,
      wordCount: 1200,
      viewCount: 3456,
      clapCount: 234,
      commentCount: 18,
      bookmarkCount: 89,
      isPremium: false,
      isPublic: true,
      allowComments: true,
      allowClaps: true,
      metaTitle: 'The Future of AI Development in 2025 | Tech Insights',
      metaDescription: 'Discover the latest trends and technologies shaping AI development in 2025. Expert analysis on emerging paradigms and future opportunities.',
    },
  });

  const designStory = await prisma.story.create({
    data: {
      slug: 'modern-ui-design-principles',
      title: 'Modern UI Design Principles for 2025',
      subtitle: 'Creating intuitive and accessible user interfaces',
      content: `
        <h2>The Evolution of UI Design</h2>
        <p>User interface design has undergone significant transformation in recent years. As we navigate 2025, designers are embracing new principles that prioritize accessibility, sustainability, and user empowerment.</p>
        
        <h2>Core Principles</h2>
        <p>Modern UI design emphasizes clarity, consistency, and contextual relevance. The best interfaces are those that feel invisible to users, allowing them to focus on their goals rather than learning how to use the interface.</p>
        
        <h2>Accessibility First</h2>
        <p>Inclusive design isn't just a nice-to-have anymore—it's essential. Designing with accessibility in mind from the start creates better experiences for everyone, not just users with disabilities.</p>
        
        <h2>Micro-interactions and Feedback</h2>
        <p>Thoughtful micro-interactions provide users with immediate feedback and create a sense of direct manipulation. These small details significantly impact the overall user experience.</p>
      `,
      plainTextContent: 'Modern UI Design Principles for 2025. Creating intuitive and accessible user interfaces. The Evolution of UI Design. User interface design has undergone significant transformation...',
      excerpt: 'Essential principles for creating modern, accessible, and user-friendly interfaces in 2025.',
      coverImage: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=400&fit=crop',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-08-28T14:30:00Z'),
      authorId: users[1].id, // Jane Smith
      publicationId: designPublication.id,
      readTime: 6,
      wordCount: 950,
      viewCount: 2187,
      clapCount: 156,
      commentCount: 12,
      bookmarkCount: 45,
      isPremium: false,
    },
  });

  const codingStory = await prisma.story.create({
    data: {
      slug: 'react-hooks-advanced-patterns',
      title: 'Advanced React Hooks Patterns You Should Know',
      subtitle: 'Master complex state management and side effects',
      content: `
        <h2>Beyond Basic Hooks</h2>
        <p>While useState and useEffect are the foundation of React hooks, there are advanced patterns that can significantly improve your component architecture and application performance.</p>
        
        <h2>Custom Hook Patterns</h2>
        <p>Creating custom hooks allows you to encapsulate complex logic and share it across components. The key is identifying reusable patterns in your application and abstracting them into focused, single-purpose hooks.</p>
        
        <h2>Performance Optimization</h2>
        <p>Advanced hooks like useMemo, useCallback, and React.memo can help optimize your application's performance when used correctly. Understanding when and how to apply these optimizations is crucial for building scalable React applications.</p>
        
        <h2>State Management Patterns</h2>
        <p>Complex applications often require sophisticated state management. Learn how to combine useReducer with useContext to create powerful state management solutions without external libraries.</p>
      `,
      plainTextContent: 'Advanced React Hooks Patterns You Should Know. Master complex state management and side effects. Beyond Basic Hooks. While useState and useEffect are the foundation...',
      excerpt: 'Dive deep into advanced React hooks patterns for better state management and performance optimization.',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      status: 'PUBLISHED',
      publishedAt: new Date('2025-08-30T09:15:00Z'),
      authorId: users[0].id, // John Doe
      readTime: 12,
      wordCount: 1800,
      viewCount: 4521,
      clapCount: 312,
      commentCount: 24,
      bookmarkCount: 127,
      isPremium: true,
      price: 5.99,
    },
  });

  // Draft story
  const draftStory = await prisma.story.create({
    data: {
      slug: 'machine-learning-ethics-draft',
      title: 'Ethics in Machine Learning: A Comprehensive Guide',
      subtitle: 'Navigating the moral implications of AI development',
      content: '<p>This is a draft article about machine learning ethics...</p>',
      status: 'DRAFT',
      authorId: users[2].id, // Alex Chen
      draftAuthorId: users[2].id,
      readTime: 0,
      wordCount: 450,
      isPublic: false,
    },
  });

  stories.push(adminStory, designStory, codingStory, draftStory);

  // 8. Create Story Tags
  await Promise.all([
    prisma.storyTag.create({
      data: { storyId: adminStory.id, tagId: tags[0].id }, // Technology
    }),
    prisma.storyTag.create({
      data: { storyId: adminStory.id, tagId: tags[1].id }, // AI
    }),
    prisma.storyTag.create({
      data: { storyId: designStory.id, tagId: tags[2].id }, // Design
    }),
    prisma.storyTag.create({
      data: { storyId: codingStory.id, tagId: tags[3].id }, // Programming
    }),
    prisma.storyTag.create({
      data: { storyId: draftStory.id, tagId: tags[1].id }, // AI
    }),
  ]);

  // 9. Create Story Media Relations
  await Promise.all([
    prisma.storyMedia.create({
      data: {
        storyId: adminStory.id,
        mediaId: mediaFiles[0].id,
        order: 1,
      },
    }),
    prisma.storyMedia.create({
      data: {
        storyId: designStory.id,
        mediaId: mediaFiles[1].id,
        order: 1,
      },
    }),
  ]);

  // 10. Create Story Versions
  await prisma.storyVersion.create({
    data: {
      storyId: adminStory.id,
      version: 1,
      title: 'The Future of AI Development in 2025',
      content: adminStory.content,
      changes: 'Initial publication',
    },
  });

  // 11. Create Comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Excellent analysis! The section on emerging paradigms was particularly insightful.',
        authorId: users[0].id,
        storyId: adminStory.id,
        clapCount: 12,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Great article! I especially liked the practical examples you provided.',
        authorId: users[1].id,
        storyId: designStory.id,
        clapCount: 8,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'This is exactly what I was looking for. The performance optimization section is gold!',
        authorId: users[2].id,
        storyId: codingStory.id,
        clapCount: 15,
      },
    }),
  ]);

  // Reply to first comment
  await prisma.comment.create({
    data: {
      content: 'Thank you! I\'m glad you found it helpful. Stay tuned for more AI insights.',
      authorId: adminUser.id,
      storyId: adminStory.id,
      parentId: comments[0].id,
      clapCount: 5,
    },
  });

  // 12. Create Claps
  await Promise.all([
    prisma.clap.create({
      data: {
        userId: users[0].id,
        storyId: adminStory.id,
        count: 5,
      },
    }),
    prisma.clap.create({
      data: {
        userId: users[1].id,
        storyId: adminStory.id,
        count: 3,
      },
    }),
    prisma.clap.create({
      data: {
        userId: users[2].id,
        storyId: designStory.id,
        count: 4,
      },
    }),
  ]);

  // 13. Create Comment Claps
  await Promise.all([
    prisma.clapComment.create({
      data: {
        userId: adminUser.id,
        commentId: comments[0].id,
        count: 2,
      },
    }),
    prisma.clapComment.create({
      data: {
        userId: users[2].id,
        commentId: comments[1].id,
        count: 1,
      },
    }),
  ]);

  // 14. Create Follows
  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: users[0].id,
        followingId: adminUser.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[1].id,
        followingId: adminUser.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[2].id,
        followingId: users[0].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: adminUser.id,
        followingId: users[1].id,
      },
    }),
  ]);

  // 15. Create Bookmarks
  await Promise.all([
    prisma.bookmark.create({
      data: {
        userId: users[0].id,
        storyId: adminStory.id,
      },
    }),
    prisma.bookmark.create({
      data: {
        userId: users[1].id,
        storyId: codingStory.id,
      },
    }),
    prisma.bookmark.create({
      data: {
        userId: adminUser.id,
        storyId: designStory.id,
      },
    }),
  ]);

  // 16. Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'CLAP_RECEIVED',
        title: 'Your story received claps!',
        message: 'John Doe and others clapped for your story "The Future of AI Development in 2025"',
        storyId: adminStory.id,
        data: { clapCount: 5, clapperName: 'John Doe' },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'FOLLOWER_GAINED',
        title: 'New follower!',
        message: 'Alex Chen started following you',
        data: { followerName: 'Alex Chen', followerId: users[2].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: 'COMMENT_RECEIVED',
        title: 'New comment on your story',
        message: 'Someone commented on "Modern UI Design Principles for 2025"',
        storyId: designStory.id,
        data: { commenterName: 'Jane Smith' },
      },
    }),
  ]);

  // 17. Create Story Submissions
  await prisma.storySubmission.create({
    data: {
      storyId: codingStory.id,
      publicationId: techPublication.id,
      submittedById: users[0].id,
      status: 'APPROVED',
      message: 'I think this article would be a great fit for Tech Insights readers.',
      response: 'Excellent content! We\'re happy to publish this in our publication.',
      reviewedAt: new Date('2025-08-29T16:20:00Z'),
    },
  });

  // 18. Create Reading History
  await Promise.all([
    prisma.readingHistory.create({
      data: {
        userId: users[0].id,
        storyId: adminStory.id,
        readingTime: 480, // 8 minutes
        progress: 1.0,
        isCompleted: true,
        lastReadAt: new Date('2025-08-26T11:30:00Z'),
      },
    }),
    prisma.readingHistory.create({
      data: {
        userId: users[1].id,
        storyId: codingStory.id,
        readingTime: 720, // 12 minutes
        progress: 1.0,
        isCompleted: true,
        lastReadAt: new Date('2025-08-30T15:45:00Z'),
      },
    }),
    prisma.readingHistory.create({
      data: {
        userId: users[2].id,
        storyId: designStory.id,
        readingTime: 180, // 3 minutes (partial read)
        progress: 0.5,
        isCompleted: false,
        lastReadAt: new Date('2025-08-29T09:20:00Z'),
      },
    }),
  ]);

  // 19. Create Newsletter Subscriptions
  await Promise.all([
    prisma.newsletterSubscription.create({
      data: {
        userId: users[0].id,
        publicationId: techPublication.id,
        isActive: true,
      },
    }),
    prisma.newsletterSubscription.create({
      data: {
        userId: users[2].id,
        publicationId: techPublication.id,
        isActive: true,
      },
    }),
    prisma.newsletterSubscription.create({
      data: {
        userId: adminUser.id,
        publicationId: designPublication.id,
        isActive: true,
      },
    }),
  ]);

  // 20. Create Reports
  const report = await prisma.report.create({
    data: {
      reportedById: users[1].id,
      storyId: codingStory.id,
      reason: 'SPAM',
      description: 'This story contains promotional content that wasn\'t clearly disclosed.',
      status: 'UNDER_REVIEW',
    },
  });

  // 21. Create Admin-specific Features

  // Content Flags
  await Promise.all([
    prisma.contentFlag.create({
      data: {
        storyId: codingStory.id,
        flaggedBy: users[1].id,
        type: 'ADMIN_FLAG',
        reason: 'Content requires review for promotional disclosure',
        status: 'ACTIVE',
      },
    }),
    prisma.contentFlag.create({
      data: {
        commentId: comments[0].id,
        flaggedBy: adminUser.id,
        type: 'AUTO_FLAG',
        reason: 'Automated flag for manual review',
        status: 'RESOLVED',
        resolvedBy: adminUser.id,
        resolvedAt: new Date('2025-08-26T16:00:00Z'),
      },
    }),
  ]);

  // Admin Logs
  await Promise.all([
    prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'USER_STATUS_UPDATE',
        targetId: users[0].id,
        targetType: 'USER',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        metadata: {
          previousStatus: 'ACTIVE',
          newStatus: 'ACTIVE',
          reason: 'Routine verification',
        },
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'STORY_MODERATION',
        targetId: adminStory.id,
        targetType: 'STORY',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        metadata: {
          action: 'APPROVED',
          flagsResolved: 0,
        },
      },
    }),
  ]);

  // Site Notifications
  await Promise.all([
    prisma.siteNotification.create({
      data: {
        title: 'Platform Maintenance Scheduled',
        message: 'We\'ll be performing routine maintenance on September 1st from 2:00 AM to 4:00 AM UTC. The platform may be temporarily unavailable during this time.',
        type: 'MAINTENANCE',
        createdBy: adminUser.id,
        targetRole: null, // For all users
        isActive: true,
        expiresAt: new Date('2025-09-02T00:00:00Z'),
      },
    }),
    prisma.siteNotification.create({
      data: {
        title: 'New Feature: Premium Stories',
        message: 'We\'ve launched premium stories! Writers can now monetize their content.',
        type: 'FEATURE',
        createdBy: adminUser.id,
        targetRole: 'WRITER',
        isActive: true,
      },
    }),
  ]);

  // Moderation Actions
  await prisma.moderationAction.create({
    data: {
      userId: users[0].id,
      actionType: 'WARNING',
      reason: 'Promotional content without proper disclosure',
      moderatorId: adminUser.id,
      isActive: true,
    },
  });

  // 22. Create Email Templates
  await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'welcome_email',
        subject: 'Welcome to Our Platform!',
        htmlBody: `
          <html>
            <body>
              <h1>Welcome {{user.name}}!</h1>
              <p>We're excited to have you join our community of writers and readers.</p>
              <p>Get started by:</p>
              <ul>
                <li>Setting up your profile</li>
                <li>Following your favorite topics</li>
                <li>Writing your first story</li>
              </ul>
              <p>Happy writing!</p>
            </body>
          </html>
        `,
        textBody: 'Welcome {{user.name}}! We\'re excited to have you join our community...',
        templateType: 'USER_WELCOME',
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'story_approved',
        subject: 'Your Story Has Been Approved!',
        htmlBody: `
          <html>
            <body>
              <h1>Congratulations {{user.name}}!</h1>
              <p>Your story "{{story.title}}" has been approved for publication in {{publication.name}}.</p>
              <p>Your story will be published shortly and promoted to our audience.</p>
              <p>Thank you for contributing quality content to our platform!</p>
            </body>
          </html>
        `,
        textBody: 'Congratulations {{user.name}}! Your story has been approved...',
        templateType: 'STORY_APPROVED',
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'account_suspended',
        subject: 'Important: Account Suspension Notice',
        htmlBody: `
          <html>
            <body>
              <h1>Account Suspension Notice</h1>
              <p>Dear {{user.name}},</p>
              <p>Your account has been temporarily suspended due to: {{reason}}</p>
              <p>Suspension Duration: {{duration}} days</p>
              <p>If you believe this is an error, please contact our support team.</p>
            </body>
          </html>
        `,
        textBody: 'Dear {{user.name}}, Your account has been temporarily suspended...',
        templateType: 'ACCOUNT_SUSPENDED',
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
  ]);

  // 23. Create System Configuration
  await Promise.all([
    prisma.systemConfig.create({
      data: {
        key: 'max_story_length',
        value: 50000,
        description: 'Maximum character length for stories',
        category: 'content',
        updatedBy: adminUser.id,
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'comment_moderation',
        value: { autoModerate: true, flagThreshold: 3, requireApproval: false },
        description: 'Comment moderation settings',
        category: 'moderation',
        updatedBy: adminUser.id,
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'email_settings',
        value: { 
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          enableNewsletter: true,
          dailyEmailLimit: 1000 
        },
        description: 'Email system configuration',
        category: 'email',
        updatedBy: adminUser.id,
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'feature_flags',
        value: { 
          premiumStories: true,
          videoUploads: true,
          aiWritingAssistant: false,
          advancedAnalytics: true 
        },
        description: 'Platform feature toggles',
        category: 'features',
        updatedBy: adminUser.id,
      },
    }),
  ]);

  // 24. Create API Usage Logs
  const currentDate = new Date();
  const apiUsageLogs = [];
  
  for (let i = 0; i < 50; i++) {
    const logDate = new Date(currentDate.getTime() - (i * 60 * 60 * 1000)); // Every hour going back
    apiUsageLogs.push(
      prisma.apiUsage.create({
        data: {
          userId: i % 2 === 0 ? users[i % 3].id : null,
          endpoint: ['/api/stories', '/api/users', '/api/publications', '/api/analytics'][i % 4],
          method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
          ipAddress: `192.168.1.${100 + (i % 50)}`,
          userAgent: 'Mozilla/5.0 (compatible; API Client)',
          responseStatus: [200, 201, 400, 404, 500][i % 5],
          responseTime: 50 + (i % 200),
          createdAt: logDate,
        },
      })
    );
  }
  
  await Promise.all(apiUsageLogs);

  // 25. Create Publication Tags
  await Promise.all([
    prisma.publicationTag.create({
      data: {
        publicationId: techPublication.id,
        tagId: tags[0].id, // Technology
      },
    }),
    prisma.publicationTag.create({
      data: {
        publicationId: techPublication.id,
        tagId: tags[1].id, // AI
      },
    }),
    prisma.publicationTag.create({
      data: {
        publicationId: designPublication.id,
        tagId: tags[2].id, // Design
      },
    }),
  ]);

  // 26. Create Refresh Tokens
  await Promise.all([
    prisma.refreshToken.create({
      data: {
        token: 'admin_refresh_token_' + Math.random().toString(36).substring(7),
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    }),
    prisma.refreshToken.create({
      data: {
        token: 'user_refresh_token_' + Math.random().toString(36).substring(7),
        userId: users[0].id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // 27. Additional Sample Stories for better content variety
  const additionalStories = await Promise.all([
    prisma.story.create({
      data: {
        slug: 'startup-journey-lessons-learned',
        title: '5 Hard Lessons from My Startup Journey',
        subtitle: 'What I wish I knew before starting my first company',
        content: `
          <h2>The Beginning</h2>
          <p>Starting a company is one of the most challenging yet rewarding experiences. Here are the key lessons I learned during my entrepreneurial journey.</p>
          
          <h2>Lesson 1: Validate Early and Often</h2>
          <p>The biggest mistake I made was building a product for 6 months before talking to a single customer. Validation should happen from day one.</p>
          
          <h2>Lesson 2: Cash Flow is King</h2>
          <p>Revenue is vanity, profit is sanity, but cash flow is reality. Always keep a close eye on your cash position.</p>
          
          <h2>Lesson 3: Hire Slowly, Fire Quickly</h2>
          <p>Every hire in a startup is critical. Take your time to find the right people, but don't hesitate to let go of those who aren't working out.</p>
        `,
        plainTextContent: '5 Hard Lessons from My Startup Journey. What I wish I knew before starting my first company...',
        excerpt: 'Key lessons learned from building a startup from the ground up.',
        coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-08-27T12:00:00Z'),
        authorId: users[0].id,
        readTime: 7,
        wordCount: 1100,
        viewCount: 2890,
        clapCount: 187,
        commentCount: 15,
        bookmarkCount: 56,
      },
    }),
    prisma.story.create({
      data: {
        slug: 'machine-learning-beginners-guide',
        title: 'Machine Learning for Beginners: A Practical Guide',
        subtitle: 'Start your ML journey with hands-on examples',
        content: `
          <h2>What is Machine Learning?</h2>
          <p>Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without explicit programming.</p>
          
          <h2>Types of Machine Learning</h2>
          <p>There are three main types: supervised learning, unsupervised learning, and reinforcement learning. Each serves different purposes and use cases.</p>
          
          <h2>Getting Started</h2>
          <p>The best way to learn ML is through practice. Start with simple projects using Python and libraries like scikit-learn.</p>
          
          <h2>Common Algorithms</h2>
          <p>Begin with linear regression, decision trees, and k-means clustering. These foundational algorithms will give you a solid understanding of ML principles.</p>
        `,
        plainTextContent: 'Machine Learning for Beginners: A Practical Guide. Start your ML journey with hands-on examples...',
        excerpt: 'A beginner-friendly introduction to machine learning concepts and practical applications.',
        coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-08-29T08:45:00Z'),
        authorId: users[2].id,
        publicationId: techPublication.id,
        readTime: 10,
        wordCount: 1500,
        viewCount: 3245,
        clapCount: 198,
        commentCount: 22,
        bookmarkCount: 78,
      },
    }),
  ]);

  // 28. Create additional tags for the new stories
  const startupTag = await prisma.tag.create({
    data: {
      name: 'Startup',
      slug: 'startup',
      description: 'Entrepreneurship and startup insights',
      color: '#F59E0B',
      storyCount: 8,
      followerCount: 432,
    },
  });

  const mlTag = await prisma.tag.create({
    data: {
      name: 'Machine Learning',
      slug: 'machine-learning',
      description: 'ML algorithms, techniques, and applications',
      color: '#6366F1',
      storyCount: 14,
      followerCount: 789,
    },
  });

  // Link new stories to tags
  await Promise.all([
    prisma.storyTag.create({
      data: { storyId: additionalStories[0].id, tagId: startupTag.id },
    }),
    prisma.storyTag.create({
      data: { storyId: additionalStories[1].id, tagId: mlTag.id },
    }),
    prisma.storyTag.create({
      data: { storyId: additionalStories[1].id, tagId: tags[1].id }, // AI tag
    }),
  ]);

  // 29. Create more diverse notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'STORY_PUBLISHED',
        title: 'Your story is now live!',
        message: 'Your story "5 Hard Lessons from My Startup Journey" has been published and is receiving great engagement.',
        storyId: additionalStories[0].id,
        data: { views: 2890, claps: 187 },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        type: 'STORY_ACCEPTED',
        title: 'Story accepted for publication!',
        message: 'Your story "Machine Learning for Beginners" has been accepted by Tech Insights.',
        storyId: additionalStories[1].id,
        data: { publicationName: 'Tech Insights' },
      },
    }),
  ]);

  // 30. Create more reading history entries
  await Promise.all([
    prisma.readingHistory.create({
      data: {
        userId: adminUser.id,
        storyId: additionalStories[0].id,
        readingTime: 420, // 7 minutes
        progress: 1.0,
        isCompleted: true,
        lastReadAt: new Date('2025-08-28T10:15:00Z'),
      },
    }),
    prisma.readingHistory.create({
      data: {
        userId: users[1].id,
        storyId: additionalStories[1].id,
        readingTime: 300, // 5 minutes (partial)
        progress: 0.6,
        isCompleted: false,
        lastReadAt: new Date('2025-08-30T14:20:00Z'),
      },
    }),
  ]);

  // 31. Create additional claps and bookmarks
  await Promise.all([
    prisma.clap.create({
      data: {
        userId: adminUser.id,
        storyId: additionalStories[0].id,
        count: 7,
      },
    }),
    prisma.clap.create({
      data: {
        userId: users[1].id,
        storyId: additionalStories[1].id,
        count: 4,
      },
    }),
    prisma.bookmark.create({
      data: {
        userId: users[2].id,
        storyId: additionalStories[0].id,
      },
    }),
    prisma.bookmark.create({
      data: {
        userId: adminUser.id,
        storyId: additionalStories[1].id,
      },
    }),
  ]);

  // 32. Create more comments for engagement
  const moreComments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'This resonates so much with my own startup experience. The cash flow lesson hit hard!',
        authorId: users[2].id,
        storyId: additionalStories[0].id,
        clapCount: 9,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Perfect guide for someone just starting with ML. The practical examples make it easy to follow.',
        authorId: adminUser.id,
        storyId: additionalStories[1].id,
        clapCount: 6,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Could you recommend some specific datasets for practicing these algorithms?',
        authorId: users[0].id,
        storyId: additionalStories[1].id,
        clapCount: 3,
      },
    }),
  ]);

  // Reply to the ML question
  await prisma.comment.create({
    data: {
      content: 'Great question! I recommend starting with the Iris dataset for classification and the Boston Housing dataset for regression. Both are beginner-friendly.',
      authorId: users[2].id,
      storyId: additionalStories[1].id,
      parentId: moreComments[2].id,
      clapCount: 4,
    },
  });

  // 33. Create additional admin activities
  await Promise.all([
    prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'CONTENT_FLAG_RESOLVED',
        targetId: comments[0].id,
        targetType: 'COMMENT',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        metadata: {
          flagType: 'AUTO_FLAG',
          resolution: 'DISMISSED',
          reason: 'False positive - content is appropriate',
        },
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'PUBLICATION_CREATED',
        targetId: techPublication.id,
        targetType: 'PUBLICATION',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        metadata: {
          publicationName: 'Tech Insights',
          initialEditors: 1,
          initialWriters: 1,
        },
      },
    }),
  ]);

  // 34. Final system health and analytics data
  await Promise.all([
    prisma.systemConfig.create({
      data: {
        key: 'platform_stats',
        value: {
          totalUsers: 4,
          totalStories: 6,
          totalPublications: 2,
          totalTags: 7,
          averageReadTime: 8.5,
          engagementRate: 0.15,
        },
        description: 'Real-time platform statistics',
        category: 'analytics',
        updatedBy: adminUser.id,
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'moderation_stats',
        value: {
          activeFlags: 1,
          resolvedFlags: 1,
          pendingReports: 1,
          totalModerationActions: 1,
          averageResolutionTime: 24, // hours
        },
        description: 'Content moderation statistics',
        category: 'moderation',
        updatedBy: adminUser.id,
      },
    }),
  ]);

//   console.log('✅ Database seeding completed successfully!');
//   console.log(`
// 📊 Seeding Summary:
//   👤 Users: 4 (1 Super Admin, 1 Editor, 2 Writers)
//   📚 Stories: 6 (4 Published, 2 Draft)
//   📖 Publications: 2
//   🏷️  Tags: 7
//   💬 Comments: 7 (including replies)
//   📊 Media Files: 3
//   🔔 Notifications: 5
//   📧 Email Templates: 3
//   ⚙️  System Configs: 6
//   📈 API Usage Logs: 50
//   🚩 Content Flags: 2
//   📋 Admin Logs: 4

// 🔑 Admin Login Credentials:
//   Email: saketpan782@gmail.com
//   Password: admin123
//   Role: SUPER_ADMIN

// 🎯 Sample Users:
//   - johndoe (WRITER): john.doe@example.com / password123
//   - janesmith (EDITOR): jane.smith@example.com / password123  
//   - alexchen (WRITER): alex.chen@example.com / password123
//   `);
// }

main()
  .then(() => {
    console.log('✅ Seed complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Seed error:', e);
  });
