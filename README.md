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
cp config.example.json config.json

# Run your script
bun run index.ts
```

## Filling the configuration file

The configuration file must be named `config.json`. It contains 4 elements:

- `favoriteShows: string[]`: Your favorite podcasts. The lateste episode will be at the top of the playlist until you listen to them
- `musicPlaylists: string[]`: Playlists to get musics from between podcasts
- `newsChannels: string[]`: You news podcasts. Only the current day's episode will be fetched
- `playlistId: string`: The playlist you manually created in Spotify

Those fields are expecting IDs from Spotify. You can get them by clicking "Share" > "Copy Link" in Spotify.

The link will look something like this: `https://open.spotify.com/show/4xQ0IUSsrfs6pltTnwr3Kk?si=46bf191956ef4ca6`. You must take only the `4xQ0IUSsrfs6pltTnwr3Kk` part.
