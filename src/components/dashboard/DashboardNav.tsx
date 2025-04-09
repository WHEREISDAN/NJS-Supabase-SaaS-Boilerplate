'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
];

export function DashboardNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col h-screen bg-base-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-base-300 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                  "hover:bg-base-300",
                  pathname === item.href ? "bg-primary text-primary-content" : "text-base-content",
                  isCollapsed && "justify-center"
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-base-300">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className={cn(
              "flex items-center space-x-2 px-4 py-2 w-full rounded-lg",
              "hover:bg-base-300 transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );
} 