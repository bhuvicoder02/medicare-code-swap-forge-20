
import { apiRequest } from './api';

export interface HealthCardApplication {
  uhid: string;
  planType: 'basic' | 'silver' | 'gold' | 'platinum';
  initialCredit?: number;
}

export interface HealthCardTopUp {
  cardId: string;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking';
}

export interface HealthCardTransaction {
  id: string;
  cardId: string;
  type: 'topup' | 'payment' | 'refund';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  balanceAfter: number;
}

// Apply for health card
export const applyForHealthCard = async (application: HealthCardApplication) => {
  return apiRequest('/health-cards/apply', {
    method: 'POST',
    body: JSON.stringify(application)
  });
};

// Get user's health cards
export const getUserHealthCards = async () => {
  return apiRequest('/health-cards');
};

// Get health card by ID
export const getHealthCardById = async (cardId: string) => {
  return apiRequest(`/health-cards/${cardId}`);
};

// Top up health card
export const topUpHealthCard = async (topUpData: HealthCardTopUp) => {
  return apiRequest('/health-cards/topup', {
    method: 'POST',
    body: JSON.stringify(topUpData)
  });
};

// Get health card transactions
export const getHealthCardTransactions = async (cardId: string) => {
  return apiRequest(`/health-cards/${cardId}/transactions`);
};

// Process payment for health card
export const processHealthCardPayment = async (paymentData: {
  cardId: string;
  amount: number;
  hospitalId: string;
  description: string;
}) => {
  return apiRequest('/health-cards/payment', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
};

// Transfer loan amount to health card
export const transferLoanToHealthCard = async (loanId: string, cardId: string) => {
  return apiRequest('/health-cards/transfer-loan', {
    method: 'POST',
    body: JSON.stringify({ loanId, cardId })
  });
};
