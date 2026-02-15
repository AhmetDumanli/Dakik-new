package com.example.appointment_service.Repository;

import com.example.appointment_service.Entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AppointmentRepo extends JpaRepository<Appointment, Long> {

    List<Appointment> findByBookedBy(Long bookedBy);

    List<Appointment> findByEventOwnerIdAndStatus(Long eventOwnerId, Appointment.AppointmentStatus status);

    List<Appointment> findByEventIdAndStatusIn(Long eventId, List<Appointment.AppointmentStatus> statuses);

}
