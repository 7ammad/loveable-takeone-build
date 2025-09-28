import Link from 'next/link';
import { ReactNode } from 'react';
import { Database, Users, Shield, BarChart3, Settings, Cpu, DatabaseZap } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
  },
  {
    href: '/admin/content',
    label: 'Content',
    icon: Database,
  },
  {
    href: '/admin/compliance',
    label: 'Compliance',
    icon: Shield,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/admin/system',
    label: 'System',
    icon: Settings,
  },
  {
    href: '/admin/digital-twin/sources',
    label: 'Digital Twin',
    icon: DatabaseZap,
    description: 'Data ingestion & aggregation',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                TakeOne Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r">
          <div className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <div>
                      <div>{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
