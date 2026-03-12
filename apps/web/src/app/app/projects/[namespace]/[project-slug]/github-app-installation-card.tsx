'use client'

import { useMemo, useState } from 'react'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { useQuery } from '@/lib/query-client'

type Scope = 'user' | 'team' | 'project'

function formatDate(value?: string): string {
  if (!value) {
    return 'Never synced'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return date.toLocaleString()
}

export function GitHubAppInstallationCard({
  scope,
  scopeId,
  title
}: {
  scope: Scope
  scopeId?: string
  title: string
}) {
  const ctx = useAuthenticatedAgentic()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const query = useQuery({
    queryKey: ['github-app-installation', scope, scopeId],
    queryFn: async () => {
      if (!scopeId) {
        return undefined
      }

      if (scope === 'user') {
        return ctx!.api.getUserGitHubAppInstallationStatus({ userId: scopeId })
      }

      if (scope === 'team') {
        return ctx!.api.getTeamGitHubAppInstallationStatus({ teamId: scopeId })
      }

      return ctx!.api.getProjectGitHubAppInstallationStatus({
        projectId: scopeId
      })
    },
    enabled: !!ctx && !!scopeId
  })

  const onSync = async () => {
    if (!scopeId || !ctx) {
      return
    }

    setIsSyncing(true)
    try {
      if (scope === 'user') {
        await ctx.api.syncUserGitHubAppInstallation({ userId: scopeId })
      } else if (scope === 'team') {
        await ctx.api.syncTeamGitHubAppInstallation({ teamId: scopeId })
      } else {
        await ctx.api.syncProjectGitHubAppInstallation({ projectId: scopeId })
      }

      await query.refetch()
    } finally {
      setIsSyncing(false)
    }
  }

  const onReconnect = async () => {
    if (!scopeId || !ctx) {
      return
    }

    setIsReconnecting(true)
    try {
      if (scope === 'user') {
        await ctx.api.reconnectUserGitHubAppInstallation({ userId: scopeId })
      } else if (scope === 'team') {
        await ctx.api.reconnectTeamGitHubAppInstallation({ teamId: scopeId })
      } else {
        await ctx.api.reconnectProjectGitHubAppInstallation({
          projectId: scopeId
        })
      }

      await query.refetch()
    } finally {
      setIsReconnecting(false)
    }
  }

  const content = useMemo(() => {
    if (!scopeId) {
      return <p className='text-sm text-muted-foreground'>Not available</p>
    }

    if (!ctx || query.isLoading) {
      return <LoadingIndicator />
    }

    if (query.isError || !query.data) {
      return (
        <p className='text-sm text-red-600'>
          Unable to fetch installation status.
        </p>
      )
    }

    const status = query.data

    return (
      <div className='space-y-3'>
        <p className='text-sm'>
          <strong>Status:</strong>{' '}
          {status.isInstalled ? 'Installed' : 'Not installed'}
        </p>

        <p className='text-sm'>
          <strong>Connected scope:</strong>{' '}
          {status.connectedAccountLogin
            ? `${status.connectedAccountType ?? 'Account'} ${status.connectedAccountLogin}`
            : 'No account connected'}
        </p>

        <p className='text-sm'>
          <strong>Repositories:</strong>{' '}
          {status.connectedRepositories.length
            ? status.connectedRepositories.join(', ')
            : 'All or unknown'}
        </p>

        <p className='text-sm'>
          <strong>Last sync:</strong> {formatDate(status.lastSyncedAt)}
        </p>

        <div className='flex flex-wrap gap-2'>
          <Button asChild size='sm' variant='outline'>
            <a href={status.installUrl} rel='noreferrer' target='_blank'>
              {status.isInstalled
                ? 'Install on another account'
                : 'Install GitHub App'}
            </a>
          </Button>

          <Button asChild size='sm' variant='outline'>
            <a
              href={status.updatePermissionsUrl}
              rel='noreferrer'
              target='_blank'
            >
              Update permissions
            </a>
          </Button>

          <Button disabled={isSyncing} onClick={() => void onSync()} size='sm'>
            {isSyncing ? 'Syncing…' : 'Trigger sync'}
          </Button>

          <Button
            disabled={isReconnecting}
            onClick={() => void onReconnect()}
            size='sm'
            variant='secondary'
          >
            {isReconnecting ? 'Reconnecting…' : 'Reconnect'}
          </Button>
        </div>
      </div>
    )
  }, [ctx, isReconnecting, isSyncing, query, scope, scopeId])

  return (
    <article className='rounded-lg border p-4'>
      <h2 className='font-semibold mb-3'>{title}</h2>
      {content}
    </article>
  )
}
