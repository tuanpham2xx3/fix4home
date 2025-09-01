import { useParams } from 'react-router-dom';
import Layout from '@/components/shared/Layout';
import { ServicePostDetail } from '@/components/service-posts';

export default function ServicePostDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ID bài đăng không hợp lệ
          </h2>
          <p className="text-gray-600">
            Vui lòng kiểm tra lại đường dẫn
          </p>
        </div>
      </Layout>
    );
  }

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tìm việc làm', href: '/service-posts' },
    { label: 'Chi tiết công việc' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <ServicePostDetail postId={parseInt(id)} />
    </Layout>
  );
}
