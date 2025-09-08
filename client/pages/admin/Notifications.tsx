import Layout from '@/components/shared/Layout';
import { AdminNotifications } from '@/components/admin';

export default function AdminNotificationsPage() {
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Admin Dashboard', href: '/admin/dashboard' },
    { label: 'Quản lý thông báo' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <AdminNotifications />
    </Layout>
  );
}
