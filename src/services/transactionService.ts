
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
