
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'healthcard' | 'loan' | 'card';

export interface PaymentRequest {
  amount: number;
  method?: PaymentMethod;
  description?: string;
  patientId?: string;
  hospitalId?: string;
  paymentMethod?: PaymentMethod;
  metadata?: any;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  message?: string;
  timestamp?: string;
  status?: string;
}

// Mock payment processing service
export const processPaymentWithFallback = async (
  paymentData: PaymentRequest
): Promise<PaymentResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate payment success/failure
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'Payment failed. Please try again.'
    };
  }
};

// Process payment function for appointments and other services
export const processPayment = async (paymentData: {
  amount: number;
  currency?: string;
  method: string;
  description?: string;
  user_id?: string;
}): Promise<PaymentResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate payment success/failure
  const success = Math.random() > 0.15; // 85% success rate
  
  if (success) {
    return {
      success: true,
      transactionId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Payment processed successfully',
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
  } else {
    return {
      success: false,
      error: 'Payment processing failed',
      message: 'Please try again or use a different payment method'
    };
  }
};
