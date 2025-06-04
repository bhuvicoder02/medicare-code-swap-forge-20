
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import PatientSidebar from "@/components/patient/PatientSidebar";
import PatientDashboardHeader from "@/components/patient/PatientDashboardHeader";
import PatientDashboardOverview from "@/components/patient/PatientDashboardOverview";
import HealthCardManagement from "@/components/patient/HealthCardManagement";
import HospitalVisits from "@/components/patient/HospitalVisits";
import LoanManagement from "@/components/patient/LoanManagement";
import ProfileSettings from "@/components/patient/ProfileSettings";
import AppointmentManagement from "@/components/patient/AppointmentManagement";
import KycCompletion from "@/components/patient/KycCompletion";
import SidebarWrapper from "@/components/SidebarWrapper";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { authState, signOut, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Extract tab from URL query parameters
  const query = new URLSearchParams(location.search);
  const activeTab = query.get("tab") || "overview";

  // Handle tab change
  const handleTabChange = (value: string) => {
    navigate(value === "overview" ? "/patient-dashboard" : `/patient-dashboard?tab=${value}`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "Latest data has been loaded successfully.",
        duration: 3000,
      });
    }, 1500);
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: `${activeTab} data is being exported to Excel.`,
      duration: 3000,
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  // Handle KYC completion
  const handleKycComplete = async (uhid: string) => {
    await refreshUser();
    toast({
      title: "KYC Completed",
      description: `Your UHID ${uhid} has been generated successfully.`,
    });
  };
  
  // Map of tab values to their display names
  const tabTitles: Record<string, string> = {
    "overview": "Dashboard Overview",
    "healthcard": "Health Card Management",
    "appointments": "My Appointments",
    "hospitals": "Hospital Visits",
    "loans": "Loan Management",
    "settings": "Profile Settings",
    "kyc": "KYC Verification",
  };

  // Mock patient data for ProfileSettings
  const patientData = {
    patientName: authState.user?.firstName ? `${authState.user.firstName} ${authState.user.lastName}` : "Patient User",
    patientId: authState.user?.id || "P12345",
    email: authState.user?.email || "patient@example.com",
    healthCardId: "HC-" + (authState.user?.id || "12345").substring(0, 6)
  };

  // Show KYC completion if not completed
  if (authState.user?.kycStatus !== 'completed') {
    return (
      <SidebarWrapper>
        <PatientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 overflow-auto">
          <PatientDashboardHeader
            patientName={authState.user?.firstName ? `${authState.user.firstName} ${authState.user.lastName}` : "Patient"}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />
          
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Complete Your KYC Verification</h1>
              <p className="text-gray-600 mt-2">
                Please complete your KYC verification to access all features including health cards and loans.
              </p>
            </div>
            
            <KycCompletion onComplete={handleKycComplete} />
          </main>
        </div>
        <Toaster />
      </SidebarWrapper>
    );
  }

  return (
    <SidebarWrapper>
      <PatientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 overflow-auto">
        <PatientDashboardHeader
          patientName={authState.user?.firstName ? `${authState.user.firstName} ${authState.user.lastName}` : "Patient"}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
        
        <main className="p-6">
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">{tabTitles[activeTab] || "Dashboard"}</h1>
              {authState.user?.uhid && (
                <p className="text-sm text-gray-600 mt-1">UHID: {authState.user.uhid}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
              
              {activeTab !== "settings" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              )}
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-white border overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="healthcard">Health Card</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="hospitals">Hospital Visits</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <PatientDashboardOverview />
            </TabsContent>
            
            <TabsContent value="healthcard" className="mt-6">
              <HealthCardManagement />
            </TabsContent>
            
            <TabsContent value="appointments" className="mt-6">
              <AppointmentManagement />
            </TabsContent>
            
            <TabsContent value="hospitals" className="mt-6">
              <HospitalVisits />
            </TabsContent>
            
            <TabsContent value="loans" className="mt-6">
              <LoanManagement />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <ProfileSettings patientData={patientData} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </SidebarWrapper>
  );
};

export default PatientDashboard;
