import { DateTime } from 'luxon'
import spotifyClient from './constants/spotify-client'
import { sample } from 'lodash'
import type { SimplifiedEpisode, Track } from '@spotify/web-api-ts-sdk'

const getLatestEpisode = async (showId: string): Promise<SimplifiedEpisode | null> => {
  try {
    console.debug(`Getting latest episode for ${showId}`)
    const episodes = await spotifyClient.shows.episodes(showId, 'FR')
    const [latestEpisode] = episodes.items

    return latestEpisode
  } catch (err) {
    console.error(showId)
    return null
  }
}

export const getLatestNewsEpisode = async (showId: string): Promise<SimplifiedEpisode | null> => {
  console.debug(`Getting latest news episode for ${showId}`)
  const latestEpisode = await getLatestEpisode(showId)

  if (latestEpisode?.release_date === DateTime.now().toISODate() && !latestEpisode.resume_point.fully_played) {
    return latestEpisode
  }
  return null
}

export const getLatestShowEpisode = async (showId: string): Promise<SimplifiedEpisode | null> => {
  console.debug(`Getting latest show episode for ${showId}`)

  const latestEpisode = await getLatestEpisode(showId)

  if (latestEpisode && !latestEpisode.resume_point.fully_played) {
    return latestEpisode
  }
  return null
}

export const getRandomPlaylistItem = async (playlistId: string): Promise<Track | null> => {
  try {
    console.debug(`Getting random playlist item for ${playlistId}`)

    const playlist = await spotifyClient.playlists.getPlaylistItems(playlistId)

    const randomItem = sample(playlist.items)
    return randomItem ? randomItem.track : null
  } catch (err) {
    console.error(playlistId)
    return null
  }
}

export const clearPlaylist = async (playlistId: string): Promise<void> => {
  console.debug(`Getting playlist items for ${playlistId}`)
  const items = await spotifyClient.playlists.getPlaylistItems(playlistId, undefined, undefined, 50)

  console.debug(`Removing playlist items for ${playlistId}`)

  await spotifyClient.playlists.removeItemsFromPlaylist(
    playlistId,
    { tracks: items.items.map(item => ({ uri: item.track.uri })) }
  )
}
