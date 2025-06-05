
import { apiRequest } from './api';

export interface HealthCard {
  _id: string;
  cardNumber: string;
  user: string;
  uhid?: string;
  availableCredit: number;
  usedCredit: number;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  issueDate: string;
  expiryDate: string;
  cardType?: 'basic' | 'premium' | 'ricare_discount';
  discountPercentage?: number;
  monthlyLimit?: number;
}

export interface HealthCardApplication {
  cardType: 'basic' | 'premium' | 'ricare_discount';
  requestedCreditLimit: number;
  medicalHistory?: string;
  monthlyIncome: number;
  employmentStatus: string;
}

export const fetchUserHealthCards = async (): Promise<HealthCard[]> => {
  try {
    console.log('Fetching user health cards');
    const response = await apiRequest('/health-cards');
    return response || [];
  } catch (error) {
    console.error('Failed to fetch health cards:', error);
    throw error;
  }
};

export const applyForHealthCard = async (application: HealthCardApplication): Promise<HealthCard> => {
  try {
    console.log('Applying for health card:', application);
    const response = await apiRequest('/health-cards/apply', {
      method: 'POST',
      body: JSON.stringify(application)
    });
    return response;
  } catch (error) {
    console.error('Failed to apply for health card:', error);
    throw error;
  }
};

export const topUpHealthCard = async (cardId: string, amount: number, paymentMethod: string = 'online'): Promise<any> => {
  try {
    console.log('Topping up health card:', { cardId, amount, paymentMethod });
    const response = await apiRequest(`/health-cards/${cardId}/topup`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod })
    });
    return response;
  } catch (error) {
    console.error('Failed to top up health card:', error);
    throw error;
  }
};

export const getHealthCardById = async (cardId: string): Promise<HealthCard> => {
  try {
    console.log('Fetching health card by ID:', cardId);
    const response = await apiRequest(`/health-cards/${cardId}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch health card:', error);
    throw error;
  }
};
