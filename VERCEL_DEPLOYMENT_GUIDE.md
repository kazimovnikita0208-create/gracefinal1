# 🚀 Развертывание на Vercel

## Шаг 1: Подготовка проекта

✅ **Файлы уже созданы:**
- `src/app/api/telegram/webhook/route.ts` - webhook endpoint для Telegram
- `src/app/api/test/route.ts` - тестовый endpoint
- `scripts/setup-vercel-webhook.js` - скрипт для настройки webhook
- `package.json` - обновлен с командой `setup-vercel-webhook`

## Шаг 2: Развертывание на Vercel

1. **Выполните команду:**
   ```bash
   vercel --prod
   ```

2. **Или используйте Vercel Dashboard:**
   - Зайдите на https://vercel.com/nikitas-projects-1742d776/gracefinal1
   - Нажмите "Deploy"

## Шаг 3: Проверка API endpoints

1. **Проверьте тестовый endpoint:**
   ```bash
   curl https://your-vercel-url.vercel.app/api/test
   ```

2. **Проверьте webhook endpoint:**
   ```bash
   curl https://your-vercel-url.vercel.app/api/telegram/webhook
   ```

## Шаг 4: Настройка переменных окружения

1. **В Vercel Dashboard:**
   - Перейдите в Settings > Environment Variables
   - Добавьте переменную `TELEGRAM_BOT_TOKEN`
   - Значение: `7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU`
   - Выберите Production, Preview, Development
   - Нажмите "Save"

2. **Или через CLI:**
   ```bash
   vercel env add TELEGRAM_BOT_TOKEN
   ```

## Шаг 5: Настройка webhook в Telegram

1. **Получите URL вашего Vercel проекта:**
   - Например: `gracefinal1.vercel.app`

2. **Запустите скрипт настройки webhook:**
   ```bash
   npm run setup-vercel-webhook -- 7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU gracefinal1.vercel.app
   ```

3. **Или через переменные окружения:**
   ```bash
   TELEGRAM_BOT_TOKEN=7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU VERCEL_URL=gracefinal1.vercel.app npm run setup-vercel-webhook
   ```

## Шаг 6: Проверка работы

1. **Отправьте боту `/start`**
2. **Проверьте логи в Vercel Dashboard:**
   - Перейдите в "Logs" в Vercel Dashboard
   - Должны появиться сообщения о получении и обработке запроса
3. **Бот должен ответить** приветствием

## Шаг 7: Настройка автоматических деплоев

1. **Подключите GitHub к Vercel:**
   - В Vercel Dashboard перейдите в Settings > Git
   - Нажмите "Connect Git Repository"
   - Выберите репозиторий `gracefinal1`

2. **Настройте автоматические деплои:**
   - Production Branch: `main`
   - Framework Preset: `Next.js`

## Преимущества Vercel:

- ✅ **Интеграция с Next.js** - оптимизировано для Next.js
- ✅ **Автоматические деплои** - при каждом push в GitHub
- ✅ **Бесплатный план** - для небольших проектов
- ✅ **Предпросмотр для каждого PR** - тестирование перед мержем
- ✅ **Глобальная CDN** - быстрая доставка контента
- ✅ **Аналитика** - мониторинг производительности
- ✅ **Логи в реальном времени** - отладка проблем
- ✅ **Масштабирование** - автоматическое масштабирование

## Отладка проблем:

1. **Проверьте логи:**
   ```bash
   vercel logs https://your-vercel-url.vercel.app
   ```

2. **Проверьте переменные окружения:**
   ```bash
   vercel env ls
   ```

3. **Проверьте статус webhook:**
   ```bash
   curl https://api.telegram.org/bot7725254943:AAGHFlrj2oDfLxjrNaWjYuJ_nhUlgr2qLZU/getWebhookInfo
   ```

4. **Перезапустите деплой:**
   ```bash
   vercel redeploy https://your-vercel-url.vercel.app
   ```
