import { Injectable } from '@angular/core';
import { BaseService } from '../core/services/base.service';
import { Reservation, CreateReservationRequest } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class ReservationService extends BaseService<Reservation> {

  getEndpoint(): string {
    return '/api/reservations';
  }

  transformResponse(data: any): Reservation {
    if (data.reservation_uuid) {
      // Map flat structure from API
      return {
        uuid: data.reservation_uuid,
        reserved_by: data.user_uuid,
        space_id: data.space_uuid,
        status_id: data.status_uuid,
        event_name: data.event_name,
        event_description: data.event_description,
        // Map dates/times - assuming start_datetime/end_datetime might be used if event_date/times are missing
        // If start_datetime is a full string, extract info. If plain 1, this logic handles it gracefully or defaults.
        event_date: data.event_date || (typeof data.start_datetime === 'string' ? data.start_datetime.split(' ')[0] : ''),
        start_time: data.start_time || (typeof data.start_datetime === 'string' ? data.start_datetime.split(' ')[1]?.substring(0, 5) : '00:00'),
        end_time: data.end_time || (typeof data.end_datetime === 'string' ? data.end_datetime.split(' ')[1]?.substring(0, 5) : '00:00'),
        event_price: parseFloat(data.event_price) || 0,
        pricing_rule_id: data.pricing_rule_uuid,
        created_at: data.reservation_created_at,
        updated_at: data.reservation_updated_at,
        user: {
          uuid: data.user_uuid,
          name: data.user_name,
          email: data.user_email,
          phone: data.user_phone,
          role: 'user',
          status: 'active',
          created_at: '',
          updated_at: ''
        },
        space: {
          uuid: data.space_uuid,
          name: data.space_name,
          description: data.space_description,
          capacity: data.space_capacity,
          spaces_type_id: data.space_type_uuid,
          status_id: 'active', // Placeholder
          pricing_rule_id: data.pricing_rule_uuid,
          is_active: true,
          images: data.space_main_image ? [data.space_main_image] : [],
          type: {
            uuid: data.space_type_uuid,
            name: data.space_type_name
          },
          // Map reservation status name if available, otherwise generic
          availability_status: data.status_name
        },
        status: {
          uuid: data.status_uuid,
          name: data.status_name || 'unknown'
        }
      };
    }

    // Default mapping for standard nested structure
    return {
      uuid: data.uuid,
      reserved_by: data.reserved_by,
      space_id: data.space_id,
      status_id: data.status_id,
      event_name: data.event_name,
      event_description: data.event_description,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      event_price: data.event_price,
      pricing_rule_id: data.pricing_rule_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: data.user,
      space: data.space,
      status: data.status
    };
  }

  async getMyReservations(status?: string): Promise<Reservation[]> {
    try {
      const params: any = {};

      // If status is provided, add it to params
      if (status) {
        // Map status names to IDs or use directly if backend supports names
        // For now sending the status string as requested
        params.status = status;
      }

      // Use the base service get method which calls this.getEndpoint() -> /api/reservations
      // and handles response transformation
      return await super.get(params);
    } catch (error) {
      // Return mock data for development if API fails
      console.error('API Error, falling back to mock data', error);
      return this.getMockReservations(status);
    }
  }

  async createReservation(reservationData: CreateReservationRequest): Promise<Reservation> {
    try {
      return await this.post(reservationData);
    } catch (error) {
      // Return mock reservation for development
      return this.getMockReservation();
    }
  }

  async cancelReservation(id: string): Promise<Reservation> {
    try {
      const url = `${this.apiUrl}${this.getEndpoint()}/${id}`;
      const response = await this.http.delete(url).toPromise();

      if (response && 'data' in response) {
        return this.transformResponse((response as any).data);
      }

      throw new Error('Failed to cancel reservation');
    } catch (error) {
      // Return mock cancelled reservation
      return this.getMockReservation();
    }
  }

  async updateReservation(id: string, reservationData: Partial<Reservation>): Promise<Reservation> {
    try {
      return await this.put(id, reservationData);
    } catch (error) {
      // Return mock updated reservation
      return this.getMockReservation();
    }
  }

  async getReservationById(id: string): Promise<Reservation> {
    try {
      return await super.get(id);
    } catch (error) {
      // Return mock reservation
      return this.getMockReservation();
    }
  }

  // Mock data methods for development/fallback
  private getMockReservations(status?: string): Reservation[] {
    const reservations = [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440100',
        reserved_by: '550e8400-e29b-41d4-a716-446655440200',
        space_id: '550e8400-e29b-41d4-a716-446655440001',
        status_id: '550e8400-e29b-41d4-a716-446655440300',
        event_name: 'Reunión de Equipo',
        event_description: 'Planificación del sprint Q1',
        event_date: '2026-01-15',
        start_time: '09:00',
        end_time: '11:00',
        event_price: 100.00,
        pricing_rule_id: '550e8400-e29b-41d4-a716-446655440400',
        created_at: '2026-01-08T10:00:00Z',
        updated_at: '2026-01-08T10:00:00Z',
        user: {
          uuid: '550e8400-e29b-41d4-a716-446655440200',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+584121234567',
          role: 'user' as const,
          status: 'active' as const,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z'
        },
        space: {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Sala Berlin',
          description: 'Sala moderna con vista a la ciudad',
          capacity: 10,
          spaces_type_id: '550e8400-e29b-41d4-a716-446655440500',
          status_id: '550e8400-e29b-41d4-a716-446655440600',
          pricing_rule_id: '550e8400-e29b-41d4-a716-446655440400',
          is_active: true
        },
        status: {
          uuid: '550e8400-e29b-41d4-a716-446655440300',
          name: 'Confirmada'
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440101',
        reserved_by: '550e8400-e29b-41d4-a716-446655440200',
        space_id: '550e8400-e29b-41d4-a716-446655440002',
        status_id: '550e8400-e29b-41d4-a716-446655440301',
        event_name: 'Presentación Cliente',
        event_description: 'Reunión importante con cliente potencial',
        event_date: '2026-01-10',
        start_time: '14:00',
        end_time: '16:00',
        event_price: 400.00,
        pricing_rule_id: '550e8400-e29b-41d4-a716-446655440401',
        created_at: '2026-01-05T09:00:00Z',
        updated_at: '2026-01-05T09:00:00Z',
        user: undefined,
        space: undefined,
        status: {
          uuid: '550e8400-e29b-41d4-a716-446655440301',
          name: 'Completada'
        }
      }
    ];

    if (status) {
      return reservations.filter(r => r.status?.name.toLowerCase() === status.toLowerCase());
    }

    return reservations.map(r => ({ ...r, user: r.user || undefined, space: r.space || undefined }));
  }

  private getMockReservation(): Reservation {
    return {
      uuid: '550e8400-e29b-41d4-a716-446655440102',
      reserved_by: '550e8400-e29b-41d4-a716-446655440200',
      space_id: '550e8400-e29b-41d4-a716-446655440001',
      status_id: '550e8400-e29b-41d4-a716-446655440302',
      event_name: 'Nueva Reserva',
      event_description: 'Descripción de la reserva',
      event_date: '2026-01-20',
      start_time: '10:00',
      end_time: '12:00',
      event_price: 100.00,
      pricing_rule_id: '550e8400-e29b-41d4-a716-446655440400',
      created_at: '2026-01-08T15:00:00Z',
      updated_at: '2026-01-08T15:00:00Z',
      user: undefined,
      space: undefined,
      status: {
        uuid: '550e8400-e29b-41d4-a716-446655440302',
        name: 'Confirmada'
      }
    };
  }
}