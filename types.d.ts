type StaticContentItem = {
  type: 'random_track' | 'today_episode'
  value: string
} | {
  type: 'latest_unlistened_episode' | 'newest_unlistened_episode'
  value: string | string[]
}

type ConfigContentItem = StaticContentItem | {
  type: 'loop'
  through: ConfigContentItem[]
  value: ConfigContentItem[]
}

interface Config {
  playlistId: string
  content: ConfigContentItem[]
}
