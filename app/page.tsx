import { prisma } from '@/lib/prisma';
import CreateProject from '@/components/CreateProject';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import ProjectOverview from '@/components/ProjectOverview';

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

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      <PageHeader title={project.name} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectOverview project={serializedProject} />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
