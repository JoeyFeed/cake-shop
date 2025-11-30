/**
 * Обертка над toast для админ-панели с дублированием в Telegram
 */
import { toast as sonnerToast } from 'sonner';
import { sendTelegramMessage, formatTelegramNotification } from './telegram';

/**
 * Отправляет уведомление об успехе
 */
export const adminToastSuccess = (message: string, description?: string) => {
  sonnerToast.success(message, {
    description,
  });

  // Дублируем в Telegram
  const telegramMessage = formatTelegramNotification('success', message, description);
  sendTelegramMessage(telegramMessage).catch((error) => {
    console.error('Failed to send Telegram notification:', error);
  });
};

/**
 * Отправляет уведомление об ошибке
 */
export const adminToastError = (message: string, description?: string) => {
  sonnerToast.error(message, {
    description,
  });

  // Дублируем в Telegram
  const telegramMessage = formatTelegramNotification('error', message, description);
  sendTelegramMessage(telegramMessage).catch((error) => {
    console.error('Failed to send Telegram notification:', error);
  });
};

/**
 * Отправляет информационное уведомление
 */
export const adminToastInfo = (message: string, description?: string) => {
  sonnerToast.info(message, {
    description,
  });

  // Дублируем в Telegram
  const telegramMessage = formatTelegramNotification('info', message, description);
  sendTelegramMessage(telegramMessage).catch((error) => {
    console.error('Failed to send Telegram notification:', error);
  });
};

