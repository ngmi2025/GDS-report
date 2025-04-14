import { Notification } from '@/components/notifications'

interface ContentStats {
  title: string
  clicks: number
  author: string
  updatedDate: string
}

interface AuthorStats {
  name: string
  averageCTR: number
}

export function checkContentHealth(title: string, url: string, updatedDate: Date) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  if (updatedDate < sixMonthsAgo) {
    const event = new CustomEvent('addNotification', {
      detail: {
        id: `health-${url}`,
        type: 'content-health',
        title: '⚠️ Content Health Check',
        message: `"${title}" hasn't been updated in over 6 months. Consider refreshing the content.`,
        timestamp: new Date(),
        read: false,
        data: {
          articleTitle: title,
          url
        }
      } as Notification
    })
    window.dispatchEvent(event)
  }
}

export function checkPerformanceMetrics(
  current: { clicks: number },
  previous: { clicks: number },
  title: string,
  url: string
) {
  const milestones = [100000, 50000, 25000]
  const milestone = milestones.find(m => current.clicks >= m && (!previous || previous.clicks < m))

  if (milestone) {
    const event = new CustomEvent('addNotification', {
      detail: {
        id: `milestone-${url}-${milestone}`,
        type: 'content-milestone',
        title: '🎉 Content Milestone!',
        message: `"${title}" has reached ${milestone.toLocaleString()} clicks!`,
        timestamp: new Date(),
        read: false,
        data: {
          articleTitle: title,
          metric: milestone,
          url
        }
      } as Notification
    })
    window.dispatchEvent(event)
  }
}

export function checkAuthorAchievements(
  author: AuthorStats,
  title: string,
  url: string
) {
  if (author.averageCTR >= 8) {
    const event = new CustomEvent('addNotification', {
      detail: {
        id: `achievement-${author.name}-viral`,
        type: 'author-achievement',
        title: '⚡ Viral Content Achievement!',
        message: `${author.name} has achieved an impressive ${author.averageCTR.toFixed(1)}% CTR!`,
        timestamp: new Date(),
        read: false,
        data: {
          authorName: author.name,
          metric: author.averageCTR,
          articleTitle: title,
          url
        }
      } as Notification
    })
    window.dispatchEvent(event)
  }
} 