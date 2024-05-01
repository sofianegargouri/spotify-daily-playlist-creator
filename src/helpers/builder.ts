import { flattenDeep, map } from 'lodash'
import { getLatestNewsEpisode, getLatestUnlistenedEpisode, getNewestUnlistenedEpisode, getRandomPlaylistItem } from './spotify'
import type { SimplifiedEpisode, Track } from '@spotify/web-api-ts-sdk'

const buildPromisesArray = async (content: Config['content']): Promise<Array<SimplifiedEpisode | Track | null | undefined>> => {
  return await Promise.all(map(content, async (contentItem) => {
    switch (contentItem.type) {
      case 'latest_unlistened_episode':
        return await getLatestUnlistenedEpisode(contentItem.value)
      case 'newest_unlistened_episode':
        return await getNewestUnlistenedEpisode(contentItem.value)
      case 'random_track':
        return await getRandomPlaylistItem(contentItem.value)
      case 'today_episode':
        return await getLatestNewsEpisode(contentItem.value)
    }
  }))
}

export const dynamizeConfig = (content: Config['content']): StaticContentItem[] => {
  return flattenDeep(map(content, (contentItem) => {
    switch (contentItem.type) {
      case 'loop':
        return map(contentItem.through, item => {
          return [
            ...dynamizeConfig([item]),
            ...dynamizeConfig(contentItem.value)
          ]
        })
      case 'latest_unlistened_episode':
      case 'newest_unlistened_episode':
        return {
          ...contentItem,
          value: contentItem.value
        }
      default:
        return {
          ...contentItem,
          value: contentItem.value
        }
    }
  }))
}

export const getItemsFromConfig = async (content: Config['content']): Promise<Array<SimplifiedEpisode | Track | null | undefined>> => {
  const dynamizedConfig = dynamizeConfig(content)

  return await buildPromisesArray(dynamizedConfig)
}
