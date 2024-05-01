# Spotify Daily Playlist Creator

Create your own "Daily Drive" playlist.

## Getting started

```sh
# Install dependencies
bun install

# Setup your .env with values from your Spotify Developer account
# https://developer.spotify.com/dashboard
cp .env.example.env

# Setup your own config.json with your own playlist IDs
cp config.example.yml config.yml

# Run your script
bun run index.ts
```

## Configuration

The configuration file must be named `config.yml`. It works as follows:

```yaml
playlist_id: THE_PLAYLIST_ID_TO_UPDATE

content:
# Will get the latest episode if it has not been listened yet
# Podcasts only
- type: latest_unlistened_episode
  value: https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx
# Or if you want the latest between multiple shows
- type: latest_unlistened_episode
  value:
  - https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx
  - https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx

# Will get the episode released on the current date if it has not been listened yet
# Podcasts only
- type: today_episode
  value: https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx

# Will get a random track from a playlist
# Playlists only
- type: random_track
  value: https://open.spotify.com/playlist/xxxxxxxxxxxxxxxxxxxxxx

# Will get the newest episode that has not been listened yet
# Podcasts only
- type: newest_unlistened_episode
  value: https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx
# Or if you want the newest between multiple shows
- type: newest_unlistened_episode
  value:
  - https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx
  - https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx

# Will loop through the elements in the `through` key and append the ones in `value`
- type: loop
  through:
  - type: today_episode
    value: https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx
  - type: latest_unlistened_episode
    value: https://open.spotify.com/show/xxxxxxxxxxxxxxxxxxxxxx
  value:
  - type: random_track
    value: https://open.spotify.com/playlist/xxxxxxxxxxxxxxxxxxxxxx
```
