
import { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, CreditCard, FileText, Clock, Eye } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getHospitalPatients } from "@/services/hospitalService";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Patient {
  id: string;
  uhid: string;
  name: string;
  email: string;
  phone: string;
  loanId: string;
  applicationNumber: string;
  loanAmount: number;
  status: string;
  kycStatus: string;
  lastVisit: string;
}

const PatientManagement = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you'd get the hospital ID from the authenticated user's hospital
    // For now, we'll use a mock hospital ID or get it from user data
    if (authState.user) {
      // Assuming the user has a hospitalId or we can derive it
      setHospitalId("675040b87ba22c9fcf5f2b5e"); // Mock hospital ID
      fetchPatients("675040b87ba22c9fcf5f2b5e");
    }
  }, [authState.user]);

  const fetchPatients = async (hospitalId: string) => {
    try {
      setLoading(true);
      const patientsData = await getHospitalPatients(hospitalId);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patients. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'approved': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-orange-100 text-orange-800',
      'rejected': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getKycStatusBadge = (status: string) => {
    const statusColors = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleViewPatient = (patient: Patient) => {
    toast({
      title: "Patient Details",
      description: `Viewing details for ${patient.name} (UHID: ${patient.uhid})`,
    });
  };

  const handleVerifyCard = (patient: Patient) => {
    toast({
      title: "Card Verification",
      description: `Verifying health card for ${patient.name}`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>Loading patients...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Patient Management</CardTitle>
            <CardDescription>
              Manage patients with active loans and health cards
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search patients by name, UHID, application number or phone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredPatients.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UHID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Application #</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Loan Status</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.uhid}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell className="text-xs">
                        {patient.phone}<br/>
                        {patient.email}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{patient.applicationNumber}</TableCell>
                      <TableCell>₹{patient.loanAmount?.toLocaleString() || 0}</TableCell>
                      <TableCell>{getStatusBadge(patient.status)}</TableCell>
                      <TableCell>{getKycStatusBadge(patient.kycStatus)}</TableCell>
                      <TableCell>{new Date(patient.lastVisit).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewPatient(patient)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleVerifyCard(patient)}
                            title="Verify Card"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Treatment History"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <p className="text-muted-foreground">
                {searchTerm ? 'No patients found matching your search.' : 'No patients found for this hospital.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {patients.length}
              </div>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {patients.filter(p => p.status === 'approved' || p.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Active Loans</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {patients.filter(p => p.kycStatus === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">KYC Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{patients.reduce((sum, p) => sum + (p.loanAmount || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Loan Amount</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientManagement;
