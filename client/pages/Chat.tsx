import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/shared/Layout';
import { Chat } from '@/components/chat';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  const conversationId = id ? parseInt(id) : undefined;
  const participantId = searchParams.get('with') ? parseInt(searchParams.get('with')!) : undefined;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đăng nhập để sử dụng chat
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để có thể nhắn tin với người khác
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Đăng nhập
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tin nhắn' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="h-[calc(100vh-200px)] min-h-[600px]">
        <Chat 
          initialConversationId={conversationId}
          participantId={participantId}
          className="h-full"
        />
      </div>
    </Layout>
  );
}
