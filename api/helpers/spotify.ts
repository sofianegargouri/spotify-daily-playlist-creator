import axios from 'axios'

export const signInWithSpotifyWithCode = async (code: string, codeVerifier: string) => {
  try {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID as string,
    grant_type: 'authorization_code',
    code: code as string,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
    code_verifier: codeVerifier
  }))
  return response.data
} catch(err) {
  console.error(err)
}
}
