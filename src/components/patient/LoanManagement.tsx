
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Calendar, Bell, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  processPaymentWithFallback, 
  PaymentMethod 
} from "@/services/mockPaymentService";

const LoanManagement = () => {
  const { toast } = useToast();
  
  // Dialog states
  const [payEmiDialogOpen, setPayEmiDialogOpen] = useState(false);
  const [prepayDialogOpen, setPrepayDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [prepayAmount, setPrepayAmount] = useState("");
  const [isFullPrepay, setIsFullPrepay] = useState(false);

  // Mock data
  const loanDetails = {
    loanId: "LOAN-123456",
    totalLoanAmount: 50000,
    remainingBalance: 35000,
    interestRate: "12%",
    loanTerm: "24 months",
    emiAmount: 2500,
    nextPaymentDue: "15/12/2023",
    startDate: "15/01/2023",
    endDate: "15/12/2024",
  };

  const emiHistory = [
    { 
      emiNumber: 11, 
      dueDate: "15/11/2023", 
      amount: 2500, 
      principal: 1800, 
      interest: 700, 
      status: "Paid", 
      paymentDate: "14/11/2023" 
    },
    { 
      emiNumber: 10, 
      dueDate: "15/10/2023", 
      amount: 2500, 
      principal: 1780, 
      interest: 720, 
      status: "Paid", 
      paymentDate: "15/10/2023" 
    },
    { 
      emiNumber: 9, 
      dueDate: "15/09/2023", 
      amount: 2500, 
      principal: 1760, 
      interest: 740, 
      status: "Paid", 
      paymentDate: "13/09/2023" 
    },
    { 
      emiNumber: 8, 
      dueDate: "15/08/2023", 
      amount: 2500, 
      principal: 1740, 
      interest: 760, 
      status: "Paid", 
      paymentDate: "15/08/2023" 
    },
  ];

  const handlePayEMI = async () => {
    setProcessingPayment(true);
    
    try {
      const paymentResult = await processPaymentWithFallback({
        amount: loanDetails.emiAmount,
        description: `EMI Payment for Loan ${loanDetails.loanId}`,
        paymentMethod,
        metadata: {
          loanId: loanDetails.loanId,
          emiNumber: 12,
          dueDate: loanDetails.nextPaymentDue
        }
      });
      
      if (paymentResult && paymentResult.success) {
        setPayEmiDialogOpen(false);
        toast({
          title: "EMI Payment Successful",
          description: `Transaction ID: ${paymentResult.transactionId}`,
        });
        
        // In a real app, we would update the loan state from the API
        // For demo, we'll just show a success message
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Unable to process your EMI payment.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrepayLoan = async () => {
    if (!prepayAmount && !isFullPrepay) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid prepayment amount.",
      });
      return;
    }
    
    const amount = isFullPrepay ? loanDetails.remainingBalance : Number(prepayAmount);
    
    if (!isFullPrepay && (amount <= 0 || amount > loanDetails.remainingBalance)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: `Amount must be between 1 and ${loanDetails.remainingBalance}`,
      });
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const paymentResult = await processPaymentWithFallback({
        amount,
        description: isFullPrepay 
          ? `Full Prepayment for Loan ${loanDetails.loanId}` 
          : `Partial Prepayment for Loan ${loanDetails.loanId}`,
        paymentMethod,
        metadata: {
          loanId: loanDetails.loanId,
          prepaymentType: isFullPrepay ? 'full' : 'partial'
        }
      });
      
      if (paymentResult && paymentResult.success) {
        setPrepayDialogOpen(false);
        setPrepayAmount("");
        setIsFullPrepay(false);
        
        toast({
          title: "Prepayment Successful",
          description: `Transaction ID: ${paymentResult.transactionId}`,
        });
        
        // In a real app, we would update the loan state from the API
        // For demo, we'll just show a success message
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Unable to process your prepayment.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadStatement = () => {
    toast({
      title: "Loan Statement",
      description: "Your loan statement is being downloaded.",
    });
  };

  const handleSetReminder = () => {
    toast({
      title: "Payment Reminder",
      description: "We'll remind you 3 days before your EMI due date.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Your active medical loan</CardDescription>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Loan Amount</p>
              <p className="text-2xl font-bold">₹{loanDetails.totalLoanAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
              <p className="text-2xl font-bold">₹{loanDetails.remainingBalance.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
              <p className="text-2xl font-bold">₹{loanDetails.emiAmount.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Loan ID</p>
              <p className="font-medium">{loanDetails.loanId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="font-medium">{loanDetails.interestRate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Term</p>
              <p className="font-medium">{loanDetails.loanTerm}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Payment Due</p>
              <p className="font-medium text-amber-600">{loanDetails.nextPaymentDue}</p>
            </div>
          </div>
          
          <div className="relative pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${((loanDetails.totalLoanAmount - loanDetails.remainingBalance) / loanDetails.totalLoanAmount) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You've paid {Math.round(((loanDetails.totalLoanAmount - loanDetails.remainingBalance) / loanDetails.totalLoanAmount) * 100)}% of your total loan amount
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={() => setPayEmiDialogOpen(true)}>Pay EMI Now</Button>
          <Button variant="outline" onClick={() => setPrepayDialogOpen(true)}>Prepay Loan</Button>
          <Button variant="outline" onClick={handleDownloadStatement}>
            <Download className="mr-2 h-4 w-4" />
            Loan Statement
          </Button>
          <Button variant="outline" onClick={handleSetReminder}>
            <Bell className="mr-2 h-4 w-4" />
            Set Reminder
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EMI Payment History</CardTitle>
          <CardDescription>View your past EMI payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EMI #</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emiHistory.map((emi) => (
                <TableRow key={emi.emiNumber}>
                  <TableCell>{emi.emiNumber}</TableCell>
                  <TableCell>{emi.dueDate}</TableCell>
                  <TableCell>₹{emi.amount.toLocaleString()}</TableCell>
                  <TableCell>₹{emi.principal.toLocaleString()}</TableCell>
                  <TableCell>₹{emi.interest.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {emi.status}
                    </span>
                  </TableCell>
                  <TableCell>{emi.paymentDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto">View Complete History</Button>
        </CardFooter>
      </Card>

      {/* Pay EMI Dialog */}
      <Dialog open={payEmiDialogOpen} onOpenChange={setPayEmiDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay EMI</DialogTitle>
            <DialogDescription>
              Make your monthly EMI payment for Loan {loanDetails.loanId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>EMI Amount</Label>
              <div className="text-lg font-bold">₹{loanDetails.emiAmount.toLocaleString()}</div>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <div>{loanDetails.nextPaymentDue}</div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayEmiDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayEMI} disabled={processingPayment}>
              {processingPayment ? "Processing..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prepay Loan Dialog */}
      <Dialog open={prepayDialogOpen} onOpenChange={setPrepayDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Prepay Loan</DialogTitle>
            <DialogDescription>
              Make a prepayment to reduce your loan tenure or EMI amount
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Outstanding Balance</Label>
              <div className="text-lg font-bold">₹{loanDetails.remainingBalance.toLocaleString()}</div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="full-prepay"
                  checked={isFullPrepay}
                  onChange={(e) => setIsFullPrepay(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="full-prepay">Full Prepayment</Label>
              </div>
            </div>
            
            {!isFullPrepay && (
              <div className="grid gap-2">
                <Label htmlFor="prepay-amount">Prepayment Amount</Label>
                <Input
                  id="prepay-amount"
                  placeholder="Enter amount"
                  type="number"
                  value={prepayAmount}
                  onChange={(e) => setPrepayAmount(e.target.value)}
                  disabled={isFullPrepay}
                />
                {Number(prepayAmount) > loanDetails.remainingBalance && (
                  <p className="text-sm text-red-500">
                    Amount cannot exceed outstanding balance
                  </p>
                )}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card_prepay" />
                  <Label htmlFor="credit_card_prepay">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi_prepay" />
                  <Label htmlFor="upi_prepay">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="net_banking" id="net_banking_prepay" />
                  <Label htmlFor="net_banking_prepay">Net Banking</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrepayDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrepayLoan} 
              disabled={processingPayment || (!isFullPrepay && (!prepayAmount || Number(prepayAmount) <= 0 || Number(prepayAmount) > loanDetails.remainingBalance))}
            >
              {processingPayment ? "Processing..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanManagement;
