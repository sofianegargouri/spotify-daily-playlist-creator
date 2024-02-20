import spotifyClient from './constants/spotify-client'
import { clearPlaylist, getLatestNewsEpisode, getLatestShowEpisode, getRandomPlaylistItem } from './helpers'
import { compact, flatten, map } from 'lodash'
import {favoriteShows, newsChannels, musicPlaylists, playlistId} from './config.json'

await clearPlaylist(playlistId)

const tracks = await Promise.all(flatten([
  ...map(favoriteShows, async favoriteShow => await getLatestShowEpisode(favoriteShow)),
  ...map(newsChannels, newsChannel => ([
    getLatestNewsEpisode(newsChannel),
    ...map(musicPlaylists, async playlist => await getRandomPlaylistItem(playlist))
  ]))
]))

await spotifyClient.playlists.addItemsToPlaylist(playlistId, compact(map(tracks, 'uri')))
