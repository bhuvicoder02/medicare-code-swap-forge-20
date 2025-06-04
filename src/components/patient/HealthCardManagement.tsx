
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Plus, Ban, Clock, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { processPaymentWithFallback, PaymentMethod } from "@/services/mockPaymentService";
import { 
  getUserHealthCards, 
  applyForHealthCard, 
  topUpHealthCard, 
  transferLoanToHealthCard,
  getHealthCardTransactions,
  HealthCardTopUp 
} from "@/services/healthCardService";
import { getUserLoans } from "@/services/loanService";

const HealthCardManagement = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  
  // State management
  const [healthCards, setHealthCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoans, setUserLoans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Dialog states
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [loanTransferDialogOpen, setLoanTransferDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Form states
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'silver' | 'gold' | 'platinum'>('basic');
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [selectedCard, setSelectedCard] = useState("");

  const planDetails = {
    basic: { credit: 25000, features: ['Basic medical coverage', 'Emergency services'] },
    silver: { credit: 50000, features: ['Enhanced coverage', 'Specialist consultations', 'Preventive care'] },
    gold: { credit: 100000, features: ['Premium coverage', 'Advanced diagnostics', 'Surgery coverage'] },
    platinum: { credit: 200000, features: ['Comprehensive coverage', 'International treatment', 'VIP services'] }
  };

  useEffect(() => {
    if (authState.user) {
      fetchData();
    }
  }, [authState.user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch health cards
      const cardsData = await getUserHealthCards();
      setHealthCards(cardsData || []);
      
      // Fetch user loans (approved ones for transfer)
      if (authState.user?.uhid) {
        const loansData = await getUserLoans(authState.user.uhid);
        const approvedLoans = loansData.filter((loan: any) => loan.status === 'approved');
        setUserLoans(approvedLoans);
      }
      
      // Fetch transactions for active card
      if (cardsData && cardsData.length > 0) {
        const activeCard = cardsData.find((card: any) => card.status === 'active');
        if (activeCard) {
          const transactionsData = await getHealthCardTransactions(activeCard._id);
          setTransactions(transactionsData || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load health card information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForCard = async () => {
    if (!authState.user?.uhid) {
      toast({
        title: "KYC Required",
        description: "Please complete your KYC verification first.",
        variant: "destructive"
      });
      return;
    }

    if (authState.user.kycStatus !== 'completed') {
      toast({
        title: "KYC Incomplete",
        description: "Your KYC verification must be completed before applying for a health card.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessingPayment(true);
      
      const application = {
        uhid: authState.user.uhid,
        planType: selectedPlan,
        initialCredit: planDetails[selectedPlan].credit
      };

      await applyForHealthCard(application);
      
      setApplyDialogOpen(false);
      await fetchData();
      
      toast({
        title: "Application Submitted",
        description: "Your health card application has been submitted for admin approval.",
      });
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleTopUp = async () => {
    if (!selectedCard || !topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please select a card and enter a valid amount.",
      });
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const topUpData: HealthCardTopUp = {
        cardId: selectedCard,
        amount: parseFloat(topUpAmount),
        paymentMethod
      };
      
      await topUpHealthCard(topUpData);
      
      setTopUpDialogOpen(false);
      setTopUpAmount("");
      await fetchData();
      
      toast({
        title: "Top-up Successful",
        description: `₹${parseFloat(topUpAmount).toLocaleString()} has been added to your health card.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Top-up Failed",
        description: error.message || "Unable to process your payment. Please try again.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleLoanTransfer = async () => {
    if (!selectedLoan || !selectedCard) {
      toast({
        variant: "destructive",
        title: "Invalid Selection",
        description: "Please select both a loan and a health card.",
      });
      return;
    }

    try {
      setProcessingPayment(true);
      
      await transferLoanToHealthCard(selectedLoan, selectedCard);
      
      setLoanTransferDialogOpen(false);
      setSelectedLoan("");
      await fetchData();
      
      toast({
        title: "Transfer Successful",
        description: "Loan amount has been transferred to your health card.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "Failed to transfer loan amount. Please try again.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "expired":
        return <Ban className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "expired":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading health cards...</span>
      </div>
    );
  }

  const activeCard = healthCards.find(card => card.status === 'active');
  const pendingCard = healthCards.find(card => card.status === 'pending');

  return (
    <div className="space-y-6">
      {/* No Cards - Show Application */}
      {healthCards.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Apply for Health Card
            </CardTitle>
            <CardDescription>
              Get instant access to healthcare financing with your Rimedicare Health Card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Health Card Found</h3>
              <p className="text-gray-600 mb-4">
                Apply for a health card to access instant healthcare financing
              </p>
              <Button onClick={() => setApplyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Health Card
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Card Notice */}
      {pendingCard && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Application Under Review</AlertTitle>
          <AlertDescription>
            Your health card application is pending admin approval. You'll be notified once it's processed.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Health Card */}
      {activeCard && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">Rimedicare Health Card</h3>
                <p className="text-brand-100 capitalize">{activeCard.planType} Plan</p>
              </div>
              <CreditCard className="h-8 w-8" />
            </div>
            <p className="mt-6 font-mono text-lg">{activeCard.cardNumber}</p>
            <div className="mt-4 flex justify-between">
              <div>
                <p className="text-xs text-brand-100">VALID THRU</p>
                <p>{new Date(activeCard.expiryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-brand-100">STATUS</p>
                <div className="flex items-center gap-1">
                  {getStatusIcon(activeCard.status)}
                  <span className="capitalize">{activeCard.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{activeCard.availableCredit?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Used Credit</p>
                <p className="text-2xl font-bold text-red-600">₹{activeCard.usedCredit?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={() => { setSelectedCard(activeCard._id); setTopUpDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Top-up Balance
            </Button>
            {userLoans.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => { setSelectedCard(activeCard._id); setLoanTransferDialogOpen(true); }}
              >
                Transfer Loan Amount
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Action Buttons */}
      {activeCard && (
        <div className="flex gap-4">
          <Button onClick={() => setApplyDialogOpen(true)} variant="outline">
            Upgrade Plan
          </Button>
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'topup' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for Health Card</DialogTitle>
            <DialogDescription>
              Choose a plan that suits your healthcare needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Label>Select Plan</Label>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan as any}>
              {Object.entries(planDetails).map(([plan, details]) => (
                <div key={plan} className="flex items-center space-x-2 p-4 border rounded">
                  <RadioGroupItem value={plan} id={plan} />
                  <div className="flex-1">
                    <Label htmlFor={plan} className="capitalize font-medium">{plan} Plan</Label>
                    <p className="text-sm text-gray-500">Credit Limit: ₹{details.credit.toLocaleString()}</p>
                    <ul className="text-xs text-gray-400 mt-1">
                      {details.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyForCard} disabled={processingPayment}>
              {processingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Apply for Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top-up Dialog */}
      <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top-up Health Card</DialogTitle>
            <DialogDescription>Add funds to your health card</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
              />
            </div>
            
            <div>
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="net_banking" id="net_banking" />
                  <Label htmlFor="net_banking">Net Banking</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTopUp} disabled={processingPayment || !topUpAmount}>
              {processingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pay Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loan Transfer Dialog */}
      <Dialog open={loanTransferDialogOpen} onOpenChange={setLoanTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Loan to Health Card</DialogTitle>
            <DialogDescription>Transfer approved loan amount to your health card</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Approved Loan</Label>
              <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan" />
                </SelectTrigger>
                <SelectContent>
                  {userLoans.map((loan) => (
                    <SelectItem key={loan._id} value={loan._id}>
                      {loan.applicationNumber} - ₹{loan.loanDetails.approvedAmount?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLoanTransfer} disabled={processingPayment || !selectedLoan}>
              {processingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Transfer Amount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthCardManagement;
