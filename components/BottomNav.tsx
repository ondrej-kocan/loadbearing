'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
    { href: '/budget', label: 'Budget', icon: '$' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom shadow-lg">
      <div className="flex justify-around items-center h-14 max-w-7xl mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-blue-600 scale-110'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              aria-label={link.label}
            >
              <span className="text-3xl">{link.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
