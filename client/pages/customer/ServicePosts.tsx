import { useState } from 'react';
import Layout from '@/components/shared/Layout';
import { ServicePostsList, CreateServicePost } from '@/components/service-posts';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerServicePosts() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Dashboard', href: '/customer/dashboard' },
    { label: 'Bài đăng của tôi' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bài đăng của tôi
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý tất cả bài đăng tìm thợ của bạn
            </p>
          </div>

          <CreateServicePost
            onSuccess={handlePostCreated}
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài đăng mới
              </Button>
            }
          />
        </div>

        {/* Quick Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Mẹo để có bài đăng hiệu quả
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <ul className="space-y-2">
                <li>• Viết tiêu đề rõ ràng, cụ thể</li>
                <li>• Mô tả chi tiết vấn đề cần giải quyết</li>
                <li>• Đặt ngân sách hợp lý với thị trường</li>
              </ul>
              <ul className="space-y-2">
                <li>• Thêm hình ảnh minh họa rõ ràng</li>
                <li>• Chọn mức độ ưu tiên phù hợp</li>
                <li>• Phản hồi nhanh chóng với thợ ứng tuyển</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* My Service Posts List */}
        <ServicePostsList 
          key={refreshKey}
          showMyPosts={true}
        />
      </div>
    </Layout>
  );
}
