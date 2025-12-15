import { prisma } from '@/lib/prisma';
import CreateProject from '@/components/CreateProject';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import ProjectOverview from '@/components/ProjectOverview';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch the single active project (if it exists)
  const project = await prisma.project.findFirst({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  // If no active project exists, show the creation form
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop only */}
      <Sidebar projectName={project.name} />

      {/* Main Content Area */}
      <div className="flex-1 pb-14 sm:pb-0 sm:ml-64">
        <PageHeader title={project.name} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProjectOverview project={serializedProject} />
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
