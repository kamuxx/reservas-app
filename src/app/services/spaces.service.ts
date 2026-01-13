import { Injectable } from '@angular/core';
import { BaseService } from '../core/services/base.service';
import { Space, SpaceFilters, AvailabilitySlot } from '../core/models';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SpacesService extends BaseService<Space> {
  private readonly endpointBase = '/api/spaces';

  getEndpoint(): string {
    return this.endpointBase;
  }

  transformResponse(data: any): Space {
    return {
      uuid: data.uuid,
      name: data.name,
      description: data.description || '',
      capacity: data.capacity,
      spaces_type_id: data.spaces_type_id,
      status_id: data.status_id,
      pricing_rule_id: data.pricing_rule_id,
      is_active: data.is_active,
      images: data.images || [], // Default/fallback images logic could be moved to component or a utility if needed, keeping service clean
      type: data.type,
      status: data.availability_status,
      pricing_rule: data.pricing_rule,
      // Mapping any extra fields if API returns them directly or nested
    };
  }

  /**
   * Get all spaces with optional filters.
   * Calls GET /api/spaces
   */
  /**
   * Get all spaces with optional filters.
   * Calls GET /api/spaces
   */
  async getAll(filters?: SpaceFilters): Promise<Space[]> {
    return super.get(filters) as Promise<Space[]>;
  }

  /**
   * Get a space by UUID.
   * Calls GET /api/spaces/{uuid}
   */
  async getById(uuid: string): Promise<Space> {
    return super.get(uuid) as unknown as Promise<Space>;
  }

  /**
   * Create a new space.
   * Calls POST /api/spaces
   */
  async create(spaceData: Partial<Space>): Promise<Space> {
    return super.post(spaceData);
  }

  /**
   * Update an existing space.
   * Calls PUT /api/spaces/{uuid}
   */
  async update(uuid: string, spaceData: Partial<Space>): Promise<Space> {
    return super.put(uuid, spaceData);
  }

  /**
   * Delete a space.
   * Calls DELETE /api/spaces/{uuid}
   */
  override async delete(uuid: string): Promise<void> {
    return super.delete(uuid);
  }

  /**
   * Check availability for a specific space.
   * Calls GET /api/spaces/{uuid}/availability
   */
  async checkAvailability(uuid: string, startDate: string, endDate: string): Promise<AvailabilitySlot[]> {
    try {
      // Changed to POST /api/spaces/availability as per requirement
      const url = `${this.apiUrl}${this.getEndpoint()}/availability`;

      const body = {
        space_uuid: uuid,
        start_date: startDate,
        end_date: endDate
      };

      if (environment.enableDebug) {
        console.log(`POST ${url}`, body);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await this.http.post(url, body).toPromise();

      // Assuming response format: { status: 'success', data: [...] }
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      if (environment.enableDebug) {
        console.error('Error checking availability:', error);
      }
      throw this.handleError(error, false);
    }
  }

  /**
   * Get available spaces for a specific date and optional type.
   * Calls GET /api/spaces/available
   */
  async getAvailableSpaces(date: string, spaceTypeId?: string): Promise<Space[]> {
    try {
      const url = `${this.apiUrl}${this.getEndpoint()}/available`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { fecha_deseada: date };

      if (spaceTypeId) {
        params.space_type_id = spaceTypeId;
      }

      const httpParams = this.buildParams(params);

      if (environment.enableDebug) {
        console.log(`GET ${url}`, params);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await this.http.get(url, { params: httpParams }).toPromise();

      if (response && response.status === 'success' && Array.isArray(response.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return response.data.map((item: any) => this.transformResponse(item));
      }

      return [];
    } catch (error) {
      if (environment.enableDebug) {
        console.error('Error getting available spaces:', error);
      }
      throw this.handleError(error);
    }
  }
}

