
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'net_banking';

export interface PaymentRequest {
  amount: number;
  method: PaymentMethod;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
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
