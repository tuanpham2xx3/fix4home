import { apiClient, ApiResponse } from '../api-client';
import { PaymentData } from '../schemas';

// Payment response types
export interface PaymentMethod {
  id: number;
  type: 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY';
  name: string;
  description: string;
  isActive: boolean;
  icon?: string;
  config?: Record<string, any>;
}

export interface Payment {
  id: number;
  serviceRequestId: number;
  amount: number;
  paymentMethod: PaymentMethod['type'];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  transactionId?: string;
  notes?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  serviceRequest: {
    id: number;
    description: string;
    service: {
      name: string;
    };
    customer: {
      id: number;
      fullName: string;
    };
    technician?: {
      id: number;
      fullName: string;
    };
  };
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  monthlyStats: {
    month: string;
    totalAmount: number;
    totalCount: number;
  }[];
  paymentMethodStats: {
    method: string;
    count: number;
    amount: number;
  }[];
}

// Payment API
export const paymentsAPI = {
  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    return apiClient.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
  },

  /**
   * Create a payment
   */
  createPayment: async (data: PaymentData): Promise<ApiResponse<{
    payment: Payment;
    paymentUrl?: string; // For online payment methods
    qrCode?: string; // For QR code payments
  }>> => {
    return apiClient.post<ApiResponse<any>>('/payments', data);
  },

  /**
   * Get payment by ID
   */
  getPayment: async (id: number): Promise<ApiResponse<Payment>> => {
    return apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
  },

  /**
   * Get my payments (customer)
   */
  getMyPayments: async (
    page = 1,
    limit = 20,
    status?: Payment['status']
  ): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }
    
    return apiClient.get<ApiResponse<any>>(`/payments/my?${params.toString()}`);
  },

  /**
   * Get payments I've received (technician)
   */
  getReceivedPayments: async (
    page = 1,
    limit = 20,
    status?: Payment['status']
  ): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }
    
    return apiClient.get<ApiResponse<any>>(`/payments/received?${params.toString()}`);
  },

  /**
   * Update payment status (mainly for admin)
   */
  updatePaymentStatus: async (
    id: number,
    status: Payment['status'],
    notes?: string
  ): Promise<ApiResponse<Payment>> => {
    return apiClient.put<ApiResponse<Payment>>(`/payments/${id}/status`, {
      status,
      notes
    });
  },

  /**
   * Cancel payment (if still pending)
   */
  cancelPayment: async (id: number, reason?: string): Promise<ApiResponse<Payment>> => {
    return apiClient.put<ApiResponse<Payment>>(`/payments/${id}/cancel`, {
      reason
    });
  },

  /**
   * Request refund
   */
  requestRefund: async (id: number, reason: string): Promise<ApiResponse<{
    refundRequest: {
      id: number;
      paymentId: number;
      reason: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      requestedAt: string;
    };
  }>> => {
    return apiClient.post<ApiResponse<any>>(`/payments/${id}/refund`, {
      reason
    });
  },

  /**
   * Process refund (admin)
   */
  processRefund: async (
    paymentId: number,
    amount: number,
    notes?: string
  ): Promise<ApiResponse<Payment>> => {
    return apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/process-refund`, {
      amount,
      notes
    });
  },

  /**
   * Verify payment callback (for external payment gateways)
   */
  verifyPayment: async (transactionId: string, paymentMethod: string): Promise<ApiResponse<{
    verified: boolean;
    payment?: Payment;
  }>> => {
    return apiClient.post<ApiResponse<any>>('/payments/verify', {
      transactionId,
      paymentMethod
    });
  },

  /**
   * Get payment statistics (customer)
   */
  getMyPaymentStats: async (): Promise<ApiResponse<PaymentStats>> => {
    return apiClient.get<ApiResponse<PaymentStats>>('/payments/my/stats');
  },

  /**
   * Get earnings statistics (technician)
   */
  getEarningsStats: async (): Promise<ApiResponse<PaymentStats>> => {
    return apiClient.get<ApiResponse<PaymentStats>>('/payments/earnings/stats');
  },

  /**
   * Download payment receipt
   */
  downloadReceipt: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/payments/${id}/receipt`, {
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Download payment invoice
   */
  downloadInvoice: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/payments/${id}/invoice`, {
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Get payment history export
   */
  exportPaymentHistory: async (
    startDate: string,
    endDate: string,
    format: 'CSV' | 'PDF' | 'EXCEL' = 'CSV'
  ): Promise<Blob> => {
    const response = await apiClient.get('/payments/export', {
      params: {
        startDate,
        endDate,
        format
      },
      responseType: 'blob'
    });
    return response;
  }
};

// Utilities for payment handling
export const paymentUtils = {
  /**
   * Format payment amount
   */
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  /**
   * Get payment status color
   */
  getStatusColor: (status: Payment['status']): string => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
      case 'PROCESSING':
        return 'yellow';
      case 'FAILED':
      case 'CANCELLED':
        return 'red';
      case 'REFUNDED':
        return 'blue';
      default:
        return 'gray';
    }
  },

  /**
   * Get payment method display name
   */
  getPaymentMethodName: (method: PaymentMethod['type']): string => {
    switch (method) {
      case 'CASH':
        return 'Tiền mặt';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'MOMO':
        return 'Ví MoMo';
      case 'VNPAY':
        return 'VNPay';
      default:
        return method;
    }
  },

  /**
   * Calculate service fee (if applicable)
   */
  calculateServiceFee: (amount: number, feePercentage: number = 0.03): number => {
    return Math.round(amount * feePercentage);
  },

  /**
   * Calculate total amount including fees
   */
  calculateTotalAmount: (amount: number, feePercentage: number = 0.03): number => {
    return amount + paymentUtils.calculateServiceFee(amount, feePercentage);
  }
};

export default paymentsAPI;
