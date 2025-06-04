
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

export interface LoanData {
  _id: string;
  applicationNumber: string;
  uhid: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'draft' | 'submitted' | 'under_review' | 'completed';
  currentStep?: number;
  
  // Personal Information
  personalInfo?: {
    fullName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    secondaryPhone?: string;
    email: string;
    homeAddress: string;
    city: string;
    state: string;
    zipCode: string;
    nationalId?: string;
    maritalStatus?: string;
    dependents?: string;
    citizenshipStatus?: string;
    languagePreference?: string;
  };

  // Employment and Income Information
  employmentInfo?: {
    employerName?: string;
    employerAddress?: string;
    occupation?: string;
    employmentStatus?: string;
    startDate?: Date;
    monthlyGrossIncome?: number;
    additionalIncome?: string;
    unemploymentBenefits?: boolean;
    totalHouseholdIncome?: number;
    householdMembersInfo?: string;
    incomeFluctuation?: string;
  };

  loanDetails: {
    requestedAmount: number;
    approvedAmount?: number;
    purpose: string;
    interestRate?: number;
    tenure?: number;
    preferredTerm?: number;
    repaymentMethod?: string;
    hospitalName?: string;
    purposeOfLoan?: string;
  };
  
  applicantInfo: {
    employmentType: string;
    monthlyIncome: number;
    existingLoans: boolean;
  };
  
  medicalInfo?: {
    treatmentRequired: string;
    hospitalName?: string;
    doctorName?: string;
    estimatedCost?: number;
    medicalProvider?: string;
    treatmentStarted?: boolean;
    insuranceCoverage?: number;
    insuranceProvider?: string;
    policyNumber?: string;
    healthPlanCovered?: boolean;
    appliedFinancialAssistance?: boolean;
    preExistingConditions?: string;
    outstandingMedicalDebt?: string;
  };
  
  documents: {
    panCard?: string;
    aadhaarCard?: string;
    incomeProof?: string;
    bankStatement?: string;
    medicalDocuments?: string;
  } | string[];
  
  submissionDate?: string;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  completionDate?: string;
  transactionId?: string;
  monthlyPayment?: number;
  remainingBalance?: number;
  nextEmiDate?: string;
  rejectionReason?: string;
  
  // Additional fields from backend model
  creditScore?: number;
  maxEligibleAmount?: number;
  agreementSigned?: boolean;
  nachMandateSigned?: boolean;
  termsAccepted?: boolean;
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

export interface EmiScheduleItem {
  emiNumber: number;
  dueDate: string;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  balanceAfterPayment: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
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

// Fetch patient loans (alias for getUserLoans)
export const fetchPatientLoans = async (uhid: string): Promise<LoanData[]> => {
  try {
    return await apiRequest(`/loans/user/${uhid}`);
  } catch (error) {
    console.error('Failed to fetch patient loans:', error);
    return [];
  }
};

// Get loan by ID
export const getLoanById = async (loanId: string) => {
  return apiRequest(`/loans/${loanId}`);
};

// Get all loans (admin)
export const getAllLoans = async (): Promise<LoanData[]> => {
  return apiRequest('/loans');
};

// Fetch all loans (alias for getAllLoans)
export const fetchAllLoans = async (): Promise<LoanData[]> => {
  return getAllLoans();
};

// Update loan status (admin)
export const updateLoanStatus = async (loanId: string, status: string, additionalData?: any) => {
  return apiRequest(`/loans/${loanId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, ...additionalData })
  });
};

// Save loan draft
export const saveLoanDraft = async (loanData: Partial<LoanData>) => {
  return apiRequest('/loans/draft', {
    method: 'POST',
    body: JSON.stringify(loanData)
  });
};

// Submit loan application
export const submitLoanApplication = async (loanData: Partial<LoanData>) => {
  return apiRequest('/loans/submit', {
    method: 'POST',
    body: JSON.stringify(loanData)
  });
};

// Get credit score
export const getCreditScore = async (uhid: string) => {
  try {
    return await apiRequest(`/loans/credit-score/${uhid}`);
  } catch (error) {
    console.error('Failed to fetch credit score:', error);
    // Return mock data for demo
    return {
      creditScore: Math.floor(Math.random() * 300) + 650, // 650-950
      maxEligibleAmount: Math.floor(Math.random() * 500000) + 100000, // 100k-600k
      interestRate: Math.floor(Math.random() * 5) + 8, // 8-13%
      grade: 'Good',
      factors: ['Payment history', 'Credit utilization', 'Length of credit history']
    };
  }
};

// Pay EMI
export const payEmi = async (loanId: string, amount: number, paymentMethod: string) => {
  return apiRequest(`/loans/${loanId}/pay-emi`, {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod })
  });
};

// Get EMI schedule
export const getEmiSchedule = async (loanId: string) => {
  try {
    return await apiRequest(`/loans/${loanId}/emi-schedule`);
  } catch (error) {
    console.error('Failed to fetch EMI schedule:', error);
    // Return mock data for demo
    return {
      schedule: [] as EmiScheduleItem[]
    };
  }
};
