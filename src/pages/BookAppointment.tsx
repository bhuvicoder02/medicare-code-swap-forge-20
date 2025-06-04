import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, Search, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockHospitals, mockDoctors } from "@/services/mockData";
import { bookAppointment } from "@/services/appointmentService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { processPayment } from "@/services/mockPaymentService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Time slots
  const morningSlots = ["09:00 AM", "10:00 AM", "11:00 AM"];
  const afternoonSlots = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
  const eveningSlots = ["05:00 PM", "06:00 PM", "07:00 PM"];

  useEffect(() => {
    // Filter hospitals or doctors based on search query
    if (searchQuery) {
      const results = mockHospitals.filter(
        hospital =>
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.specialties.some(specialty =>
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setSearchResults(results);
    } else {
      setSearchResults(mockHospitals);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Filter doctors by selected hospital
    if (selectedHospital) {
      const doctors = mockDoctors.filter(
        doctor => doctor.hospitalId === selectedHospital.id
      );
      setAvailableDoctors(doctors);
    }
  }, [selectedHospital]);

  // Check if user is logged in
  useEffect(() => {
    if (!authState.user) {
      toast({
        title: "Login Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/book-appointment" } });
    }
  }, [authState.user, navigate, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter hospitals based on search query
    const results = mockHospitals.filter(
      hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setSearchResults(results);
  };

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setStep(2);
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep(3);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    if (!authState.user) {
      toast({
        title: "Login Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      // Process payment first
      const paymentResult = await processPayment({
        amount: 500, // Consultation fee
        currency: "INR",
        method: paymentMethod,
        description: `Appointment with ${selectedDoctor.name} on ${format(selectedDate!, 'PPP')}`,
        user_id: authState.user.id
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Payment failed");
      }

      // Then book appointment
      const appointmentData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        patientId: authState.user.id,
        patientName: `${authState.user.firstName || ""} ${authState.user.lastName || ""}`.trim(),
        date: format(selectedDate!, 'yyyy-MM-dd'),
        time: selectedTimeSlot!,
        reason: reason,
        specialty: selectedDoctor.specialty
      };

      await bookAppointment(appointmentData);

      toast({
        title: "Appointment Booked",
        description: `Your appointment with ${selectedDoctor.name} has been scheduled successfully.`,
        duration: 5000,
      });

      navigate("/patient-dashboard?tab=appointments");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Could not book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Choose a Hospital</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by hospital name or specialty"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {searchResults.length > 0 ? (
                searchResults.map((hospital) => (
                  <Card
                    key={hospital.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleHospitalSelect(hospital)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{hospital.name}</CardTitle>
                      <CardDescription>{hospital.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {hospital.address}
                      </div>
                      <div className="mt-4">
                        <span className="text-sm font-medium">Specialties: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {hospital.specialties.map((specialty: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <span className="flex items-center text-sm">
                        Rating: {hospital.rating}{" "}
                        <span className="text-yellow-500 ml-1">★</span>
                      </span>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-10">
                  <p>No hospitals found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Choose a Doctor</h2>
              <Button variant="outline" onClick={() => setStep(1)}>
                Change Hospital
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-1">{selectedHospital?.name}</h3>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                {selectedHospital?.address}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableDoctors.length > 0 ? (
                availableDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>{doctor.specialty}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Qualification: </span>
                          {doctor.qualification}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Experience: </span>
                          {doctor.experience} years
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Availability: </span>
                          <ul className="list-disc pl-5 mt-1">
                            {doctor.availability.map((time: string, index: number) => (
                              <li key={index}>{time}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <span className="flex items-center text-sm">
                        Rating: {doctor.rating}{" "}
                        <span className="text-yellow-500 ml-1">★</span>
                      </span>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-10">
                  <p>No doctors available at this hospital.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Choose Date & Time</h2>
              <Button variant="outline" onClick={() => setStep(2)}>
                Change Doctor
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-1">
                {selectedDoctor?.name} ({selectedDoctor?.specialty})
              </h3>
              <div className="text-sm">
                <span className="font-medium">Availability: </span>
                <ul className="list-disc pl-5 mt-1">
                  {selectedDoctor?.availability.map((time: string, index: number) => (
                    <li key={index}>{time}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Select Date</h3>
                <div className="border rounded-md">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Disable past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Select Time</h3>
                {selectedDate ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Morning</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {morningSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className="justify-start"
                          >
                            <Clock className="h-3 w-3 mr-1" /> {slot}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Afternoon</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {afternoonSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className="justify-start"
                          >
                            <Clock className="h-3 w-3 mr-1" /> {slot}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Evening</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {eveningSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className="justify-start"
                          >
                            <Clock className="h-3 w-3 mr-1" /> {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Please select a date first</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Appointment Details</h2>
              <Button variant="outline" onClick={() => setStep(3)}>
                Change Date & Time
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
                <CardDescription>
                  Review your appointment details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Doctor Details</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedDoctor?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {selectedDoctor?.specialty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Hospital Details</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div>{selectedHospital?.name}</div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {selectedHospital?.address}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Date & Time</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {selectedDate &&
                            format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedTimeSlot}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Consultation Fee</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-lg font-semibold">₹500</div>
                      <div className="text-xs text-gray-500">
                        (May vary based on actual consultation)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please describe your symptoms or reason for consultation"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="pt-4">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    defaultValue="card"
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="mt-2 space-y-3"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1">
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1">
                        UPI
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="healthcard" id="healthcard" />
                      <Label htmlFor="healthcard" className="flex-1">
                        Health Card
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setIsConfirmDialogOpen(true)}
                >
                  Confirm & Pay ₹500
                </Button>
              </CardFooter>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {renderStepContent()}

        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Appointment</DialogTitle>
              <DialogDescription>
                You're about to book an appointment with {selectedDoctor?.name} on{" "}
                {selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedTimeSlot}.
                A consultation fee of ₹500 will be charged.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmBooking}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm & Pay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default BookAppointment;
