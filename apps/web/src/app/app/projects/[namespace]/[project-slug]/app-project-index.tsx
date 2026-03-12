'use client'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { PageContainer } from '@/components/page-container'
import { useQuery } from '@/lib/query-client'

import { GitHubAppInstallationCard } from './github-app-installation-card'

export function AppProjectIndex({
  projectIdentifier
}: {
  projectIdentifier: string
}) {
  const ctx = useAuthenticatedAgentic()
  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['project', projectIdentifier],
    queryFn: () =>
      ctx!.api.getProjectByIdentifier({
        projectIdentifier,
        populate: ['lastPublishedDeployment']
      }),
    enabled: !!ctx
  })

  // TODO: show deployments

  return (
    <PageContainer>
      <section>
        {!ctx || isLoading ? (
          <LoadingIndicator />
        ) : isError ? (
          <p>Error fetching project</p>
        ) : !project ? (
          <p>Project "{projectIdentifier}" not found</p>
        ) : (
          <>
            <h1
              className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
            >
              {project.name}
            </h1>

            <div className='mt-8 grid gap-4'>
              <GitHubAppInstallationCard
                scope='project'
                scopeId={project.id}
                title='Project GitHub App installation'
              />

              <GitHubAppInstallationCard
                scope='team'
                scopeId={project.teamId}
                title='Team GitHub App installation'
              />

              <GitHubAppInstallationCard
                scope='user'
                scopeId={project.userId}
                title='User GitHub App installation'
              />

              <pre className='max-w-lg'>{JSON.stringify(project, null, 2)}</pre>
            </div>
          </>
        )}
      </section>
    </PageContainer>
  )
}
