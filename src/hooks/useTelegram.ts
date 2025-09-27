'use client';

import { useEffect, useState } from 'react';
import { TelegramUser, TelegramWebAppData } from '@/types';

// Типы для Telegram Web App API
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: TelegramWebAppData;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        expand: () => void;
        close: () => void;
        ready: () => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback?: (text: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean, contact?: any) => void) => void;
      };
    };
  }
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<Window['Telegram']['WebApp'] | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      
      // Получаем данные пользователя
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
      
      // Настраиваем приложение
      tg.ready();
      tg.expand();
      
      setIsReady(true);
    } else {
      // Для разработки без Telegram
      console.warn('Telegram Web App не найден. Используем моковые данные для разработки.');
      setUser({
        id: 123456789,
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        username: 'test_user',
        language_code: 'ru'
      });
      setIsReady(true);
    }
  }, []);

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  };

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning' = 'success') => {
      webApp?.HapticFeedback.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged();
    }
  };

  const mainButton = {
    setText: (text: string) => webApp?.MainButton.setText(text),
    show: () => webApp?.MainButton.show(),
    hide: () => webApp?.MainButton.hide(),
    enable: () => webApp?.MainButton.enable(),
    disable: () => webApp?.MainButton.disable(),
    onClick: (callback: () => void) => webApp?.MainButton.onClick(callback),
    offClick: (callback: () => void) => webApp?.MainButton.offClick(callback),
  };

  const backButton = {
    show: () => webApp?.BackButton.show(),
    hide: () => webApp?.BackButton.hide(),
    onClick: (callback: () => void) => webApp?.BackButton.onClick(callback),
    offClick: (callback: () => void) => webApp?.BackButton.offClick(callback),
  };

  const close = () => {
    webApp?.close();
  };

  const sendData = (data: any) => {
    if (webApp) {
      webApp.sendData(JSON.stringify(data));
    } else {
      console.log('Отправка данных:', data);
    }
  };

  return {
    webApp,
    user,
    isReady,
    showAlert,
    showConfirm,
    hapticFeedback,
    mainButton,
    backButton,
    close,
    sendData,
    isExpanded: webApp?.isExpanded || false,
    colorScheme: webApp?.colorScheme || 'light',
    themeParams: webApp?.themeParams || {},
  };
};
