import type { VercelRequest, VercelResponse } from '@vercel/node'
import { signInWithSpotifyWithCode } from './helpers/spotify.ts'
import { SpotifyApi, type AccessToken } from '@spotify/web-api-ts-sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, codeVerifier } = req.body
  const response = await signInWithSpotifyWithCode(code, codeVerifier)

  const spotifyClient = SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID as string, response)

  const currentUser = await spotifyClient.currentUser.profile()

  const prismaUser = await prisma.user.upsert(
    {
      where: {spotifyId: currentUser.id},
      update: {
        spotifyId: currentUser.id,
        spotifyName: currentUser.display_name,
        refreshToken: response.refresh_token
      },
      create: {
        spotifyId: currentUser.id,
        spotifyName: currentUser.display_name,
        refreshToken: response.refresh_token
      },
    },
  )

  return res.json({
    ...prismaUser,
    accessToken: response.access_token
  })
}
