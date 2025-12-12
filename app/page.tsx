import { prisma } from '@/lib/prisma';
import CreateProject from '@/components/CreateProject';
import ProjectDashboard from '@/components/ProjectDashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch the single project (if it exists)
  const project = await prisma.project.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  // If no project exists, show the creation form
  if (!project) {
    return <CreateProject />;
  }

  // Serialize dates for client component
  const serializedProject = {
    ...project,
    startDate: project.startDate.toISOString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  // Otherwise, show the project dashboard
  return <ProjectDashboard project={serializedProject} />;
}
