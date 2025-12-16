import { prisma } from '@/lib/prisma';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import SchedulePage from '@/components/SchedulePage';

export const dynamic = 'force-dynamic';

export default async function Schedule() {
  const project = await prisma.project.findFirst({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No active project found. Please create a project first.</p>
      </div>
    );
  }

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
      <div className="flex-1 pb-14 sm:pb-0 sm:ml-64 min-w-0">
        <PageHeader title={project.name} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
          <SchedulePage project={serializedProject} />
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
