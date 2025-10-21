'use client';

import { 
  Master, 
  Service, 
  Appointment, 
  ApiResponse,
  PaginatedResponse 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Класс для работы с админ API
class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getTelegramInitData(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initData as string | undefined;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.getTelegramInitData() ? { 'X-Telegram-Init-Data': this.getTelegramInitData()! } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Admin API request failed:', error);
      
      // Более понятные сообщения об ошибках
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на порту 3334');
      }
      
      throw error;
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<{
    todayAppointments: number;
    totalAppointments: number;
    totalRevenue: number;
    averageRating: number;
    activeMasters: number;
    activeServices: number;
  }>> {
    return this.request('/admin/dashboard');
  }

  // Masters
  async getMasters(): Promise<ApiResponse<Master[]>> {
    return this.request('/admin/masters');
  }

  async createMaster(masterData: {
    name: string;
    specialization: string;
    description?: string;
    photoUrl?: string;
    experience?: number;
    serviceIds?: number[];
  }): Promise<ApiResponse<Master>> {
    return this.request('/admin/masters', {
      method: 'POST',
      body: JSON.stringify(masterData),
    });
  }

  async updateMaster(masterId: number, masterData: Partial<Master> & {
    serviceIds?: number[];
  }): Promise<ApiResponse<Master>> {
    return this.request(`/admin/masters/${masterId}`, {
      method: 'PUT',
      body: JSON.stringify(masterData),
    });
  }

  async deleteMaster(masterId: number): Promise<ApiResponse<void>> {
    return this.request(`/admin/masters/${masterId}`, {
      method: 'DELETE',
    });
  }

  // Services
  async getServices(): Promise<ApiResponse<Service[]>> {
    return this.request('/admin/services');
  }

  async createService(serviceData: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    category?: string;
    masterIds?: number[];
  }): Promise<ApiResponse<Service>> {
    return this.request('/admin/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(serviceId: number, serviceData: Partial<Service> & {
    masterIds?: number[];
  }): Promise<ApiResponse<Service>> {
    return this.request(`/admin/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(serviceId: number): Promise<ApiResponse<void>> {
    return this.request(`/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // Appointments
  async getAppointments(params?: {
    status?: string;
    masterId?: number;
    serviceId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/appointments?${queryString}` : '/admin/appointments';
    
    return this.request(endpoint);
  }

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<ApiResponse<Appointment>> {
    return this.request(`/admin/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

// Создаем экземпляр админ API клиента
export const adminApi = new AdminApiClient(API_BASE_URL);

// Утилиты для форматирования
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  return `${mins}м`;
};

export const getCategoryLabel = (category: string): string => {
  const labels: { [key: string]: string } = {
    'hair': 'Парикмахерские',
    'nails': 'Маникюр и педикюр',
    'face': 'Косметология'
  };
  return labels[category] || category;
};

export const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'PENDING': 'Ожидает',
    'CONFIRMED': 'Подтверждена',
    'COMPLETED': 'Завершена',
    'CANCELLED': 'Отменена'
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'PENDING': 'text-yellow-400',
    'CONFIRMED': 'text-blue-400',
    'COMPLETED': 'text-green-400',
    'CANCELLED': 'text-red-400'
  };
  return colors[status] || 'text-gray-400';
};
