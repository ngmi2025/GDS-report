import { useState, useEffect } from 'react'
import { Notification } from '@/components/notifications'

interface ContentStats {
  title: string
  clicks: number
  author: string
}

interface AuthorStats {
  name: string
  totalArticles: number
  averageCTR: number
  avgClicksPerArticle: number
}

export function useNotifications(contentData: ContentStats[], authorData: AuthorStats[]) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [processedMilestones, setProcessedMilestones] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!contentData?.length || !authorData?.length) return

    const newNotifications: Notification[] = []
    const newProcessedMilestones = new Set(processedMilestones)

    // Content milestones
    const milestones = [200000, 150000, 100000, 50000, 25000]
    contentData.forEach(content => {
      const milestone = milestones.find(m => content.clicks >= m)
      if (milestone) {
        const milestoneKey = `${content.title}-${milestone}`
        if (!newProcessedMilestones.has(milestoneKey)) {
          newProcessedMilestones.add(milestoneKey)
          newNotifications.push({
            id: `milestone-${milestoneKey}`,
            type: 'content-milestone',
            title: '🎉 Content Milestone Achieved!',
            message: `"${content.title}" has reached ${milestone.toLocaleString()} visits!`,
            timestamp: new Date(),
            read: false,
            data: {
              metric: milestone,
              articleTitle: content.title
            }
          })
        }
      }
    })

    // Content ranking
    const sortedContent = [...contentData].sort((a, b) => b.clicks - a.clicks)
    const top10Key = `top10-${sortedContent[9]?.title}`
    const top3Key = `top3-${sortedContent[2]?.title}`
    const top1Key = `top1-${sortedContent[0]?.title}`

    if (!newProcessedMilestones.has(top10Key) && sortedContent[9]) {
      newProcessedMilestones.add(top10Key)
      newNotifications.push({
        id: `ranking-${top10Key}`,
        type: 'content-ranking',
        title: '📈 New Top 10 Content!',
        message: `"${sortedContent[9].title}" has entered the top 10 performing content!`,
        timestamp: new Date(),
        read: false,
        data: {
          articleTitle: sortedContent[9].title,
          rank: 10
        }
      })
    }

    if (!newProcessedMilestones.has(top3Key) && sortedContent[2]) {
      newProcessedMilestones.add(top3Key)
      newNotifications.push({
        id: `ranking-${top3Key}`,
        type: 'content-ranking',
        title: '🏆 Top 3 Achievement!',
        message: `"${sortedContent[2].title}" has reached the top 3 performing content!`,
        timestamp: new Date(),
        read: false,
        data: {
          articleTitle: sortedContent[2].title,
          rank: 3
        }
      })
    }

    if (!newProcessedMilestones.has(top1Key) && sortedContent[0]) {
      newProcessedMilestones.add(top1Key)
      newNotifications.push({
        id: `ranking-${top1Key}`,
        type: 'content-ranking',
        title: '👑 New #1 Content!',
        message: `"${sortedContent[0].title}" is now the best performing content!`,
        timestamp: new Date(),
        read: false,
        data: {
          articleTitle: sortedContent[0].title,
          rank: 1
        }
      })
    }

    // Author achievements
    authorData.forEach(author => {
      // Viral Content Achievement (8%+ CTR)
      const viralKey = `viral-${author.name}`
      if (author.averageCTR >= 8 && !newProcessedMilestones.has(viralKey)) {
        newProcessedMilestones.add(viralKey)
        newNotifications.push({
          id: `achievement-${viralKey}`,
          type: 'author-achievement',
          title: '⚡ Viral Content Achievement!',
          message: `${author.name} has achieved an impressive ${author.averageCTR.toFixed(1)}% CTR!`,
          timestamp: new Date(),
          read: false,
          data: {
            authorName: author.name,
            metric: author.averageCTR
          }
        })
      }

      // High Impact Status (2,000+ clicks/article)
      const impactKey = `impact-${author.name}`
      if (author.avgClicksPerArticle >= 2000 && !newProcessedMilestones.has(impactKey)) {
        newProcessedMilestones.add(impactKey)
        newNotifications.push({
          id: `achievement-${impactKey}`,
          type: 'author-achievement',
          title: '🚀 High Impact Achievement!',
          message: `${author.name} is averaging ${Math.round(author.avgClicksPerArticle).toLocaleString()} clicks per article!`,
          timestamp: new Date(),
          read: false,
          data: {
            authorName: author.name,
            metric: author.avgClicksPerArticle
          }
        })
      }

      // Prolific Author Milestone (75+ articles)
      const prolificKey = `prolific-${author.name}`
      if (author.totalArticles >= 75 && !newProcessedMilestones.has(prolificKey)) {
        newProcessedMilestones.add(prolificKey)
        newNotifications.push({
          id: `achievement-${prolificKey}`,
          type: 'author-achievement',
          title: '✍️ Prolific Author Milestone!',
          message: `${author.name} has published ${author.totalArticles} articles!`,
          timestamp: new Date(),
          read: false,
          data: {
            authorName: author.name,
            metric: author.totalArticles
          }
        })
      }
    })

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev])
      setProcessedMilestones(newProcessedMilestones)
    }
  }, [contentData, authorData])

  return {
    notifications,
    setNotifications,
    clearNotifications: () => setNotifications([]),
    markAllAsRead: () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }
} 