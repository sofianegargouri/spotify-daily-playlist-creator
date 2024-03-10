const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string

const base64encode = (input: any): string => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const scopes = [
  'playlist-modify-private',
  'playlist-read-private',
  'user-read-playback-position',
  'playlist-modify-public',
]

export const getSpotifyAuthenticationUrl = async () => {
  const scope = scopes.join(' ')
  const authUrl = new URL('https://accounts.spotify.com/authorize')

  const codeVerifier = generateRandomString(64)

  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri
  }

  authUrl.search = new URLSearchParams(params).toString()

  return {
    url: authUrl.toString(),
    codeVerifier,
  }
}
