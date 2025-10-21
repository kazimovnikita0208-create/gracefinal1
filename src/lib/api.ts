'use client';

import { 
  User, 
  Master, 
  Service, 
  Appointment, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  ApiResponse,
  PaginatedResponse,
  TimeSlot 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Общий класс для работы с API
class ApiClient {
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
      console.error('API request failed:', error);
      
      // Более понятные сообщения об ошибках
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на порту 3334');
      }
      
      throw error;
    }
  }

  // Методы для работы с пользователями
  async authenticateUser(telegramId: number, firstName?: string, lastName?: string, username?: string): Promise<ApiResponse<User>> {
    return this.request<User>('/users/auth', {
      method: 'POST',
      body: JSON.stringify({
        telegramId,
        firstName,
        lastName,
        username
      })
    });
  }

  async getCurrentUser(telegramId: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/me?telegramId=${telegramId}`);
  }

  async getUser(telegramId: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${telegramId}`);
  }

  async createUser(userData: {
    telegramId: number;
    firstName: string;
    lastName?: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Методы для работы с мастерами
  async getMasters(): Promise<ApiResponse<Master[]>> {
    return this.request<Master[]>('/masters');
  }

  async getMaster(masterId: number): Promise<ApiResponse<Master>> {
    return this.request<Master>(`/masters/${masterId}`);
  }

  async getMasterSchedule(masterId: number): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/masters/${masterId}/schedule`);
  }

  async getAvailableSlots(
    masterId: number, 
    date: string, 
    serviceId: number
  ): Promise<ApiResponse<TimeSlot[]>> {
    return this.request<TimeSlot[]>(
      `/masters/${masterId}/available-slots?date=${date}&serviceId=${serviceId}`
    );
  }

  // Методы для работы с услугами
  async getServices(): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>('/services');
  }

  async getService(serviceId: number): Promise<ApiResponse<Service>> {
    return this.request<Service>(`/services/${serviceId}`);
  }

  async getServicesByMaster(masterId: number): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>(`/masters/${masterId}/services`);
  }

  // Методы для работы с записями
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments(status?: string): Promise<ApiResponse<Appointment[]>> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<Appointment[]>(`/appointments${query}`);
  }

  async getUserAppointments(userId: number): Promise<ApiResponse<Appointment[]>> {
    return this.request<Appointment[]>(`/appointments/user/${userId}`);
  }

  async getAppointment(appointmentId: number): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${appointmentId}`);
  }

  async updateAppointment(
    appointmentId: number, 
    appointmentData: UpdateAppointmentRequest
  ): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async cancelAppointment(appointmentId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  }

  // Проверка здоровья API
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; uptime: number }>> {
    return this.request<{ status: string; timestamp: string; uptime: number }>('/health');
  }
}

// Создаем экземпляр API клиента
export const api = new ApiClient(API_BASE_URL);

// Моковые данные для разработки (когда backend недоступен)
export const mockData = {
  masters: [
    {
      id: 1,
      name: 'Анна Иванова',
      specialization: 'Стилист-парикмахер',
      description: 'Опытный мастер с 8-летним стажем. Специализируется на окрашивании и стрижках.',
      photoUrl: '/images/masters/anna.jpg',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Мария Петрова',
      specialization: 'Мастер маникюра и педикюра',
      description: 'Профессиональный nail-мастер с опытом работы 5 лет.',
      photoUrl: '/images/masters/maria.jpg',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 3,
      name: 'Елена Сидорова',
      specialization: 'Косметолог',
      description: 'Косметолог с 10-летним опытом. Специалист по уходу за кожей лица.',
      photoUrl: '/images/masters/elena.jpg',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ] as Master[],

  services: [
    {
      id: 1,
      name: 'Стрижка женская',
      description: 'Модная женская стрижка с укладкой',
      price: 2000,
      duration: 60,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Окрашивание волос',
      description: 'Профессиональное окрашивание волос',
      price: 4500,
      duration: 180,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 3,
      name: 'Маникюр',
      description: 'Классический маникюр с покрытием',
      price: 1500,
      duration: 90,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 4,
      name: 'Педикюр',
      description: 'Аппаратный педикюр с покрытием',
      price: 2000,
      duration: 120,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 5,
      name: 'Чистка лица',
      description: 'Комплексная чистка лица',
      price: 3000,
      duration: 90,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 6,
      name: 'Массаж лица',
      description: 'Расслабляющий массаж лица',
      price: 2500,
      duration: 60,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ] as Service[],
};


