import Layout from '@/components/shared/Layout';
import { PaymentsList } from '@/components/payment';

export default function TechnicianPayments() {
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Dashboard', href: '/technician/dashboard' },
    { label: 'Thu nhập' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <PaymentsList 
        type="received"
        showStats={true}
      />
    </Layout>
  );
}
