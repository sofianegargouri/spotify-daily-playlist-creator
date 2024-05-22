import { DateTime } from 'luxon'
import spotifyClient from '../constants/spotify-client'
import { find, flatten, get, head, isArray, map, reverse, sample, sortBy } from 'lodash'
import type { PlaylistedTrack, SimplifiedEpisode, Track } from '@spotify/web-api-ts-sdk'

interface ParsedSpotifyUri {
  fullUri: string
  type: 'playlist' | 'show'
  id: string
}

const parseSpotifyUri = (spotifyUri: string): ParsedSpotifyUri => {
  const matches = spotifyUri.match(/https:\/\/open.spotify.com\/(show|playlist)\/([a-z0-9]+)/i)

  return {
    fullUri: get(matches, 0),
    type: get(matches, 1) as 'playlist' | 'show',
    id: get(matches, 2)!
  } as ParsedSpotifyUri
}

const loadResourceFromUrl = async (spotifyUri: string): Promise<SimplifiedEpisode[] | Array<PlaylistedTrack<Track>> | null> => {
  const { type, id } = parseSpotifyUri(spotifyUri)

  switch (type) {
    case 'playlist':
      const playlist = await spotifyClient.playlists.getPlaylistItems(id)
      return playlist.items
    case 'show':
      const episodes = await spotifyClient.shows.episodes(id, 'FR')
      return episodes.items
    default:
      return []
  }
}

const getLatestEpisode = async (spotifyUri: string): Promise<SimplifiedEpisode | undefined> => {
  try {
    const episodes = await loadResourceFromUrl(spotifyUri) as SimplifiedEpisode[] | null

    return get(episodes, 0)
  } catch (err) {
    console.error(spotifyUri)
  }
}

export const getLatestNewsEpisode = async (spotifyUri: string): Promise<SimplifiedEpisode | null> => {
  const latestEpisode = await getLatestEpisode(spotifyUri)

  if (latestEpisode?.release_date === DateTime.now().toISODate() && !latestEpisode.resume_point.fully_played) {
    return latestEpisode
  }
  return null
}

export const getLatestUnlistenedEpisode = async (spotifyUris: string | string[]): Promise<SimplifiedEpisode | undefined> => {
  let latestEpisode

  if (isArray(spotifyUris)) {
    const shows = await Promise.all(map(spotifyUris, async spotifyUri => {
      const { id } = parseSpotifyUri(spotifyUri)
      return await spotifyClient.shows.episodes(id, 'FR')
    }))
    const episodes = reverse(sortBy(flatten(map(shows, 'items')), 'release_date'))
    latestEpisode = head(episodes)
  } else {
    latestEpisode = await getLatestEpisode(spotifyUris)
  }

  if (latestEpisode && !latestEpisode.resume_point.fully_played) {
    return latestEpisode
  }
}

export const getNewestUnlistenedEpisode = async (spotifyUris: string | string[]): Promise<SimplifiedEpisode | undefined> => {
  let episodes
  if (isArray(spotifyUris)) {
    const shows = await Promise.all(map(spotifyUris, async spotifyUri => {
      const { id } = parseSpotifyUri(spotifyUri)
      return await spotifyClient.shows.episodes(id, 'FR')
    }))
    episodes = reverse(sortBy(flatten(map(shows, 'items')), 'release_date'))
  } else {
    episodes = await loadResourceFromUrl(spotifyUris) as SimplifiedEpisode[] | null
  }

  return find(episodes, episode => !episode.resume_point.fully_played)
}

export const getRandomPlaylistItem = async (spotifyUri: string): Promise<Track | null> => {
  try {
    const tracks = await loadResourceFromUrl(spotifyUri) as Array<PlaylistedTrack<Track>> | null
    const randomItem = sample(tracks)

    return randomItem ? randomItem.track : null
  } catch (err) {
    console.error(spotifyUri)
    return null
  }
}

export const clearPlaylist = async (playlistId: string): Promise<void> => {
  const items = await spotifyClient.playlists.getPlaylistItems(playlistId, undefined, undefined, 50)

  if (items.total > 0) {
    await spotifyClient.playlists.removeItemsFromPlaylist(
      playlistId,
      { tracks: items.items.map(item => ({ uri: item.track.uri })) }
    )

    if (items.next) { await clearPlaylist(playlistId) }
  }
}
