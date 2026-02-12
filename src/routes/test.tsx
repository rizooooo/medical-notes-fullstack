import { createFileRoute } from '@tanstack/react-router'
import { getAllHospices } from '@/server/hospice'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
  loader: async () => {
    return await getAllHospices()
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return <div>Hello "/test"!</div>
}
