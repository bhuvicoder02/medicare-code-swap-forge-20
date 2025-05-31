import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { bookAppointment } from "@/services/appointmentService";
import { Appointment, Doctor } from "@/types/app.types";
import { mockHospitals, mockDoctors } from "@/services/mockData";

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentBooked: (newAppointment: Appointment) => void;
}

const BookAppointmentDialog = ({ open, onOpenChange, onAppointmentBooked }: BookAppointmentDialogProps) => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [formData, setFormData] = useState({
    hospitalId: "",
    doctorId: "",
    specialty: "",
    date: "",
    time: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [doctorAvailability, setDoctorAvailability] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update available doctors and specialties when hospital changes
  useEffect(() => {
    if (formData.hospitalId) {
      const selectedHospital = mockHospitals.find((h) => h.id === formData.hospitalId);
      if (selectedHospital) {
        setAvailableSpecialties(selectedHospital.specialties);
        const doctors = mockDoctors.filter((d) => d.hospitalId === formData.hospitalId);
        setAvailableDoctors(doctors);
      } else {
        setAvailableSpecialties([]);
        setAvailableDoctors([]);
      }
      setFormData((prev) => ({ ...prev, doctorId: "", specialty: "", date: "", time: "" }));
      setAvailableTimeSlots([]);
      setDoctorAvailability([]);
    }
  }, [formData.hospitalId]);

  // Update specialty and availability when doctor changes
  useEffect(() => {
    if (formData.doctorId) {
      const selectedDoctor = mockDoctors.find((d) => d.id === formData.doctorId);
      if (selectedDoctor) {
        setFormData((prev) => ({ ...prev, specialty: selectedDoctor.specialty }));
        setDoctorAvailability(selectedDoctor.availability);
      } else {
        setDoctorAvailability([]);
      }
      setFormData((prev) => ({ ...prev, date: "", time: "" }));
      setAvailableTimeSlots([]);
    }
  }, [formData.doctorId]);

  // Generate time slots when date changes
  useEffect(() => {
    if (formData.doctorId && formData.date) {
      const selectedDoctor = mockDoctors.find((d) => d.id === formData.doctorId);
      if (selectedDoctor) {
        const selectedDate = new Date(formData.date);
        const dayOfWeek = selectedDate.toLocaleString("en-US", { weekday: "long" });
        const matchingSlot = selectedDoctor.availability.find((slot) =>
          slot.startsWith(dayOfWeek)
        );
        if (matchingSlot) {
          const [, timeRange] = matchingSlot.split(": ");
          const [startTime, endTime] = timeRange.split(" - ");
          const timeSlots = generateTimeSlots(startTime, endTime);
          setAvailableTimeSlots(timeSlots);
        } else {
          setAvailableTimeSlots([]);
          setErrors((prev) => ({
            ...prev,
            date: `Doctor is not available on ${dayOfWeek}`,
          }));
        }
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [formData.doctorId, formData.date]);

  // Helper function to generate time slots in 30-minute intervals
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const timeSlots: string[] = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    let current = start;

    while (current <= end) {
      timeSlots.push(formatTime(current));
      current = new Date(current.getTime() + 30 * 60 * 1000); // Add 30 minutes
    }

    return timeSlots;
  };

  // Parse time string (supports both "9AM"/"2PM" and "HH:MM" formats)
  const parseTime = (timeStr: string): Date => {
    const date = new Date();
    date.setSeconds(0, 0); // Clear seconds and milliseconds

    // Handle 12-hour format with AM/PM (e.g., "9AM", "2PM")
    const amPmMatch = timeStr.match(/(\d+)(AM|PM)/);
    if (amPmMatch) {
      const [, hours, period] = amPmMatch;
      let hour = parseInt(hours);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      date.setHours(hour, 0);
      return date;
    }

    // Handle 24-hour format (e.g., "11:30")
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const [, hours, minutes] = timeMatch;
      date.setHours(parseInt(hours), parseInt(minutes));
      return date;
    }

    throw new Error(`Invalid time format: ${timeStr}`);
  };

  // Format Date object to time string (e.g., "09:00" or "14:30")
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.hospitalId) newErrors.hospitalId = "Please select a hospital";
    if (!formData.doctorId) newErrors.doctorId = "Please select a doctor";
    if (!formData.date) newErrors.date = "Please select a date";
    if (!formData.time) newErrors.time = "Please select a time";
    if (!formData.reason.trim()) newErrors.reason = "Please provide a reason for the visit";

    // Validate date and time against doctor's availability
    if (formData.doctorId && formData.date && formData.time) {
      const selectedDoctor = mockDoctors.find((d) => d.id === formData.doctorId);
      if (selectedDoctor) {
        const selectedDate = new Date(formData.date);
        const dayOfWeek = selectedDate.toLocaleString("en-US", { weekday: "long" });
        const isAvailable = selectedDoctor.availability.some((slot) => {
          const [day, timeRange] = slot.split(": ");
          const [startTime, endTime] = timeRange.split(" - ");
          const selectedTime = parseTime(formData.time);
          const start = parseTime(startTime);
          const end = parseTime(endTime);
          return (
            day === dayOfWeek &&
            selectedTime.getTime() >= start.getTime() &&
            selectedTime.getTime() <= end.getTime()
          );
        });
        if (!isAvailable) {
          newErrors.time = `Doctor is not available on ${dayOfWeek} at ${formData.time}`;
        }
        // Ensure date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.date = "Date must be in the future";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated. Please log in.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedHospital = mockHospitals.find((h) => h.id === formData.hospitalId);
      const selectedDoctor = mockDoctors.find((d) => d.id === formData.doctorId);

      const appointmentData: Appointment = {
        patientName: `${authState.user.firstName} ${authState.user.lastName}`,
        patientId: authState.user.id,
        hospitalName: selectedHospital?.name || "",
        hospitalId: formData.hospitalId,
        doctorName: selectedDoctor?.name || "",
        specialty: formData.specialty,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: "confirmed",
        notes: "",
      };

      const newAppointment = await bookAppointment(appointmentData);
      onAppointmentBooked(newAppointment);
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been booked successfully.",
      });
      setFormData({
        hospitalId: "",
        doctorId: "",
        specialty: "",
        date: "",
        time: "",
        reason: "",
      });
      setErrors({});
      setAvailableTimeSlots([]);
      setDoctorAvailability([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogDescription>Fill in the details to schedule a new appointment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalId">Hospital</Label>
            <Select
              name="hospitalId"
              onValueChange={(value) => handleSelectChange("hospitalId", value)}
              value={formData.hospitalId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a hospital" />
              </SelectTrigger>
              <SelectContent>
                {mockHospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hospitalId && <p className="text-sm text-red-500">{errors.hospitalId}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor</Label>
            <Select
              name="doctorId"
              onValueChange={(value) => handleSelectChange("doctorId", value)}
              value={formData.doctorId}
              disabled={!formData.hospitalId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {availableDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctorId && <p className="text-sm text-red-500">{errors.doctorId}</p>}
          </div>
          <div className="space-y-2">
            <Label>Doctor Availability</Label>
            {doctorAvailability.length > 0 ? (
              <ul className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {doctorAvailability.map((slot, index) => (
                  <li key={index} className="list-disc ml-4">
                    {slot}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {formData.doctorId
                  ? "No availability information available"
                  : "Select a doctor to view availability"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              name="specialty"
              value={formData.specialty}
              readOnly
              placeholder="Select a doctor to set specialty"
            />
            {errors.specialty && <p className="text-sm text-red-500">{errors.specialty}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Select
              name="time"
              onValueChange={(value) => handleSelectChange("time", value)}
              value={formData.time}
              disabled={!formData.date || availableTimeSlots.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
            {!errors.time && availableTimeSlots.length === 0 && formData.date && (
              <p className="text-sm text-red-500">No time slots available for the selected date</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Describe the reason for your visit"
            />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentDialog;