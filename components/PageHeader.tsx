'use client';

import { useState, useEffect } from 'react';

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`sm:hidden bg-white border-b border-gray-200 sticky top-0 z-10 transition-all duration-300 ${
        isScrolled
          ? 'py-2 bg-white/95 backdrop-blur-sm shadow-sm'
          : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className={`font-bold text-gray-900 transition-all duration-300 ${
            isScrolled ? 'text-base' : 'text-2xl'
          }`}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
