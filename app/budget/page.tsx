import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar projectName={project.name} />
      <div className="flex-1 p-8">
        <BudgetPage project={serializedProject} />
      </div>
    </div>
  );
}
