import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  servicePostsAPI, 
  categoriesAPI,
  handleAPIError,
  ServicePost,
  ServiceCategory
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ServicePostCard from './ServicePostCard';
import { 
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  RefreshCw,
  Grid3X3,
  List,
  MapPin,
  DollarSign
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

interface ServicePostsListProps {
  showMyPosts?: boolean;
  className?: string;
}

interface Filters {
  search: string;
  categoryId: number | null;
  urgency: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  sortBy: 'latest' | 'budget' | 'urgency';
}

export default function ServicePostsList({ 
  showMyPosts = false,
  className 
}: ServicePostsListProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ServicePost[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categoryId: null,
    urgency: '',
    budgetMin: 0,
    budgetMax: 10000000,
    location: '',
    sortBy: 'latest'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasMore: true
  });

  // Load data
  useEffect(() => {
    loadCategories();
    loadPosts(true);
  }, [showMyPosts]);

  // Load posts when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPosts(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        setIsLoadingMore(true);
      }

      const page = reset ? 1 : pagination.page;
      
      let response;
      if (showMyPosts) {
        response = await servicePostsAPI.getMy();
      } else {
        response = await servicePostsAPI.getAll(page, pagination.limit);
      }

      if (response.success) {
        if (showMyPosts) {
          // Filter client-side for "My Posts"
          const filteredPosts = filterPosts(response.data);
          setPosts(filteredPosts);
          setPagination(prev => ({ 
            ...prev, 
            total: filteredPosts.length,
            hasMore: false 
          }));
        } else {
          const { posts: newPosts, total, hasMore } = response.data;
          
          if (reset) {
            setPosts(newPosts);
          } else {
            setPosts(prev => [...prev, ...newPosts]);
          }
          
          setPagination(prev => ({ 
            ...prev, 
            total,
            hasMore,
            page: page + 1
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: handleAPIError(error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const filterPosts = (allPosts: ServicePost[]) => {
    return allPosts.filter(post => {
      // Search filter
      if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !post.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categoryId && post.service.categoryId !== filters.categoryId) {
        return false;
      }

      // Urgency filter
      if (filters.urgency && post.urgency !== filters.urgency) {
        return false;
      }

      // Budget filter
      if (post.budget < filters.budgetMin || post.budget > filters.budgetMax) {
        return false;
      }

      // Location filter
      if (filters.location && !post.address.district.toLowerCase().includes(filters.location.toLowerCase()) &&
          !post.address.city.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'budget':
          return b.budget - a.budget;
        case 'urgency':
          const urgencyOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categoryId: null,
      urgency: '',
      budgetMin: 0,
      budgetMax: 10000000,
      location: '',
      sortBy: 'latest'
    });
  };

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (filters.urgency) count++;
    if (filters.budgetMin > 0 || filters.budgetMax < 10000000) count++;
    if (filters.location) count++;
    return count;
  };

  if (isLoading) {
    return <ServicePostsListSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {showMyPosts ? 'Bài đăng của tôi' : 'Tìm việc làm'}
          </h2>
          <p className="text-gray-600">
            {showMyPosts 
              ? `${posts.length} bài đăng`
              : `${pagination.total} công việc đang tuyển thợ`
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadPosts(true)}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm công việc..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center space-x-2">
          <Select 
            value={filters.urgency} 
            onValueChange={(value) => handleFilterChange('urgency', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="HIGH">Khẩn cấp</SelectItem>
              <SelectItem value="MEDIUM">Bình thường</SelectItem>
              <SelectItem value="LOW">Không vội</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.sortBy} 
            onValueChange={(value: 'latest' | 'budget' | 'urgency') => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Mới nhất</SelectItem>
              <SelectItem value="budget">Lương cao</SelectItem>
              <SelectItem value="urgency">Ưu tiên</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Lọc
                {getActiveFiltersCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Bộ lọc nâng cao</SheetTitle>
                <SheetDescription>
                  Tùy chỉnh kết quả tìm kiếm theo nhu cầu của bạn
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select 
                    value={filters.categoryId?.toString() || ''} 
                    onValueChange={(value) => handleFilterChange('categoryId', value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả danh mục</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Range */}
                <div className="space-y-4">
                  <Label>Ngân sách (VNĐ)</Label>
                  <div className="px-3">
                    <Slider
                      min={0}
                      max={10000000}
                      step={100000}
                      value={[filters.budgetMin, filters.budgetMax]}
                      onValueChange={([min, max]) => {
                        handleFilterChange('budgetMin', min);
                        handleFilterChange('budgetMax', max);
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatBudget(filters.budgetMin)} VNĐ</span>
                    <span>{formatBudget(filters.budgetMax)} VNĐ</span>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Khu vực</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Nhập quận, thành phố..."
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Posts Grid/List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {showMyPosts ? 'Chưa có bài đăng nào' : 'Không tìm thấy công việc'}
          </h3>
          <p className="text-gray-400">
            {showMyPosts 
              ? 'Hãy tạo bài đăng đầu tiên để tìm thợ' 
              : 'Thử điều chỉnh bộ lọc để tìm thêm công việc'
            }
          </p>
        </div>
      ) : (
        <>
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {posts.map((post) => (
              <ServicePostCard
                key={post.id}
                post={post}
                showActions={showMyPosts}
                className={viewMode === 'list' ? 'max-w-full' : ''}
              />
            ))}
          </div>

          {/* Load More */}
          {pagination.hasMore && !showMyPosts && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={() => loadPosts(false)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  'Tải thêm'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ServicePostsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Posts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
