import { useState } from 'react';
import Layout from '@/components/shared/Layout';
import { ServicePostsList, CreateServicePost } from '@/components/service-posts';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ServicePosts() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tìm việc làm' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Tìm việc làm
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá hàng trăm cơ hội việc làm dành cho thợ kỹ thuật. 
            Tìm công việc phù hợp với kỹ năng và kinh nghiệm của bạn.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <Card>
              <CardContent className="text-center p-6">
                <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">500+</p>
                <p className="text-gray-600">Công việc đang tuyển</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-6">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">1,200+</p>
                <p className="text-gray-600">Khách hàng tin tưởng</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-6">
                <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">95%</p>
                <p className="text-gray-600">Tỷ lệ hoàn thành</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Post Button for Customers */}
        {user?.role === 'CUSTOMER' && (
          <div className="flex justify-center">
            <CreateServicePost
              onSuccess={handlePostCreated}
              trigger={
                <Button size="lg" className="shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Đăng việc tìm thợ
                </Button>
              }
            />
          </div>
        )}

        {/* Info for Non-authenticated Users */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Đăng nhập để truy cập đầy đủ tính năng
            </h3>
            <p className="text-blue-700 mb-4">
              Đăng nhập để ứng tuyển công việc hoặc đăng bài tìm thợ
            </p>
            <div className="flex justify-center space-x-3">
              <Button asChild>
                <a href="/login">Đăng nhập</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/register-technician">Đăng ký thợ</a>
              </Button>
            </div>
          </div>
        )}

        {/* Service Posts List */}
        <ServicePostsList key={refreshKey} />
      </div>
    </Layout>
  );
}
