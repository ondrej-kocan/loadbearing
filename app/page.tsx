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

  // Otherwise, show the project dashboard
  return <ProjectDashboard project={project} />;
}
