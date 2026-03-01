import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { aclTeamMember } from '@/lib/acl-team-member'
import { env } from '@/lib/env'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import {
  githubAppActionResponseSchema,
  githubAppInstallationStatusSchema,
  projectIdParamsSchema,
  teamIdParamsSchema,
  userIdParamsSchema
} from './schemas'

type Scope = 'user' | 'team' | 'project'

function buildStatus({
  scope,
  scopeId,
  connectedAccountLogin,
  connectedAccountType,
  connectedRepositories,
  lastSyncedAt
}: {
  scope: Scope
  scopeId: string
  connectedAccountLogin?: string
  connectedAccountType?: 'User' | 'Organization'
  connectedRepositories?: string[]
  lastSyncedAt?: Date
}) {
  const installBaseUrl = `https://github.com/apps/${env.GITHUB_APP_SLUG}/installations/new`
  const state = `${scope}:${scopeId}`
  const params = new URLSearchParams({ state })

  return parseZodSchema(githubAppInstallationStatusSchema, {
    scope,
    scopeId,
    isInstalled: !!connectedAccountLogin,
    installUrl: `${installBaseUrl}?${params.toString()}`,
    updatePermissionsUrl: `https://github.com/settings/installations`,
    reconnectUrl: `/v1/github-app/${scope}s/${scopeId}/reconnect`,
    syncUrl: `/v1/github-app/${scope}s/${scopeId}/sync`,
    connectedAccountLogin,
    connectedAccountType,
    connectedRepositories: connectedRepositories ?? [],
    lastSyncedAt: lastSyncedAt?.toISOString()
  })
}

const getUserStatusRoute = createRoute({
  description: 'Gets GitHub App installation status for a user.',
  tags: ['github-app'],
  operationId: 'getUserGitHubAppInstallationStatus',
  method: 'get',
  path: 'github-app/users/{userId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: userIdParamsSchema },
  responses: {
    200: {
      description: 'GitHub App installation status',
      content: {
        'application/json': { schema: githubAppInstallationStatusSchema }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const getTeamStatusRoute = createRoute({
  description: 'Gets GitHub App installation status for a team.',
  tags: ['github-app'],
  operationId: 'getTeamGitHubAppInstallationStatus',
  method: 'get',
  path: 'github-app/teams/{teamId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: teamIdParamsSchema },
  responses: {
    200: {
      description: 'GitHub App installation status',
      content: {
        'application/json': { schema: githubAppInstallationStatusSchema }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const getProjectStatusRoute = createRoute({
  description: 'Gets GitHub App installation status for a project.',
  tags: ['github-app'],
  operationId: 'getProjectGitHubAppInstallationStatus',
  method: 'get',
  path: 'github-app/projects/{projectId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: projectIdParamsSchema },
  responses: {
    200: {
      description: 'GitHub App installation status',
      content: {
        'application/json': { schema: githubAppInstallationStatusSchema }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const userSyncRoute = createRoute({
  description: 'Triggers a sync for user GitHub App installation.',
  tags: ['github-app'],
  operationId: 'syncUserGitHubAppInstallation',
  method: 'post',
  path: 'github-app/users/{userId}/sync',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: userIdParamsSchema },
  responses: {
    200: {
      description: 'Action response',
      content: { 'application/json': { schema: githubAppActionResponseSchema } }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const userReconnectRoute = createRoute({
  description: 'Triggers a reconnect for user GitHub App installation.',
  tags: ['github-app'],
  operationId: 'reconnectUserGitHubAppInstallation',
  method: 'post',
  path: 'github-app/users/{userId}/reconnect',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: userIdParamsSchema },
  responses: {
    200: {
      description: 'Action response',
      content: { 'application/json': { schema: githubAppActionResponseSchema } }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const teamSyncRoute = createRoute({
  description: 'Triggers a sync for team GitHub App installation.',
  tags: ['github-app'],
  operationId: 'syncTeamGitHubAppInstallation',
  method: 'post',
  path: 'github-app/teams/{teamId}/sync',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: teamIdParamsSchema },
  responses: {
    200: {
      description: 'Action response',
      content: { 'application/json': { schema: githubAppActionResponseSchema } }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const teamReconnectRoute = createRoute({
  description: 'Triggers a reconnect for team GitHub App installation.',
  tags: ['github-app'],
  operationId: 'reconnectTeamGitHubAppInstallation',
  method: 'post',
  path: 'github-app/teams/{teamId}/reconnect',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: teamIdParamsSchema },
  responses: {
    200: {
      description: 'Action response',
      content: { 'application/json': { schema: githubAppActionResponseSchema } }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const projectSyncRoute = createRoute({
  description: 'Triggers a sync for project GitHub App installation.',
  tags: ['github-app'],
  operationId: 'syncProjectGitHubAppInstallation',
  method: 'post',
  path: 'github-app/projects/{projectId}/sync',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: projectIdParamsSchema },
  responses: {
    200: {
      description: 'Action response',
      content: { 'application/json': { schema: githubAppActionResponseSchema } }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

const projectReconnectRoute = createRoute({
  description: 'Triggers a reconnect for project GitHub App installation.',
  tags: ['github-app'],
  operationId: 'reconnectProjectGitHubAppInstallation',
  method: 'post',
  path: 'github-app/projects/{projectId}/reconnect',
  security: openapiAuthenticatedSecuritySchemas,
  request: { params: projectIdParamsSchema },
  responses: {
    200: {
      description: 'Action response',
      content: { 'application/json': { schema: githubAppActionResponseSchema } }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GitHubAppRoutes(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  app.openapi(getUserStatusRoute, async (c) => {
    const { userId } = c.req.valid('param')
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })
    assert(user, 404, `User not found "${userId}"`)
    await acl(c, user, { label: 'User', userField: 'id', teamField: 'id' })

    return c.json(buildStatus({ scope: 'user', scopeId: userId }))
  })

  app.openapi(getTeamStatusRoute, async (c) => {
    const { teamId } = c.req.valid('param')
    await aclTeamMember(c, { teamId })

    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.id, teamId)
    })
    assert(team, 404, `Team not found "${teamId}"`)

    return c.json(buildStatus({ scope: 'team', scopeId: teamId }))
  })

  app.openapi(getProjectStatusRoute, async (c) => {
    const { projectId } = c.req.valid('param')
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    return c.json(buildStatus({ scope: 'project', scopeId: projectId }))
  })

  app.openapi(userSyncRoute, async (c) => {
    const { userId } = c.req.valid('param')
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })
    assert(user, 404, `User not found "${userId}"`)
    await acl(c, user, { label: 'User', userField: 'id', teamField: 'id' })

    return c.json({
      ok: true,
      action: 'sync',
      status: buildStatus({ scope: 'user', scopeId: userId })
    })
  })

  app.openapi(userReconnectRoute, async (c) => {
    const { userId } = c.req.valid('param')
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })
    assert(user, 404, `User not found "${userId}"`)
    await acl(c, user, { label: 'User', userField: 'id', teamField: 'id' })

    return c.json({
      ok: true,
      action: 'reconnect',
      status: buildStatus({ scope: 'user', scopeId: userId })
    })
  })

  app.openapi(teamSyncRoute, async (c) => {
    const { teamId } = c.req.valid('param')
    await aclTeamMember(c, { teamId })

    return c.json({
      ok: true,
      action: 'sync',
      status: buildStatus({ scope: 'team', scopeId: teamId })
    })
  })

  app.openapi(teamReconnectRoute, async (c) => {
    const { teamId } = c.req.valid('param')
    await aclTeamMember(c, { teamId })

    return c.json({
      ok: true,
      action: 'reconnect',
      status: buildStatus({ scope: 'team', scopeId: teamId })
    })
  })

  app.openapi(projectSyncRoute, async (c) => {
    const { projectId } = c.req.valid('param')
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    return c.json({
      ok: true,
      action: 'sync',
      status: buildStatus({ scope: 'project', scopeId: projectId })
    })
  })

  return app.openapi(projectReconnectRoute, async (c) => {
    const { projectId } = c.req.valid('param')
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    return c.json({
      ok: true,
      action: 'reconnect',
      status: buildStatus({ scope: 'project', scopeId: projectId })
    })
  })
}
