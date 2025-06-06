
import { apiRequest } from './api';

export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  type: 'payment' | 'refund' | 'charge';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  hospital?: string;
  date: string;
}

export const fetchUserTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log('Fetching user transactions');
    const response = await apiRequest('/transactions');
    return response || [];
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData: {
  amount: number;
  type: 'payment' | 'refund' | 'charge';
  description: string;
  userId: string;
  hospital?: string;
}): Promise<Transaction> => {
  try {
    console.log('Creating transaction:', transactionData);
    const response = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
    return response;
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
};

export const processHealthCardPayment = async (
  patientId: string,
  amount: number,
  description: string,
  hospital: string
): Promise<Transaction> => {
  try {
    console.log('Processing health card payment:', { patientId, amount, description, hospital });
    const response = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        userId: patientId,
        amount,
        type: 'payment',
        description,
        hospital
      })
    });
    return response;
  } catch (error) {
    console.error('Failed to process health card payment:', error);
    throw error;
  }
};

export const processLoanRequest = async (
  patientId: string,
  amount: number,
  purpose: string,
  tenure: number,
  hospital: string
): Promise<Transaction> => {
  try {
    console.log('Processing loan request:', { patientId, amount, purpose, tenure, hospital });
    const response = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        userId: patientId,
        amount,
        type: 'charge',
        description: `Loan for ${purpose} - ${tenure} months`,
        hospital
      })
    });
    return response;
  } catch (error) {
    console.error('Failed to process loan request:', error);
    throw error;
  }
};

export const processRefund = async (
  transactionId: string,
  amount: number,
  reason: string
): Promise<Transaction> => {
  try {
    console.log('Processing refund:', { transactionId, amount, reason });
    const response = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        type: 'refund',
        description: `Refund: ${reason}`,
        originalTransactionId: transactionId
      })
    });
    return response;
  } catch (error) {
    console.error('Failed to process refund:', error);
    throw error;
  }
};
