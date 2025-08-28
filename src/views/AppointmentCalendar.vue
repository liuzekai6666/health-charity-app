<template>
  <div class="appointment-calendar">
    <FullCalendar :options="calendarOptions" />
    
    <!-- Appointment Modal -->
    <div v-if="showAppointmentModal" class="modal">
      <div class="modal-content">
        <h2>Create New Appointment</h2>
        <form @submit.prevent="handleAppointmentSubmit">
          <div class="form-group">
            <label>Title:</label>
            <input v-model="newAppointment.title" type="text" required placeholder="Enter appointment title" />
          </div>
          
          <div class="form-group">
            <label>Start Time:</label>
            <input v-model="newAppointment.start" type="datetime-local" required />
          </div>
          
          <div class="form-group">
            <label>End Time:</label>
            <input v-model="newAppointment.end" type="datetime-local" required />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Confirm</button>
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
          </div>
        </form>
        
        <p v-if="conflictError" class="error-message">{{ conflictError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Store all appointment data
const appointmentsData = ref([]);
const showAppointmentModal = ref(false);
const newAppointment = ref({ 
  id: null, 
  title: '', 
  start: '', 
  end: '',
  backgroundColor: getRandomColor()
});
const conflictError = ref('');

// Convert data into FullCalendar event format
const calendarEvents = computed(() => {
  return appointmentsData.value.map(appointment => ({
    id: appointment.id.toString(),
    title: appointment.title,
    start: appointment.start,
    end: appointment.end,
    backgroundColor: appointment.backgroundColor,
    extendedProps: {
      originalData: appointment
    }
  }));
});

// Generate random color
function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9A826', '#6A5ACD', '#FF7F50', '#98D8C8', '#F7DC6F'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Check time conflict
function hasTimeConflict(newStart, newEnd, existingAppointments) {
  const newStartTime = new Date(newStart).getTime();
  const newEndTime = new Date(newEnd).getTime();
  
  return existingAppointments.some(appointment => {
    const existingStartTime = new Date(appointment.start).getTime();
    const existingEndTime = new Date(appointment.end).getTime();
    
    return (newStartTime < existingEndTime && newEndTime > existingStartTime);
  });
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: calendarEvents,
  editable: true,
  selectable: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  allDaySlot: false,
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  height: 'auto'
});

// Handle date selection
function handleDateSelect(selectInfo) {
  const start = selectInfo.start;
  const end = selectInfo.end;
  
  newAppointment.value = {
    id: Date.now(),
    title: '',
    start: start.toISOString(),
    end: end.toISOString(),
    backgroundColor: getRandomColor()
  };
  
  const formStart = document.querySelector('input[type="datetime-local"]:first-of-type');
  const formEnd = document.querySelector('input[type="datetime-local"]:last-of-type');
  
  if (formStart && formEnd) {
    formStart.value = start.toISOString().slice(0, 16);
    formEnd.value = end.toISOString().slice(0, 16);
  }
  
  conflictError.value = '';
  showAppointmentModal.value = true;
}

// Handle event click
function handleEventClick(clickInfo) {
  if (confirm('Do you want to delete this appointment?')) {
    const eventId = clickInfo.event.id;
    appointmentsData.value = appointmentsData.value.filter(app => app.id.toString() !== eventId);
  }
}

// Close modal
function closeModal() {
  showAppointmentModal.value = false;
  newAppointment.value = { 
    id: null, 
    title: '', 
    start: '', 
    end: '',
    backgroundColor: getRandomColor()
  };
  conflictError.value = '';
}

// Submit new appointment
function handleAppointmentSubmit() {
  conflictError.value = '';
  
  const startTime = new Date(newAppointment.value.start);
  const endTime = new Date(newAppointment.value.end);
  
  if (endTime <= startTime) {
    conflictError.value = 'End time must be later than start time!';
    return;
  }
  
  if (hasTimeConflict(newAppointment.value.start, newAppointment.value.end, appointmentsData.value)) {
    conflictError.value = 'This time slot is already taken, please choose another!';
    return;
  }
  
  const appointmentToAdd = {
    ...newAppointment.value,
    start: newAppointment.value.start,
    end: newAppointment.value.end
  };
  
  appointmentsData.value.push(appointmentToAdd);
  
  alert('Appointment created successfully!');
  closeModal();
}

// Initialize sample data
onMounted(() => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  appointmentsData.value.push(
    {
      id: 1,
      title: 'Team Meeting',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30, 0).toISOString(),
      backgroundColor: '#4ECDC4'
    },
    {
      id: 2,
      title: 'Client Meeting',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0, 0).toISOString(),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0, 0).toISOString(),
      backgroundColor: '#FF6B6B'
    }
  );
});
</script>

<style scoped>
.appointment-calendar {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  flex: 1;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

h2 {
  margin-top: 0;
  color: #333;
  text-align: center;
}
</style>
