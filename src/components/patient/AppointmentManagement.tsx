import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Delete, Edit, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchPatientAppointments, cancelAppointment } from "@/services/appointmentService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BookAppointmentDialog from "./BookAppointmentDialogue"; // Import the new dialog component
import { Appointment } from "@/types/app.types";

const AppointmentManagement = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bookDialogOpen, setBookDialogOpen] = useState(false); // State for book dialog

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        if (authState.user?.id) {
          const data = await fetchPatientAppointments(authState.user.id);
          setAppointments(data);
        } else {
          console.error("User ID not available");
          setAppointments([]);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [authState.user, toast]);

  const handleBookAppointment = () => {
    setBookDialogOpen(true); // Open the dialog
  };

  const handleAppointmentBooked = (newAppointment: Appointment) => {
    setAppointments((prev) => [...prev, newAppointment]); // Add new appointment to list
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span>;
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" /> Pending</span>;
      case "cancelled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      case "completed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelAppointment(selectedAppointment.id, cancelReason);
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment.id
          ? { ...apt, status: "cancelled" as const }
          : apt
      ));
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Appointments</h2>
        <Button onClick={handleBookAppointment}>Book New Appointment</Button>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Calendar className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any appointments scheduled yet. Book your first appointment now.
            </p>
            <Button onClick={handleBookAppointment}>Book an Appointment</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className={appointment.status === "cancelled" ? "opacity-75" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{appointment.doctorName}</CardTitle>
                    <CardDescription>{appointment.specialty} • {appointment.hospitalName}</CardDescription>
                  </div>
                  <div>{getStatusBadge(appointment.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{appointment.hospitalName}</span>
                  </div>
                  {appointment.reason && (
                    <div>
                      <p className="text-sm font-medium mt-4">Reason for Visit:</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" /> Reschedule
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleCancelClick(appointment)}
                    >
                      <Delete className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment with {selectedAppointment?.doctorName} on {selectedAppointment?.date} at {selectedAppointment?.time}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookAppointmentDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
        onAppointmentBooked={handleAppointmentBooked}
      />
    </div>
  );
};

export default AppointmentManagement;