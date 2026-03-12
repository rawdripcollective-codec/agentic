import { z } from '@hono/zod-openapi'

import { projectIdSchema, teamIdSchema, userIdSchema } from '@/db/schemas'

export const githubAppScopeSchema = z.enum(['user', 'team', 'project'])

export const githubAppInstallationStatusSchema = z
  .object({
    scope: githubAppScopeSchema,
    scopeId: z.string(),
    isInstalled: z.boolean(),
    installUrl: z.string().url(),
    updatePermissionsUrl: z.string().url(),
    reconnectUrl: z.string().url(),
    syncUrl: z.string().url(),
    connectedAccountLogin: z.string().optional(),
    connectedAccountType: z.enum(['User', 'Organization']).optional(),
    connectedRepositories: z.array(z.string()),
    lastSyncedAt: z.string().datetime().optional()
  })
  .openapi('GitHubAppInstallationStatus')

export const githubAppActionResponseSchema = z
  .object({
    ok: z.literal(true),
    action: z.enum(['sync', 'reconnect']),
    status: githubAppInstallationStatusSchema
  })
  .openapi('GitHubAppActionResponse')

export const userIdParamsSchema = z
  .object({ userId: userIdSchema })
  .openapi('GitHubAppUserParams')

export const teamIdParamsSchema = z
  .object({ teamId: teamIdSchema })
  .openapi('GitHubAppTeamParams')

export const projectIdParamsSchema = z
  .object({ projectId: projectIdSchema })
  .openapi('GitHubAppProjectParams')
