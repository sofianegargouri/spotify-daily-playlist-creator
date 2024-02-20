import { SpotifyApi, type AccessToken } from '@spotify/web-api-ts-sdk'
import queryString from 'query-string'

const clientId = process.env.SPOTIFY_CLIENT_ID as string
const redirectUri = process.env.SPOTIFY_REDIRECT_URI as string

let body

const file = await Bun.file(import.meta.dir+'/../.credentials')
if (file.size) {
  const json = await file.text()
  const parsedJson = JSON.parse(json)
  body = {
    grant_type: 'refresh_token',
    refresh_token: parsedJson.refresh_token,
    client_id: clientId
  }
} else {
  const scope = 'playlist-modify-private playlist-read-private user-read-playback-position'
  const authUrl = new URL('https://accounts.spotify.com/authorize')

  const generateRandomString = (length: number): string => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], '')
  }

  const codeVerifier = generateRandomString(64)

  const sha256 = (plain: string): NodeJS.TypedArray => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    const hasher = new Bun.CryptoHasher('sha256')
    hasher.update(data)
    return hasher.digest()
  }

  const base64encode = (input: any): string => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }
  const hashed = sha256(codeVerifier)
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

  console.log(authUrl.toString())

  const redirectedUri = prompt('Paste the redirect URI: ') ?? ''

  const code = queryString.parse('?' + redirectedUri.split('?')[1]).code
  body = {
    client_id: clientId,
    grant_type: 'authorization_code',
    code: code as string,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  }
}

const payload = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams(body)
}

const response = await fetch('https://accounts.spotify.com/api/token', payload)
const token = await response.json() as AccessToken

await Bun.write(import.meta.dir+'/../.credentials', JSON.stringify(token))

export default SpotifyApi.withAccessToken(
  clientId,
  token
)
