
import { apiRequest } from './api';

export interface LoanData {
  _id: string;
  applicationNumber: string;
  status: string;
  loanDetails: {
    requestedAmount: number;
    approvedAmount?: number;
    preferredTerm: number;
    interestRate?: number;
  };
  medicalInfo: {
    treatmentRequired: string;
  };
  applicationDate: string;
  approvalDate?: string;
  rejectionReason?: string;
  monthlyPayment?: number;
  remainingBalance?: number;
  uhid: string;
}

export const fetchPatientLoans = async (uhid: string): Promise<LoanData[]> => {
  try {
    console.log('Fetching loans for UHID:', uhid);
    const response = await apiRequest(`/loans/by-uhid/${uhid}`);
    return response || [];
  } catch (error) {
    console.error('Failed to fetch patient loans:', error);
    throw error;
  }
};

export const fetchAllLoans = async (): Promise<LoanData[]> => {
  try {
    console.log('Fetching all loans for admin');
    const response = await apiRequest('/loans');
    return response || [];
  } catch (error) {
    console.error('Failed to fetch all loans:', error);
    throw error;
  }
};

export const updateLoanStatus = async (
  loanId: string, 
  status: string, 
  data?: {
    rejectionReason?: string;
    approvedAmount?: number;
    interestRate?: number;
    term?: number;
  }
) => {
  try {
    console.log('Updating loan status:', { loanId, status, data });
    const response = await apiRequest(`/loans/${loanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        ...data
      })
    });
    return response;
  } catch (error) {
    console.error('Failed to update loan status:', error);
    throw error;
  }
};
