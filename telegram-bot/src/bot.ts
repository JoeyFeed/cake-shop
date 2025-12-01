// src/bot.ts
import * as dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const ALLOWED_USER_ID = parseInt(process.env.ALLOWED_USER_ID || '', 10);

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_CHAT_ID || isNaN(ALLOWED_USER_ID)) {
  console.error('❌ Не хватает переменных окружения в .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Сопоставление статусов
const STATUS_LABELS: Record<string, string> = {
  pending: 'Новый',
  processing: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const STATUS_MAP: Record<string, string> = {
  новый: 'pending',
  обработка: 'processing',
  выполнен: 'completed',
  отменён: 'cancelled',
  отменен: 'cancelled',
};

// Проверка, является ли чат целевым
const isAdminChat = (chatId: number): boolean => chatId.toString() === ADMIN_CHAT_ID;

// Приветствие
bot.start(async (ctx) => {
  if (ctx.from.id !== ALLOWED_USER_ID) {
    return ctx.reply('❌ Доступ запрещён.');
  }
  await ctx.reply(
    '✅ Бот управления заказами запущен!\n\n' +
    'Чтобы изменить статус, напишите в чат:\n' +
    '`#755e4f83-48d4-4057-8ebf-144532ff9693 статус=выполнен`\n\n' +
    'Доступные статусы: _новый, обработка, выполнен, отменён_',
    { parse_mode: 'Markdown' }
  );
});

// Обработка команд в чате
bot.on('text', async (ctx) => {
  const { text, chat, from } = ctx.message;

  // Проверяем: только из нужного чата и от админа
  if (!isAdminChat(chat.id) || from.id !== ALLOWED_USER_ID) {
    return;
  }

  // Ищем #uuid статус=...
  const idMatch = text.match(
    /#([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
  );
  const statusMatch = text.match(/статус=([а-яё]+)/i);

  if (!idMatch || !statusMatch) {
    return;
  }

  const orderId = idMatch[1]; // Теперь полный UUID
  const statusKey = statusMatch[1].toLowerCase();
  const newStatus = STATUS_MAP[statusKey];

  if (!newStatus) {
    return ctx.telegram.sendMessage(
      chat.id,
      `❌ Неизвестный статус: "${statusMatch[1]}"\nДопустимые: новый, обработка, выполнен, отменён`,
      { reply_parameters: { message_id: ctx.message.message_id } }
    );
  }

  try {
    // Получаем текущий статус
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return ctx.telegram.sendMessage(
        chat.id,
        `❌ Заказ #${orderId.slice(0, 8)} не найден.`,
        { reply_parameters: { message_id: ctx.message.message_id } }
      );
    }

    // Обновляем статус
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) throw updateError;

    const oldLabel = STATUS_LABELS[order.status];
    const newLabel = STATUS_LABELS[newStatus];

    await ctx.telegram.sendMessage(
      chat.id,
      `✅ #${orderId.slice(0, 8)}\n➡️ ${oldLabel} → ${newLabel}`,
      { reply_parameters: { message_id: ctx.message.message_id } }
    );
  } catch (error: unknown) {
    const err = error as Error;
    await ctx.telegram.sendMessage(
      chat.id,
      `❌ Ошибка: ${err.message}`,
      { reply_parameters: { message_id: ctx.message.message_id } }
    );
  }
});

// Запуск бота
bot.launch().then(() => {
  console.log('✅ Telegram-бот слушает чат:', ADMIN_CHAT_ID);
});

// Корректное завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
