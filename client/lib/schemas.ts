import { z } from 'zod';

// Common validation patterns
export const phoneRegex = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;

// Base schemas
export const idSchema = z.number().positive();
export const emailSchema = z.string().email('Email không hợp lệ');
export const phoneSchema = z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ');
export const passwordSchema = z.string()
  .min(6, 'Mật khẩu tối thiểu 6 ký tự')
  .max(50, 'Mật khẩu tối đa 50 ký tự');

// User role enum
export const UserRole = z.enum(['CUSTOMER', 'TECHNICIAN', 'ADMIN']);
export type UserRoleType = z.infer<typeof UserRole>;

// Service urgency enum
export const ServiceUrgency = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type ServiceUrgencyType = z.infer<typeof ServiceUrgency>;

// Service request status enum
export const ServiceRequestStatus = z.enum([
  'PENDING',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
]);
export type ServiceRequestStatusType = z.infer<typeof ServiceRequestStatus>;

// Authentication schemas
export const loginSchema = z.object({
  usernameOrEmail: z.string()
    .min(3, 'Username hoặc email tối thiểu 3 ký tự')
    .max(100, 'Username hoặc email tối đa 100 ký tự'),
  password: passwordSchema,
  rememberMe: z.boolean().optional().default(false)
});

export const registerCustomerSchema = z.object({
  username: z.string()
    .min(3, 'Username tối thiểu 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ, số và dấu gạch dưới'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  phone: phoneSchema,
  role: z.literal('CUSTOMER')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

export const registerTechnicianSchema = z.object({
  username: z.string()
    .min(3, 'Username tối thiểu 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ, số và dấu gạch dưới'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  phone: phoneSchema,
  role: z.literal('TECHNICIAN'),
  experience: z.number()
    .min(0, 'Kinh nghiệm không được âm')
    .max(50, 'Kinh nghiệm tối đa 50 năm'),
  skills: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 kỹ năng'),
  description: z.string()
    .min(10, 'Mô tả tối thiểu 10 ký tự')
    .max(1000, 'Mô tả tối đa 1000 ký tự')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

// Profile schemas
export const customerProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  phone: phoneSchema,
  avatar: z.string().url().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional()
});

export const technicianProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  phone: phoneSchema,
  avatar: z.string().url().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  experience: z.number()
    .min(0, 'Kinh nghiệm không được âm')
    .max(50, 'Kinh nghiệm tối đa 50 năm'),
  description: z.string()
    .min(10, 'Mô tả tối thiểu 10 ký tự')
    .max(1000, 'Mô tả tối đa 1000 ký tự'),
  skills: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 kỹ năng')
});

// Address schema
export const addressSchema = z.object({
  id: idSchema.optional(),
  fullAddress: z.string()
    .min(10, 'Địa chỉ tối thiểu 10 ký tự')
    .max(200, 'Địa chỉ tối đa 200 ký tự'),
  district: z.string().min(1, 'Quận/huyện là bắt buộc'),
  city: z.string().min(1, 'Tỉnh/thành phố là bắt buộc'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional().default(false)
});

// Service request schema
export const serviceRequestSchema = z.object({
  serviceId: idSchema,
  addressId: idSchema,
  description: z.string()
    .min(10, 'Mô tả tối thiểu 10 ký tự')
    .max(1000, 'Mô tả tối đa 1000 ký tự'),
  urgency: ServiceUrgency,
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  additionalNotes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional()
});

// Service post schema (customer posts for technicians to bid)
export const servicePostSchema = z.object({
  title: z.string()
    .min(10, 'Tiêu đề tối thiểu 10 ký tự')
    .max(100, 'Tiêu đề tối đa 100 ký tự'),
  description: z.string()
    .min(20, 'Mô tả tối thiểu 20 ký tự')
    .max(1000, 'Mô tả tối đa 1000 ký tự'),
  serviceId: idSchema,
  addressId: idSchema,
  budget: z.number()
    .min(10000, 'Ngân sách tối thiểu 10,000 VNĐ')
    .max(50000000, 'Ngân sách tối đa 50,000,000 VNĐ'),
  urgency: ServiceUrgency,
  preferredDate: z.string().optional(),
  images: z.array(z.string().url()).max(5, 'Tối đa 5 hình ảnh').optional()
});

// Consultation schema (technician's response to service post)
export const consultationSchema = z.object({
  servicePostId: idSchema,
  price: z.number()
    .min(10000, 'Giá tối thiểu 10,000 VNĐ')
    .max(50000000, 'Giá tối đa 50,000,000 VNĐ'),
  description: z.string()
    .min(20, 'Mô tả tối thiểu 20 ký tự')
    .max(1000, 'Mô tả tối đa 1000 ký tự'),
  estimatedDuration: z.number()
    .min(30, 'Thời gian ước tính tối thiểu 30 phút')
    .max(1440, 'Thời gian ước tính tối đa 24 giờ'),
  availableDate: z.string().min(1, 'Ngày có thể làm là bắt buộc')
});

// Payment schema
export const paymentSchema = z.object({
  serviceRequestId: idSchema,
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOMO', 'VNPAY']),
  notes: z.string().max(200, 'Ghi chú tối đa 200 ký tự').optional()
});

// Chat message schema
export const chatMessageSchema = z.object({
  conversationId: idSchema,
  content: z.string()
    .min(1, 'Tin nhắn không được rỗng')
    .max(1000, 'Tin nhắn tối đa 1000 ký tự'),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT')
});

// Review schema
export const reviewSchema = z.object({
  serviceRequestId: idSchema,
  rating: z.number()
    .min(1, 'Đánh giá tối thiểu 1 sao')
    .max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string()
    .min(10, 'Nhận xét tối thiểu 10 ký tự')
    .max(500, 'Nhận xét tối đa 500 ký tự'),
  isPublic: z.boolean().default(true)
});

// API Response schemas
export const userSchema = z.object({
  id: idSchema,
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  role: UserRole,
  avatar: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const serviceSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string(),
  basePrice: z.number(),
  category: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const serviceRequestResponseSchema = z.object({
  id: idSchema,
  description: z.string(),
  urgency: ServiceUrgency,
  status: ServiceRequestStatus,
  totalPrice: z.number().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  customer: userSchema,
  technician: userSchema.optional(),
  service: serviceSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

// Type exports
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterCustomerData = z.infer<typeof registerCustomerSchema>;
export type RegisterTechnicianData = z.infer<typeof registerTechnicianSchema>;
export type CustomerProfileData = z.infer<typeof customerProfileSchema>;
export type TechnicianProfileData = z.infer<typeof technicianProfileSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type ServiceRequestData = z.infer<typeof serviceRequestSchema>;
export type ServicePostData = z.infer<typeof servicePostSchema>;
export type ConsultationData = z.infer<typeof consultationSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type UserData = z.infer<typeof userSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
export type ServiceRequestResponse = z.infer<typeof serviceRequestResponseSchema>;
