package com.example.appointment_service.Service;

import com.example.appointment_service.Client.EventClient;
import com.example.appointment_service.Client.UserClient;
import com.example.appointment_service.Dto.AppointmentCreate;
import com.example.appointment_service.Dto.AppointmentResponse;
import com.example.appointment_service.Dto.EventResponse;
import com.example.appointment_service.Entity.Appointment;
import com.example.appointment_service.Exception.*;
import com.example.appointment_service.Repository.AppointmentRepo;
import feign.FeignException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepo repo;
    private final EventClient eventClient;
    private final UserClient userClient;

    public AppointmentService(
            AppointmentRepo repo,
            EventClient eventClient,
            UserClient userClient
    ) {
        this.repo = repo;
        this.eventClient = eventClient;
        this.userClient = userClient;
    }

    @Transactional
    public AppointmentResponse create(Long bookedBy, AppointmentCreate request) {
        userClient.getById(bookedBy);

        EventResponse event = eventClient.getById(request.getEventId());

        if (event.getUserId().equals(bookedBy)) {
            throw new SelfBookingException();
        }

        try {
            eventClient.lock(event.getId());
        } catch (FeignException.NotFound e) {
            throw new EventNotFoundException(event.getId());
        } catch (FeignException.Conflict e) {
            throw new EventAlreadyBookedException(event.getId());
        } catch (Exception e) {
            throw new EventLockException("Event Lock Failed!");
        }

        Appointment appointment = new Appointment();
        appointment.setEventId(request.getEventId());
        appointment.setBookedBy(bookedBy);
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        Appointment saved = repo.save(appointment);

        AppointmentResponse response = new AppointmentResponse();
        response.setId(saved.getId());
        response.setEventId(saved.getEventId());
        response.setBookedBy(saved.getBookedBy());
        response.setCreatedAt(saved.getCreatedAt());

        try {
            eventClient.book(event.getId());

            saved.setStatus(Appointment.AppointmentStatus.BOOKED);
            repo.save(saved);
            response.setStatus(saved.getStatus());
            return response;
        } catch (Exception e) {
            eventClient.unlock(request.getEventId());

            saved.setStatus(Appointment.AppointmentStatus.FAILED);
            repo.save(saved);
            response.setStatus(saved.getStatus());

            throw e;
        }
    }

    public List<AppointmentResponse> getAppointments(Long bookedBy) {
        userClient.getById(bookedBy);

        return repo.findByBookedBy(bookedBy).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse cancel(Long appointmentId, Long userId) {
        Appointment appointment = repo.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(appointmentId));

        if (!appointment.getBookedBy().equals(userId)) {
            throw new AppointmentForbiddenException("You are not allowed to cancel this appointment");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new AppointmentException("Appointment already cancelled");
        }

        eventClient.unlock(appointment.getEventId());

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);

        Appointment saved = repo.save(appointment);

        return mapToResponse(saved);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse appointmentResponse = new AppointmentResponse();
        appointmentResponse.setId(appointment.getId());
        appointmentResponse.setEventId(appointment.getEventId());
        appointmentResponse.setBookedBy(appointment.getBookedBy());
        appointmentResponse.setCreatedAt(appointment.getCreatedAt());
        appointmentResponse.setStatus(appointment.getStatus());

        return appointmentResponse;
    }
}
