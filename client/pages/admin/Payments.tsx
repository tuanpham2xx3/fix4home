import Layout from '@/components/shared/Layout';
import { AdminPaymentsList } from '@/components/admin';

export default function AdminPayments() {
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Admin Dashboard', href: '/admin/dashboard' },
    { label: 'Quản lý thanh toán' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <AdminPaymentsList />
    </Layout>
  );
}
