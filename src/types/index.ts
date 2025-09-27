// Типы для API и бизнес-логики салона красоты

export interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Master {
  id: number;
  name: string;
  specialization: string;
  description?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number; // в минутах
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  userId: number;
  masterId: number;
  serviceId: number;
  appointmentDate: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Дополнительные поля для отображения
  master?: Master;
  service?: Service;
  user?: User;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface MasterSchedule {
  id: number;
  masterId: number;
  dayOfWeek: number; // 0-6 (воскресенье-суббота)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isWorking: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  masterId: number;
  date: string;
}

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
  status?: AppointmentStatus;
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

// UI компоненты типы
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Состояние приложения
export interface AppState {
  user: TelegramUser | null;
  selectedMaster: Master | null;
  selectedService: Service | null;
  selectedDate: string | null;
  selectedTime: string | null;
}

// Навигация
export interface NavigationItem {
  href: string;
  label: string;
  icon: string;
}
