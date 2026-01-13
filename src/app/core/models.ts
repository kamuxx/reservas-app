// Core models and interfaces for the application

export interface User {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Space {
  uuid: string;
  name: string;
  description: string;
  capacity: number;
  spaces_type_id: string;
  status_id: string;
  pricing_rule_id: string;
  is_active: boolean;
  images?: string[];
  type?: SpaceType;
  status?: SpaceStatus;
  pricing_rule?: PricingRule;
  availability_status?: string;
}

export interface SpaceType {
  uuid: string;
  name: string;
  description?: string;
}

export interface SpaceStatus {
  uuid: string;
  name: string;
}

export interface PricingRule {
  uuid: string;
  name: string;
  hourly_rate: number;
  rules?: any;
}

export interface Reservation {
  uuid: string;
  reserved_by: string;
  space_id: string;
  status_id: string;
  event_name: string;
  event_description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_price: number;
  pricing_rule_id: string;
  created_at: string;
  updated_at: string;
  user?: User;
  space?: Space;
  status?: ReservationStatus;
}

export interface ReservationStatus {
  uuid: string;
  name: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: T[];
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

export interface CreateReservationRequest {
  space_id: string;
  event_name: string;
  event_description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_price: number;
}

export interface SpaceFilters {
  capacity?: number;
  spaces_type_id?: string;
  per_page?: number;
  page?: number;
  fecha_deseada?: string;
}

export interface AvailabilitySlot {
  event_date: string;
  start_time: string;
  end_time: string;
  reserved_by?: string;
  user_uuid?: string; // Added to match API response
  event_name?: string;
}

// Extend existing Filtros interface for compatibility
export interface Filtros extends SpaceFilters {
  tipo: string;
  precio: number;
  capacidad: number;
  amenidades: string[];
  fecha: string;
}