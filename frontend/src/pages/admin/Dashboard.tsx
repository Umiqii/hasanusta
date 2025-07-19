import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();

  // Placeholder data - replace with actual data fetching
  const stats = {
    newReservations: 5,
    newApplications: 2,
    newMessages: 8,
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t('adminDashboard.title', 'Gösterge Paneli')}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('adminDashboard.newReservations', 'Yeni Rezervasyonlar')}
            </CardTitle>
             {/* Icon can be added here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-red">{stats.newReservations}</div>
            {/* Optional: Add comparison or trend text */}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('adminDashboard.newApplications', 'Yeni Başvurular')}
            </CardTitle>
             {/* Icon can be added here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-red">{stats.newApplications}</div>
            {/* Optional: Add comparison or trend text */}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('adminDashboard.newMessages', 'Yeni Mesajlar')}
            </CardTitle>
             {/* Icon can be added here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-red">{stats.newMessages}</div>
             {/* Optional: Add comparison or trend text */}
          </CardContent>
        </Card>
      </div>
       {/* Optional: Add recent activity or charts here */}
    </AdminLayout>
  );
};

export default Dashboard; 