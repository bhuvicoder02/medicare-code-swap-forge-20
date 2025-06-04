
import { apiRequest } from './api';

export interface DigioKycData {
  panNumber: string;
  aadhaarNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  maritalStatus: string;
  dependents: string;
}

export interface KycVerificationResult {
  success: boolean;
  uhid?: string;
  kycStatus: 'pending' | 'completed' | 'rejected';
  message: string;
  verificationId?: string;
}

// Complete KYC verification
export const completeKycVerification = async (kycData: DigioKycData): Promise<KycVerificationResult> => {
  return apiRequest('/kyc/complete', {
    method: 'POST',
    body: JSON.stringify(kycData)
  });
};

// Get KYC status
export const getKycStatus = async () => {
  return apiRequest('/kyc/status');
};

// Verify KYC with Digio (simulation for now)
export const verifyWithDigio = async (kycData: DigioKycData): Promise<{ verified: boolean; verificationId: string }> => {
  // Simulate Digio API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate verification result
  const verified = Math.random() > 0.2; // 80% success rate
  
  return {
    verified,
    verificationId: `DIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};
