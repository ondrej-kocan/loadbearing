import { prisma } from '@/lib/prisma';
import TopNav from '@/components/TopNav';
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
    <div className="min-h-screen bg-gray-50">
      <TopNav projectName={project.name} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BudgetPage project={serializedProject} />
      </div>
    </div>
  );
}
