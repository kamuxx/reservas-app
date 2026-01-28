import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';
import { MessageService } from 'primeng/api';
import { map, catchError, lastValueFrom, throwError } from 'rxjs';

export interface IBaseHttpService<T> {
  get(params?: any, isAdmin?: boolean): Promise<T[]>;
  get(id: string, isAdmin?: boolean): Promise<T>;
  post(data: Partial<T>, isAdmin?: boolean): Promise<T>;
  put(id: string, data: Partial<T>, isAdmin?: boolean): Promise<T>;
  delete(id: string, isAdmin?: boolean): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T> implements IBaseHttpService<T> {
  protected http = inject(HttpClient);
  protected apiUrl = environment.apiUrl;
  protected messageService = inject(MessageService);

  abstract getEndpoint(): string;
  abstract getEndpointAdmin(): string;

  abstract transformResponse(data: any): T;

  protected buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return httpParams;
  }

  /**
   * GET request - Can be used for fetching a list (with params) or a single item (with ID).
   * Supports Generic Admin Routing via isAdmin flag.
   */
  async get(id: string, isAdmin?: boolean): Promise<T>;
  async get(params?: any, isAdmin?: boolean): Promise<T[]>;
  async get(idOrParams?: any, isAdmin: boolean = false): Promise<T | T[]> {
    try {
      const endpoint = isAdmin ? this.getEndpointAdmin() : this.getEndpoint();
      let url = `${this.apiUrl}${endpoint}`;

      // If argument is a string, it's an ID -> GET /id
      if (typeof idOrParams === 'string') {
        url = `${url}/${idOrParams}`;
        if (environment.enableDebug) console.log(`GET ${url}`);

        const response: any = await lastValueFrom(
          this.http.get<ApiResponse<T>>(url).pipe(
            catchError(err => throwError(() => err))
          )
        );

        if (response?.data) {
          return this.transformResponse(response.data);
        }
        throw new Error('Item not found');
      }

      // If argument is object or undefined, it's params -> GET /?params
      const httpParams = this.buildParams(idOrParams);
      if (environment.enableDebug) console.log(`GET ${url}`, idOrParams || '(No params)');

      const response: any = await lastValueFrom(
        this.http.get<ApiResponse<T>>(url, { params: httpParams }).pipe(
          map(res => res),
          catchError(err => throwError(() => err))
        )
      );

      // console.log({ response });

      if (response) {
        if (Array.isArray(response.data)) {
          return response.data.map((item: any) => this.transformResponse(item));
        } else if (response.data && Array.isArray(response.data.data)) {
          return response.data.data.map((item: any) => this.transformResponse(item));
        }
      }

      return [];
    } catch (error: any) {
      if (environment.enableDebug) console.error('Error in BaseService.get:', error);
      throw this.handleError(error);
    }
  }

  async post(data: Partial<T>, isAdmin: boolean = false): Promise<T> {
    try {
      const endpoint = isAdmin ? this.getEndpointAdmin() : this.getEndpoint();
      const url = `${this.apiUrl}${endpoint}`;

      if (environment.enableDebug) console.log(`POST ${url}`, data);

      const response = await this.http.post<ApiResponse<T>>(url, data).toPromise();

      if (response?.data) {
        return this.transformResponse(response.data);
      }

      throw new Error('Failed to create item');
    } catch (error: any) {
      if (environment.enableDebug) console.error('Error in BaseService.post:', error);
      throw this.handleError(error);
    }
  }

  async put(id: string, data: Partial<T>, isAdmin: boolean = false): Promise<T> {
    try {
      const endpoint = isAdmin ? this.getEndpointAdmin() : this.getEndpoint();
      const url = `${this.apiUrl}${endpoint}/${id}`;

      if (environment.enableDebug) console.log(`PUT ${url}`, data);

      const response = await this.http.put<ApiResponse<T>>(url, data).toPromise();

      if (response?.data) {
        return this.transformResponse(response.data);
      }

      throw new Error('Failed to update item');
    } catch (error: any) {
      if (environment.enableDebug) console.error('Error in BaseService.put:', error);
      throw this.handleError(error);
    }
  }

  async delete(id: string, isAdmin: boolean = false): Promise<void> {
    try {
      const endpoint = isAdmin ? this.getEndpointAdmin() : this.getEndpoint();
      const url = `${this.apiUrl}${endpoint}/${id}`;

      if (environment.enableDebug) console.log(`DELETE ${url}`);

      await this.http.delete(url).toPromise();
    } catch (error: any) {
      if (environment.enableDebug) console.error('Error in BaseService.delete:', error);
      throw this.handleError(error);
    }
  }

  protected handleError(error: any, shouldRedirect: boolean = true): Error {
    if (error.status === 401) {
      if (shouldRedirect) {
        // Handle unauthorized - redirect to login
        window.location.href = '/login';
      }
      return new Error('Unauthorized');
    }

    if (error.status === 403) {
      return new Error('Forbidden');
    }

    if (error.status === 404) {
      return new Error('Resource not found');
    }

    if (error.status === 422) {
      // Validation error
      if (error.error?.errors) {
        const messages = Object.values(error.error.errors).flat();
        return new Error(messages.join(', '));
      }
      return new Error('Validation error');
    }

    if (error.status === 500) {
      return new Error('Server Error');
    }

    return new Error(error.message || 'An error occurred');
  }

  // Utility methods for common operations
  protected mapToType<T>(data: any): T {
    return data as T;
  }

  protected formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  }

  protected formatTime(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toTimeString().slice(0, 5);
  }
}