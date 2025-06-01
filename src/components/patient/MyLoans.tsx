
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, FileText, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchPatientLoans, LoanData } from '@/services/loanService';
import KycCompletion from './KycCompletion';
import LoanApplicationDialog from './LoanApplicationDialog';

const MyLoans = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>('');
  const [uhid, setUhid] = useState<string>('');
  const [kycData, setKycData] = useState<any>(null);
  const [showKycCompletion, setShowKycCompletion] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);

  useEffect(() => {
    if (authState.user) {
      // Get KYC status and UHID from user data
      const userData = authState.user as any;
      setKycStatus(userData.kycStatus || '');
      setUhid(userData.uhid || '');
      setKycData(userData.kycData || null);
      
      // Fetch loans if KYC is completed
      if (userData.kycStatus === 'completed' && userData.uhid) {
        fetchLoans(userData.uhid);
      } else {
        setLoading(false);
      }
    }
  }, [authState.user]);

  const fetchLoans = async (userUhid: string) => {
    try {
      setLoading(true);
      const loansData = await fetchPatientLoans(userUhid);
      setLoans(loansData);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch loans. Please try again.",
        variant: "destructive",
      });
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
    if (uhid) {
      fetchLoans(uhid);
    }
    setShowLoanApplication(false);
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
                      {loan.loanDetails?.approvedAmount && loan.status === 'approved' && (
                        <div className="text-sm text-green-600">
                          Approved: ₹{loan.loanDetails.approvedAmount.toLocaleString()}
                        </div>
                      )}
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
