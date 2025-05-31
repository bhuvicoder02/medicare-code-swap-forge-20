
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/services/api';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  departments: string[];
  doctors: {
    name: string;
    specialty: string;
    experience: string;
    qualifications: string[];
    availability: string[];
  }[];
  facilities: string[];
  emergencyContact: string;
  website?: string;
  rating: number;
}

interface Doctor {
  name: string;
  specialty: string;
  experience: string;
  qualifications: string[];
  availability: string[];
}

interface AppointmentForm {
  patientName: string;
  patientId: string;
  hospitalName: string;
  hospitalId: string;
  doctorName: string;
  specialty: string;
  date: Date | undefined;
  time: string;
  reason: string;
  notes: string;
}

interface BookAppointmentDialogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitals: Hospital[];
  onSuccess: () => void;
}

const BookAppointmentDialogue = ({ open, onOpenChange, hospitals, onSuccess }: BookAppointmentDialogueProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<AppointmentForm>({
    patientName: '',
    patientId: '',
    hospitalName: '',
    hospitalId: '',
    doctorName: '',
    specialty: '',
    date: undefined,
    time: '',
    reason: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];

  const resetForm = () => {
    setStep(1);
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setFormData({
      patientName: '',
      patientId: '',
      hospitalName: '',
      hospitalId: '',
      doctorName: '',
      specialty: '',
      date: undefined,
      time: '',
      reason: '',
      notes: ''
    });
    setIsSubmitting(false);
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setFormData(prev => ({
      ...prev,
      hospitalName: hospital.name,
      hospitalId: hospital._id
    }));
    setStep(2);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData(prev => ({
      ...prev,
      doctorName: doctor.name,
      specialty: doctor.specialty
    }));
    setStep(3);
  };

  const handleInputChange = (field: keyof AppointmentForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 3:
        return formData.patientName && formData.patientId && formData.date && formData.time;
      case 4:
        return formData.reason;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        id: `APT${Date.now()}`, // Generate unique ID
        patientName: formData.patientName,
        patientId: formData.patientId,
        hospitalName: formData.hospitalName,
        hospitalId: formData.hospitalId,
        doctorName: formData.doctorName,
        specialty: formData.specialty,
        date: formData.date ? format(formData.date, 'yyyy-MM-dd') : '',
        time: formData.time,
        reason: formData.reason,
        status: 'confirmed' as const,
        notes: formData.notes
      };

      // Here you would make an API call to book the appointment
      // For now, we'll simulate the booking
      console.log('Booking appointment:', appointmentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Appointment Booked Successfully",
        description: `Your appointment with Dr. ${formData.doctorName} has been confirmed for ${format(formData.date!, 'PPP')} at ${formData.time}`,
      });

      onSuccess();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Hospital</h3>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {hospitals.map((hospital) => (
                <Card key={hospital._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleHospitalSelect(hospital)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <Badge variant="secondary">{hospital.rating}/5</Badge>
                    </div>
                    <CardDescription>{hospital.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {hospital.departments.slice(0, 3).map((dept, index) => (
                        <Badge key={index} variant="outline">{dept}</Badge>
                      ))}
                      {hospital.departments.length > 3 && (
                        <Badge variant="outline">+{hospital.departments.length - 3} more</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Doctor</h3>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Change Hospital
              </Button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedHospital?.name}</p>
              <p className="text-sm text-gray-600">{selectedHospital?.address}</p>
            </div>
            <div className="grid gap-4 max-h-80 overflow-y-auto">
              {selectedHospital?.doctors.map((doctor, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDoctorSelect(doctor)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialty} • {doctor.experience}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {doctor.qualifications.map((qual, idx) => (
                          <Badge key={idx} variant="outline">{qual}</Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Available:</strong> {doctor.availability.join(', ')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Appointment Details</h3>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                Change Doctor
              </Button>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Dr. {selectedDoctor?.name}</p>
              <p className="text-sm text-gray-600">{selectedDoctor?.specialty} at {selectedHospital?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID *</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Appointment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Appointment Time *</Label>
              <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Describe the reason for your appointment"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special requests"
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirm Appointment</h3>
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient</Label>
                  <p className="font-medium">{formData.patientName}</p>
                  <p className="text-sm text-gray-600">ID: {formData.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Doctor</Label>
                  <p className="font-medium">Dr. {formData.doctorName}</p>
                  <p className="text-sm text-gray-600">{formData.specialty}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Hospital</Label>
                <p className="font-medium">{formData.hospitalName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date</Label>
                  <p className="font-medium">{formData.date ? format(formData.date, 'PPP') : ''}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Time</Label>
                  <p className="font-medium">{formData.time}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Reason</Label>
                <p className="font-medium">{formData.reason}</p>
              </div>
              
              {formData.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="font-medium">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Step {step} of 5: {step === 1 ? 'Select Hospital' : step === 2 ? 'Choose Doctor' : step === 3 ? 'Appointment Details' : step === 4 ? 'Additional Information' : 'Confirm Booking'}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-brand-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {renderStepContent()}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          
          <div className="ml-auto">
            {step < 5 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentDialogue;
