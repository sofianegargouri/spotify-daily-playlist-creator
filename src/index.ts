import { clearPlaylist } from './helpers/spotify'
import YAML from 'yaml'
import { camelizeKeys } from 'humps'
import { compact, map } from 'lodash'
import { getItemsFromConfig } from './helpers/builder'
import spotifyClient from './constants/spotify-client'

const file = await Bun.file(import.meta.dir + '/../config.yml')
const stringifiedYaml = await file.text()

const { playlistId, content } = camelizeKeys(YAML.parse(stringifiedYaml)) as Config
console.info('Clearing playlist')
await clearPlaylist(playlistId)
console.info('Playlist cleared')

const tracks = await getItemsFromConfig(content)

console.info('Saving into the playlist')
await spotifyClient.playlists.addItemsToPlaylist(playlistId, compact(map(tracks, 'uri')))
console.info('Saved')
