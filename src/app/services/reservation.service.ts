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

  getEndpointAdmin(): string {
    return '/api/v1/admin/reservations';
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
      console.error('API Error in getMyReservations', error);
      throw error;
    }
  }

  async createReservation(reservationData: CreateReservationRequest): Promise<Reservation> {
    return await this.post(reservationData);
  }

  async cancelReservation(id: string): Promise<Reservation> {
    const url = `${this.apiUrl}${this.getEndpoint()}/${id}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await this.http.delete(url).toPromise();

    if (response && 'data' in response) {
      return this.transformResponse(response.data);
    }

    throw new Error('Failed to cancel reservation');
  }

  async updateReservation(id: string, reservationData: Partial<Reservation>): Promise<Reservation> {
    return await this.put(id, reservationData);
  }

  async getReservationById(id: string): Promise<Reservation> {
    return await super.get(id);
  }

}