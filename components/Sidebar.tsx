'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  projectName: string;
}

export default function Sidebar({ projectName }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
    { href: '/budget', label: 'Budget', icon: '$' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">{projectName}</h1>
        <p className="text-xs text-gray-500 mt-1">Renovation Project</p>
      </div>
      <nav className="p-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-3">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
