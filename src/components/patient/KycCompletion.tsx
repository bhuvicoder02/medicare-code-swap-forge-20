import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Check, User, Calendar, MapPin, Shield, Loader2 } from 'lucide-react';
import { completeKycVerification, verifyWithDigio, DigioKycData } from '@/services/kycService';

interface KycCompletionProps {
  onComplete: (uhid: string) => void;
}

const KycCompletion = ({ onComplete }: KycCompletionProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'digio' | 'complete'>('form');
  const [formData, setFormData] = useState<DigioKycData>({
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    maritalStatus: '',
    dependents: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDigioVerification = async () => {
    setIsVerifying(true);
    setVerificationStep('digio');

    try {
      const verificationResult = await verifyWithDigio(formData);
      
      if (verificationResult.verified) {
        toast({
          title: "Identity Verified",
          description: "Your identity has been successfully verified with Digio.",
        });
        
        // Proceed to complete KYC
        await completeKycSubmission();
      } else {
        throw new Error('Identity verification failed');
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify identity. Please check your details and try again.",
        variant: "destructive"
      });
      setVerificationStep('form');
    } finally {
      setIsVerifying(false);
    }
  };

  const completeKycSubmission = async () => {
    setIsSubmitting(true);

    try {
      const response = await completeKycVerification(formData);

      if (response.success) {
        setVerificationStep('complete');
        toast({
          title: "KYC Completed Successfully",
          description: `Your UHID is: ${response.uhid}`,
        });

        setTimeout(() => {
          onComplete(response.uhid || '');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "KYC Submission Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
      setVerificationStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDigioVerification();
  };

  if (verificationStep === 'digio') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verifying with Digio
          </CardTitle>
          <CardDescription>
            Please wait while we verify your identity through Digio's secure platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center py-8">
          <Loader2 className="h-12 w-12 text-brand-600 animate-spin mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Identity Verification in Progress</h4>
          <p className="text-gray-600 text-center">
            We're securely verifying your PAN and Aadhaar details through Digio.
            This process usually takes 30-60 seconds.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (verificationStep === 'complete') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            KYC Completed Successfully
          </CardTitle>
          <CardDescription>
            Your identity has been verified and UHID has been generated
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Verification Complete!</h4>
          <p className="text-gray-600 text-center">
            You can now apply for health cards and loans. Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Complete KYC Verification with Digio
        </CardTitle>
        <CardDescription>
          Complete your KYC to get your unique UHID and access health services
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="panNumber">PAN Number *</Label>
              <Input
                id="panNumber"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                placeholder="ABCDE1234F"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
              <Input
                id="aadhaarNumber"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012"
                required
                maxLength={12}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Complete address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => handleSelectChange('maritalStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dependents">Number of Dependents</Label>
              <Input
                id="dependents"
                name="dependents"
                type="number"
                value={formData.dependents}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Verification with Digio</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your documents will be verified through Digio's secure platform. This ensures 
                  the highest level of security and authenticity for your KYC process.
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || isVerifying}
          >
            {isSubmitting || isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying with Digio...
              </>
            ) : (
              <>
                Verify with Digio & Complete KYC
                <Shield className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default KycCompletion;
