import type { VercelRequest, VercelResponse } from '@vercel/node'
import { signInWithSpotifyWithCode } from './helpers/spotify.ts'
import { SpotifyApi, type AccessToken } from '@spotify/web-api-ts-sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { authorization } = req.headers

  const prismaUser = await prisma.user.findFirstOrThrow({
     where: {refreshToken: authorization},
    })

  return res.json(prismaUser)
}
