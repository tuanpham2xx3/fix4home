import Layout from '@/components/shared/Layout';
import { PaymentsList } from '@/components/payment';

export default function CustomerPayments() {
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Dashboard', href: '/customer/dashboard' },
    { label: 'Lịch sử thanh toán' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <PaymentsList 
        type="sent"
        showStats={true}
      />
    </Layout>
  );
}
