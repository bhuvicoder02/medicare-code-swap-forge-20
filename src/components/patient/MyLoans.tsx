
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, FileText, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/services/api';
import KycCompletion from './KycCompletion';
import LoanApplicationDialog from './LoanApplicationDialog';

interface Loan {
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
}

const MyLoans = () => {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>('');
  const [uhid, setUhid] = useState<string>('');
  const [kycData, setKycData] = useState<any>(null);
  const [showKycCompletion, setShowKycCompletion] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);

  useEffect(() => {
    fetchKycStatus();
    fetchLoans();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const response = await apiRequest('/kyc/status');
      setKycStatus(response.kycStatus);
      setUhid(response.uhid || '');
      setKycData(response.kycData);
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await apiRequest('/loans');
      setLoans(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKycComplete = (newUhid: string) => {
    setUhid(newUhid);
    setKycStatus('completed');
    setShowKycCompletion(false);
    toast({
      title: "KYC Completed",
      description: "You can now apply for loans",
    });
  };

  const handleLoanApplicationSuccess = () => {
    fetchLoans();
    toast({
      title: "Application Submitted",
      description: "Your loan application has been submitted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading loans...</div>;
  }

  if (kycStatus !== 'completed') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              KYC Verification Required
            </CardTitle>
            <CardDescription>
              Complete your KYC verification to apply for loans and get your unique UHID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowKycCompletion(true)}>
              Complete KYC Verification
            </Button>
          </CardContent>
        </Card>

        {showKycCompletion && (
          <KycCompletion onComplete={handleKycComplete} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KYC Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            KYC Verified
          </CardTitle>
          <CardDescription>
            Your UHID: <span className="font-mono font-semibold">{uhid}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowLoanApplication(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Apply for New Loan
          </Button>
        </CardContent>
      </Card>

      {/* Loans List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Loans
          </CardTitle>
          <CardDescription>
            Track your loan applications and manage existing loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-mono text-sm">
                      {loan.applicationNumber}
                    </TableCell>
                    <TableCell>{loan.medicalInfo?.treatmentRequired || 'N/A'}</TableCell>
                    <TableCell>
                      ₹{loan.loanDetails?.requestedAmount?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(loan.applicationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No loan applications found</p>
              <Button onClick={() => setShowLoanApplication(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Apply for Your First Loan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Application Dialog */}
      <LoanApplicationDialog
        open={showLoanApplication}
        onOpenChange={setShowLoanApplication}
        onSuccess={handleLoanApplicationSuccess}
        uhid={uhid}
        kycData={kycData}
      />
    </div>
  );
};

export default MyLoans;
