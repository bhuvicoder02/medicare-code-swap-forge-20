
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Plus, Ban, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processPaymentWithFallback, PaymentMethod } from "@/services/mockPaymentService";

const HealthCardManagement = () => {
  const { toast } = useToast();
  
  // Mock health card data
  const [healthCard, setHealthCard] = useState({
    cardNumber: "HC-1234-5678-9012",
    balance: 15000,
    status: "Active",
    expiryDate: "31/12/2025",
    activationDate: "01/01/2023",
    planType: "Gold",
    monthlyLimit: 20000,
  });
  
  // Dialog states
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  
  // Transaction history
  const [transactions] = useState([
    {
      id: "TRX001",
      date: "2023-05-02",
      type: "Payment",
      description: "Apollo Hospitals - Consultation",
      amount: 1500,
    },
    {
      id: "TRX002",
      date: "2023-05-15",
      type: "Top-up",
      description: "Health Card Recharge",
      amount: 5000,
    },
    {
      id: "TRX003",
      date: "2023-05-22",
      type: "Payment",
      description: "MedPlus Pharmacy",
      amount: 1200,
    },
    {
      id: "TRX004",
      date: "2023-06-05",
      type: "Payment",
      description: "LifeCare Diagnostics - Blood Test",
      amount: 2500,
    },
    {
      id: "TRX005",
      date: "2023-06-18",
      type: "Top-up",
      description: "Health Card Recharge",
      amount: 10000,
    }
  ]);
  
  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to top up your health card.",
      });
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const amount = parseFloat(topUpAmount);
      
      const paymentResult = await processPaymentWithFallback({
        amount,
        description: `Health Card Top-up (${healthCard.cardNumber})`,
        paymentMethod,
        metadata: {
          cardNumber: healthCard.cardNumber,
          planType: healthCard.planType
        }
      });
      
      if (paymentResult && paymentResult.success) {
        // Update health card balance
        setHealthCard({
          ...healthCard,
          balance: healthCard.balance + amount
        });
        
        setTopUpDialogOpen(false);
        setTopUpAmount("");
        
        toast({
          title: "Top-up Successful",
          description: `₹${amount.toLocaleString()} has been added to your health card.`,
        });
      }
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
  
  const handleRenewCard = () => {
    toast({
      title: "Card Renewal",
      description: "Your card has been submitted for renewal. We will notify you once processed.",
    });
  };
  
  const handleFreezeCard = () => {
    toast({
      title: "Card Freeze Request",
      description: "Your request to freeze the card has been submitted.",
    });
  };
  
  // Status color based on card status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Inactive":
        return "text-gray-500";
      case "Expired":
        return "text-red-600";
      case "Frozen":
        return "text-blue-600";
      default:
        return "text-gray-500";
    }
  };
  
  // Status icon based on card status
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Inactive":
        return <Ban className="h-5 w-5 text-gray-500" />;
      case "Expired":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "Frozen":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Card Details */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white">
          <div className="flex justify-between">
            <div>
              <h3 className="text-xl font-semibold">Rimedicare Health Card</h3>
              <p className="text-brand-100">{healthCard.planType} Plan</p>
            </div>
            <CreditCard className="h-8 w-8" />
          </div>
          <p className="mt-6 font-mono text-lg">{healthCard.cardNumber}</p>
          <div className="mt-4 flex justify-between">
            <div>
              <p className="text-xs text-brand-100">VALID THRU</p>
              <p>{healthCard.expiryDate}</p>
            </div>
            <div>
              <p className="text-xs text-brand-100">STATUS</p>
              <div className="flex items-center gap-1">
                <StatusIcon status={healthCard.status} />
                <span className={getStatusColor(healthCard.status)}>{healthCard.status}</span>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">₹{healthCard.balance.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Limit</p>
              <p className="text-2xl font-bold">₹{healthCard.monthlyLimit.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Activation Date</p>
              <p className="text-2xl font-bold">{healthCard.activationDate}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={() => setTopUpDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Top-up Balance
          </Button>
          <Button variant="outline" onClick={handleRenewCard}>Renew Card</Button>
          <Button variant="outline" onClick={handleFreezeCard}>Freeze Card</Button>
        </CardFooter>
      </Card>
      
      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent transactions with your health card</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Transaction ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b">
                    <td className="py-3 px-4 text-sm font-medium">{tx.id}</td>
                    <td className="py-3 px-4 text-sm">{tx.date}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === "Top-up" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{tx.description}</td>
                    <td className={`py-3 px-4 text-sm font-medium text-right ${
                      tx.type === "Top-up" ? "text-green-600" : ""
                    }`}>
                      {tx.type === "Top-up" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto">View All Transactions</Button>
        </CardFooter>
      </Card>
      
      {/* Top-up Dialog */}
      <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Top-up Health Card</DialogTitle>
            <DialogDescription>
              Add funds to your health card to use for medical expenses
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="top-up-amount">Amount (₹)</Label>
              <Input
                id="top-up-amount"
                placeholder="Enter amount"
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
              {topUpAmount && parseFloat(topUpAmount) < 500 && (
                <p className="text-sm text-red-500">Minimum top-up amount is ₹500</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
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
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Funds will be immediately available in your health card after successful payment.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTopUp} 
              disabled={processingPayment || !topUpAmount || parseFloat(topUpAmount) < 500}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthCardManagement;
