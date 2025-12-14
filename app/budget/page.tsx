import { prisma } from '@/lib/prisma';
import BottomNav from '@/components/BottomNav';
import BudgetPage from '@/components/BudgetPage';

export const dynamic = 'force-dynamic';

export default async function Budget() {
  const project = await prisma.project.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No project found. Please create a project first.</p>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BudgetPage project={serializedProject} />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
