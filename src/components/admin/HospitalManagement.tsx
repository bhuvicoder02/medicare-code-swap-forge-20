
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hospital, Check, X, Edit, Search, Eye, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllHospitals, updateHospitalStatus, getHospitalAnalytics } from "@/services/hospitalService";
import { Hospital as HospitalType } from '@/types/app.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HospitalManagement = () => {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<HospitalType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hospitalAnalytics, setHospitalAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const hospitalsData = await getAllHospitals();
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hospitals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalAnalytics = async (hospitalId: string) => {
    try {
      const analytics = await getHospitalAnalytics(hospitalId);
      setHospitalAnalytics(analytics);
    } catch (error) {
      console.error('Failed to fetch hospital analytics:', error);
    }
  };

  const handleViewHospital = (hospital: HospitalType) => {
    setSelectedHospital(hospital);
    if (hospital.id) {
      fetchHospitalAnalytics(hospital.id);
    }
  };

  const handleUpdateStatus = async (hospitalId: string, status: 'active' | 'pending' | 'inactive') => {
    try {
      await updateHospitalStatus(hospitalId, status);
      
      toast({
        title: "Status Updated",
        description: `Hospital status has been updated to ${status}.`,
      });
      
      // Update the hospitals list
      setHospitals(hospitals.map(h => 
        h.id === hospitalId ? { ...h, status } : h
      ));
      
      setSelectedHospital(null);
      setHospitalAnalytics(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update hospital status.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { className: 'bg-green-100 text-green-800', label: 'Active' },
      'pending': { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'inactive': { className: 'bg-red-100 text-red-800', label: 'Inactive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const pendingHospitals = hospitals.filter(h => h.status === 'pending');
  const activeHospitals = hospitals.filter(h => h.status === 'active');
  
  const filteredActiveHospitals = activeHospitals.filter(
    hospital => 
      hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Hospitals...</CardTitle>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Hospitals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Pending Hospital Registrations
              </CardTitle>
              <CardDescription>Review and process hospital registration requests</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {pendingHospitals.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingHospitals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">{hospital.name}</TableCell>
                    <TableCell>{hospital.city}, {hospital.state}</TableCell>
                    <TableCell>{hospital.contactPerson}</TableCell>
                    <TableCell>{new Date(hospital.date || '').toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(hospital.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewHospital(hospital)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        
                        {selectedHospital && selectedHospital.id === hospital.id && (
                          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Hospital Registration Review</DialogTitle>
                              <DialogDescription>
                                Review hospital details and approve or reject registration
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-6 py-4">
                              {/* Basic Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Hospital Name</Label>
                                  <p className="text-sm font-medium">{selectedHospital.name}</p>
                                </div>
                                <div>
                                  <Label>Hospital Type</Label>
                                  <p className="text-sm font-medium capitalize">{selectedHospital.hospitalType}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Address</Label>
                                <p className="text-sm">{selectedHospital.address}</p>
                                <p className="text-sm">{selectedHospital.city}, {selectedHospital.state} - {selectedHospital.zipCode}</p>
                              </div>
                              
                              {/* Contact Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Contact Person</Label>
                                  <p className="text-sm font-medium">{selectedHospital.contactPerson}</p>
                                </div>
                                <div>
                                  <Label>Phone Number</Label>
                                  <p className="text-sm">{selectedHospital.contactPhone}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Email Address</Label>
                                  <p className="text-sm">{selectedHospital.contactEmail}</p>
                                </div>
                                <div>
                                  <Label>Website</Label>
                                  <p className="text-sm">{selectedHospital.website || 'Not provided'}</p>
                                </div>
                              </div>

                              {/* Additional Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Registration Number</Label>
                                  <p className="text-sm">{selectedHospital.registrationNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>Bed Count</Label>
                                  <p className="text-sm">{selectedHospital.bedCount || 'Not specified'}</p>
                                </div>
                              </div>
                              
                              {/* Specialties and Services */}
                              {selectedHospital.specialties && selectedHospital.specialties.length > 0 && (
                                <div>
                                  <Label>Specialties</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedHospital.specialties.map((specialty, index) => (
                                      <Badge key={index} variant="secondary">{specialty}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedHospital.services && selectedHospital.services.length > 0 && (
                                <div>
                                  <Label>Services</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedHospital.services.map((service, index) => (
                                      <Badge key={index} variant="outline">{service}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedHospital.description && (
                                <div>
                                  <Label>Description</Label>
                                  <p className="text-sm">{selectedHospital.description}</p>
                                </div>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <div className="flex gap-2 w-full">
                                <Button 
                                  variant="outline" 
                                  className="flex-1" 
                                  onClick={() => handleUpdateStatus(selectedHospital.id!, 'inactive')}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                                <Button 
                                  className="flex-1" 
                                  onClick={() => handleUpdateStatus(selectedHospital.id!, 'active')}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No pending hospital registrations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Hospitals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Hospitals</CardTitle>
              <CardDescription>Manage registered hospitals on the platform</CardDescription>
            </div>
            <div className="flex items-center w-[240px]">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              <Input 
                placeholder="Search hospitals..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActiveHospitals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActiveHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">{hospital.name}</TableCell>
                    <TableCell>{hospital.city}, {hospital.state}</TableCell>
                    <TableCell>{hospital.contactPerson}</TableCell>
                    <TableCell className="capitalize">{hospital.hospitalType}</TableCell>
                    <TableCell>{getStatusBadge(hospital.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewHospital(hospital)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(hospital.id!, 'inactive')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {searchTerm ? 'No hospitals found matching your search criteria' : 'No active hospitals found'}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <p className="text-sm text-muted-foreground">
              Showing {filteredActiveHospitals.length} of {activeHospitals.length} active hospitals
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HospitalManagement;
