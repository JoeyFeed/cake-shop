/**
 * Утилита для отправки уведомлений в Telegram бот
 */

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

// Получаем конфигурацию из переменных окружения
const getTelegramConfig = (): TelegramConfig | null => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return null;
  }

  return { botToken, chatId };
};

/**
 * Отправляет сообщение в Telegram бот
 * @param message - Текст сообщения
 * @param parseMode - Режим парсинга (HTML, Markdown и т.д.)
 */
export const sendTelegramMessage = async (
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> => {
  const config = getTelegramConfig();

  if (!config) {
    console.warn('Telegram bot configuration is not set. Skipping notification.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
};

/**
 * Форматирует уведомление для Telegram
 */
export const formatTelegramNotification = (
  type: 'success' | 'error' | 'info',
  title: string,
  description?: string
): string => {
  const emoji = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  let message = `${emoji[type]} <b>${title}</b>`;
  
  if (description) {
    message += `\n\n${description}`;
  }

  // Добавляем время
  const now = new Date();
  const timeString = now.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  message += `\n\n<code>${timeString}</code>`;

  return message;
};

/**
 * Форматирует уведомление о новом заказе для Telegram
 */
export const formatOrderNotification = (order: {
  id: string;
  name: string;
  phone: string;
  delivery_type: string;
  delivery_address?: string | null;
  comment?: string | null;
  total: number;
  order_items?: Array<{
    quantity: number;
    price: number;
    products?: { name: string };
  }>;
}): string => {
  const deliveryTypeText = order.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз';
  
  let message = `🛒 <b>Новый заказ #${order.id}</b>\n\n`;
  message += `<b>Клиент:</b> ${order.name}\n`;
  message += `<b>Телефон:</b> ${order.phone}\n`;
  message += `<b>Способ получения:</b> ${deliveryTypeText}\n`;
  
  if (order.delivery_address) {
    message += `<b>Адрес доставки:</b> ${order.delivery_address}\n`;
  }
  
  if (order.comment) {
    message += `\n<b>Комментарий:</b> ${order.comment}\n`;
  }
  
  if (order.order_items && order.order_items.length > 0) {
    message += `\n<b>Товары:</b>\n`;
    order.order_items.forEach((item) => {
      const productName = item.products?.name || 'Товар';
      message += `• ${productName} × ${item.quantity} = ${item.quantity * item.price} ₽\n`;
    });
  }
  
  message += `\n<b>Итого:</b> ${order.total} ₽\n`;
  
  // Добавляем время
  const now = new Date();
  const timeString = now.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  message += `\n<code>${timeString}</code>`;
  
  return message;
};

