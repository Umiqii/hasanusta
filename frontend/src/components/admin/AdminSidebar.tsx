import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Briefcase, MessageSquare, QrCode, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const { t } = useTranslation(); // Assuming i18n is set up for admin keys too
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: t('adminSidebar.dashboard', 'Gösterge Paneli') },
    { to: "/admin/reservations", icon: CalendarCheck, label: t('adminSidebar.reservations', 'Rezervasyonlar') },
    { to: "/admin/applications", icon: Briefcase, label: t('adminSidebar.applications', 'Başvurular') },
    { to: "/admin/messages", icon: MessageSquare, label: t('adminSidebar.messages', 'Mesajlar') },
    { to: "/admin/tables", icon: QrCode, label: t('adminSidebar.tables', 'Masa Yönetimi') },
    { to: "/admin/settings", icon: Settings, label: t('adminSidebar.settings', 'Şube Ayarları') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold font-serif text-primary-red">Yönetici Paneli</span>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-beige text-primary-red font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t('adminSidebar.logout', 'Çıkış Yap')}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar; 