export type Author = {
  id: string
  name: string
  username: string // Fixed typo from 'usernsame'
  avatar: string
}

export type Story = {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  isPublic: boolean
  isPremium: boolean
  allowComments: boolean
  allowClaps: boolean
  createdAt: string
  updatedAt: string
  author: Author
  readTime: string
  publishedAt: string
  claps: number
  comments: number
  tags: string[]
}

export type StoryParams = {
  page?: number
  limit?: number
  tag?: string
  author?: string
  publication?: string
  search?: string
}

