// API Response типы
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request типы
export interface CreateAppointmentRequest {
  masterId: number;
  serviceId: number;
  appointmentDate: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

// Telegram Web App типы
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppData {
  user?: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
}

// Статистика и аналитика
export interface DashboardStats {
  totalAppointments: number;
  totalRevenue: number;
  averageRating: number;
  activeMasters: number;
  activeServices: number;
  todayAppointments: number;
  weeklyRevenue: number;
}

export interface MasterPerformance {
  masterId: number;
  masterName: string;
  totalAppointments: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
}

export interface ServiceStats {
  serviceId: number;
  serviceName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
}

// Фильтры для запросов
export interface AppointmentFilters {
  masterId?: number;
  serviceId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface MasterFilters {
  isActive?: boolean;
  specialization?: string;
  page?: number;
  limit?: number;
}

export interface ServiceFilters {
  isActive?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}

// Уведомления
export interface NotificationData {
  userId?: number;
  type: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_CANCELLED' | 'PROMOTION' | 'SYSTEM';
  title: string;
  message: string;
}

// Временные слоты
export interface TimeSlot {
  time: string;
  available: boolean;
  masterId: number;
  date: string;
}

// Валидация
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}



