
import { apiRequest } from './api';

export interface LoanApplication {
  uhid: string;
  loanAmount: number;
  purpose: string;
  employmentType: string;
  monthlyIncome: number;
  existingLoans: boolean;
  collateralType?: string;
  guarantorDetails?: {
    name: string;
    relationship: string;
    contact: string;
  };
}

export interface Loan {
  _id: string;
  applicationNumber: string;
  uhid: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  loanDetails: {
    requestedAmount: number;
    approvedAmount?: number;
    purpose: string;
    interestRate?: number;
    tenure?: number;
  };
  applicantInfo: {
    employmentType: string;
    monthlyIncome: number;
    existingLoans: boolean;
  };
  documents: string[];
  submissionDate: string;
  approvalDate?: string;
  disbursementDate?: string;
}

// Apply for a loan
export const applyForLoan = async (loanData: LoanApplication) => {
  return apiRequest('/loans/apply', {
    method: 'POST',
    body: JSON.stringify(loanData)
  });
};

// Get user's loans by UHID
export const getUserLoans = async (uhid: string): Promise<Loan[]> => {
  return apiRequest(`/loans/user/${uhid}`);
};

// Get loan by ID
export const getLoanById = async (loanId: string) => {
  return apiRequest(`/loans/${loanId}`);
};

// Get all loans (admin)
export const getAllLoans = async () => {
  return apiRequest('/loans');
};

// Update loan status (admin)
export const updateLoanStatus = async (loanId: string, status: string, approvedAmount?: number) => {
  return apiRequest(`/loans/${loanId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, approvedAmount })
  });
};
