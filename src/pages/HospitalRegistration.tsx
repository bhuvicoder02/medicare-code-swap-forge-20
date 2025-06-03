import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { registerHospital } from '@/services/hospitalService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    specialties: [] as string[],
    services: [] as string[],
    hospitalType: 'private' as 'government' | 'private' | 'nonprofit',
    bedCount: '',
    registrationNumber: '',
    website: '',
    description: '',
    establishedYear: '',
    emergencyServices: true
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const specialtyOptions = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
    'Dermatology', 'Psychiatry', 'Radiology', 'Pathology', 'General Medicine',
    'Surgery', 'Emergency Medicine', 'Anesthesiology', 'Oncology'
  ];

  const serviceOptions = [
    'Emergency Services', 'ICU', 'Operation Theater', 'Diagnostic Services',
    'Pharmacy', 'Blood Bank', 'Physiotherapy', 'Dialysis', 'Ambulance',
    'Laboratory', 'Radiology', 'Cafeteria', 'Parking'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'hospitalType') {
      setFormData(prev => ({ ...prev, [name]: value as 'government' | 'private' | 'nonprofit' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name: 'specialties' | 'services', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        toast({
          title: "Validation Error",
          description: "Please fill out all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.contactPerson || !formData.contactEmail || !formData.contactPhone) {
        toast({
          title: "Validation Error",
          description: "Please fill out all contact information",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hospitalData = {
        ...formData,
        bedCount: parseInt(formData.bedCount) || 0,
        establishedYear: parseInt(formData.establishedYear) || undefined
      };

      const response = await registerHospital(hospitalData);

      toast({
        title: "Registration Successful",
        description: "Your hospital has been registered successfully! Your registration is pending approval.",
      });

      // Redirect to dashboard or login
      if (authState.user?.role === 'hospital') {
        navigate('/hospital-dashboard');
      } else {
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Hospital registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering your hospital. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Hospital Registration</h1>
          
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex justify-between items-center relative">
              <div className={`w-1/4 text-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 mx-auto flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
                <p className="mt-2">Basic Information</p>
              </div>
              <div className={`w-1/4 text-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 mx-auto flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
                <p className="mt-2">Contact Details</p>
              </div>
              <div className={`w-1/4 text-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 mx-auto flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
                <p className="mt-2">Services & Specialties</p>
              </div>
              <div className={`w-1/4 text-center ${step >= 4 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 mx-auto flex items-center justify-center ${step >= 4 ? 'bg-primary text-white' : 'bg-gray-200'}`}>4</div>
                <p className="mt-2">Review & Submit</p>
              </div>
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Contact Details'}
                {step === 3 && 'Services & Specialties'}
                {step === 4 && 'Review and Submit'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Please provide the basic information about your hospital.'}
                {step === 2 && 'Please provide contact information for your hospital.'}
                {step === 3 && 'Select the specialties and services your hospital offers.'}
                {step === 4 && 'Review your information and submit your registration.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Hospital Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Zip Code *</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospitalType">Hospital Type</Label>
                        <Select value={formData.hospitalType} onValueChange={(value) => handleSelectChange('hospitalType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="nonprofit">Non-Profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone *</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bedCount">Bed Count</Label>
                        <Input
                          id="bedCount"
                          name="bedCount"
                          type="number"
                          value={formData.bedCount}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Specialties</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {specialtyOptions.map((specialty) => (
                          <div key={specialty} className="flex items-center space-x-2">
                            <Checkbox
                              id={specialty}
                              checked={formData.specialties.includes(specialty)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('specialties', specialty, checked as boolean)
                              }
                            />
                            <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Services</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {serviceOptions.map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={service}
                              checked={formData.services.includes(service)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('services', service, checked as boolean)
                              }
                            />
                            <Label htmlFor={service} className="text-sm">{service}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Hospital Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Brief description of your hospital..."
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Hospital Information Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>Name:</strong> {formData.name}</p>
                          <p><strong>Type:</strong> {formData.hospitalType}</p>
                          <p><strong>Contact Person:</strong> {formData.contactPerson}</p>
                          <p><strong>Email:</strong> {formData.contactEmail}</p>
                          <p><strong>Phone:</strong> {formData.contactPhone}</p>
                        </div>
                        <div>
                          <p><strong>Address:</strong> {formData.address}</p>
                          <p><strong>City:</strong> {formData.city}, {formData.state}</p>
                          <p><strong>Zip Code:</strong> {formData.zipCode}</p>
                          <p><strong>Bed Count:</strong> {formData.bedCount || 'Not specified'}</p>
                          <p><strong>Registration #:</strong> {formData.registrationNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      {formData.specialties.length > 0 && (
                        <div className="mt-4">
                          <p><strong>Specialties:</strong> {formData.specialties.join(', ')}</p>
                        </div>
                      )}
                      {formData.services.length > 0 && (
                        <div className="mt-2">
                          <p><strong>Services:</strong> {formData.services.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={nextStep} className="ml-auto">
                  Next
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="ml-auto"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HospitalRegistration;
