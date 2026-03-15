# MathViz Architect 📐

**Образовательная платформа по математике для учеников 5–11 классов.**

Интерактивные визуализации, адаптивные задачи и прогрессия тем в одном приложении — доступно в браузере и как desktop-приложение.

[![Version](https://img.shields.io/badge/version-3.1.0-blue)](https://github.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)](https://typescriptlang.org)
[![Netlify](https://img.shields.io/badge/Netlify-deployed-00c7b7)](https://www.grafana-intenstest.ru)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../../pulls)

**🌐 [grafana-intenstest.ru](https://www.grafana-intenstest.ru)** · Зеркало: [bespoke-travesseiro-b99785.netlify.app](https://bespoke-travesseiro-b99785.netlify.app)

<!-- TODO: Добавьте скриншот или GIF демонстрацию
![Demo](docs/demo.gif)
-->

---

## 📖 Содержание

- [Возможности](#-что-делает-проект-особенным)
- [Быстрый старт](#-быстрый-старт)
- [Стек технологий](#️-стек)
- [Архитектура](#️-архитектура)
- [Структура проекта](#-структура-проекта)
- [Режим задач](#-режим-задач)
- [Интерактивные модули](#-интерактивные-модули-18-шт)
- [Canvas-редактор](#️-canvas-редактор)
- [Учебная программа](#-учебная-программа)
- [Инфраструктура](#️-инфраструктура-supabase)
- [Статус реализации](#-статус-реализации)
- [Деплой](#-деплой)
- [Как добавить...](#-как-добавить)
- [Решение проблем](#-решение-проблем)
- [В разработке](#-в-разработке)
- [Участие в проекте](#-участие-в-проекте)
- [Лицензия](#-лицензия)

---

## ✨ Что делает проект особенным

| | |
|---|---|
| 🎯 **Skill-based прогрессия** | Темы разблокируются по мере прохождения — как в Duolingo |
| ⚙️ **Advanced Problem Engine** | LaTeX-рендеринг формул, символьные вычисления, сравнение эквивалентных выражений (1/2 = 0.5, √8 = 2√2) |
| 📊 **Интервалы и выражения** | Поддержка ответов в виде числовых промежутков [2; +∞), (-3; 5] и алгебраических выражений |
| 💡 **Система подсказок** | Динамическая помощь с прогрессивным раскрытием, влияет на алгоритм адаптивности |
| 🔬 **Визуальные модули** | 18 интерактивных объяснений: функции, геометрия, тригонометрия |
| 🖊️ **Canvas-редактор** | Геометрические фигуры, точки, отрезки, углы — с живой геометрией |
| 🤝 **Совместная работа** | Room-based холст в реальном времени — учитель делится ссылкой, ученик заходит без регистрации |
| 👩‍🏫 **Управление доской** | Три режима: лекция, совместная работа, ответ у доски |
| 👤 **Система ролей** | Teacher/Student на основе владения комнатой |
| 🖱️ **Курсоры участников** | Позиции всех участников отображаются на холсте в реальном времени |
| 🏗️ **Минималистичная архитектура** | DOM + CSS Grid вместо SVG, нет тяжёлых зависимостей |
| 🖥️ **Zen Mode** | Скрывает панели для работы у смарт-доски или проектора |
| ⌨️ **Клавиатурные shortcuts** | Ctrl+C/V/D/A, Undo/Redo, навигация колесом мыши |
| 🎨 **Интуитивная панель инструментов** | Пресеты цвета и толщины, единая кнопка "Поделиться" |
| 🖼️ **Вставка изображений** | Ctrl+V для вставки изображений из буфера обмена с мгновенным предпросмотром (Optimistic UI) |
| 📐 **Resize изображений** | Drag угловых handles для изменения размера с сохранением пропорций (Shift) |
| 🔄 **Properties Panel** | Современная панель с Transform, Rotation, Aspect Lock, Preview |
| 🔄 **Rotation pivot** | Вращение вокруг центра объекта (Figma-подобное поведение) |
| 🔍 **Viewport архитектура** | Бесконечный canvas с корректным zoom/pan без clipping |
| ☁️ **Supabase Storage** | Изображения сохраняются в Public Bucket 'assets' |
| 👩‍🏫 **Синхронизация страниц** | Ученики автоматически следуют за учителем в режиме лекции |

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+
- **pnpm** (рекомендуется) или npm

### Установка

```bash
# 1. Установить pnpm (если не установлен)
npm install -g pnpm

# 2. Клонировать репозиторий
git clone <repository-url> && cd mathviz-architect

# 3. Установить зависимости
pnpm install

# 4. Настроить переменные окружения
# Отредактируйте .env на основе .env.example (см. раздел Инфраструктура)

# 5. Запустить
pnpm run dev              # веб: http://localhost:5173
pnpm run dev:electron     # desktop (Electron)
```

### Скрипты

| Команда | Описание |
|---------|---------|
| `pnpm run dev` | Запуск dev-сервера |
| `pnpm run dev:electron` | Запуск Electron |
| `pnpm run build` | Сборка веб-версии |
| `pnpm run build:electron` | Сборка desktop |
| `pnpm run test:run` | Запуск тестов |
| `pnpm run lint` | Проверка линтером |
| `pnpm run preview` | Предпросмотр production |

---

## 🛠️ Стек

| Слой | Технологии |
|------|-----------|
| **Frontend** | React 18.3 · TypeScript 5.6 · Vite 6.0 · Tailwind 3.4 |
| **UI** | Radix UI · Lucide React |
| **Математика** | MathJS 15 (символьные вычисления) · KaTeX 0.16 (рендеринг формул) · normalizeMathExpression (нормализация) |
| **Desktop** | Electron 40.8 · Electron Builder |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Локальная БД** | Dexie.js 4 (IndexedDB) |
| **Совместная работа** | Yjs (CRDT) · Supabase Realtime (Broadcast) |
| **Валидация** | Zod |
| **Тесты** | Vitest |
| **Линтер** | ESLint |

---

## 🏗️ Архитектура

### Три независимых слоя

```
┌─────────────────────────────────────────────┐
│  SkillTree         Навигация по темам        │
│  CSS Grid, lanes по предметам                │
├─────────────────────────────────────────────┤
│  Problem Engine    Адаптивные задачи         │
│  Template → Variant → Assess → Adapt        │
├─────────────────────────────────────────────┤
│  Canvas + Modules  Визуализация              │
│  Редактор фигур + 18 интерактивных модулей  │
└─────────────────────────────────────────────┘
```

### Принципы архитектуры

| Принцип | Описание |
|---------|---------|
| **DOM over SVG** | CSS Grid решает позиционирование без ручных координат |
| **Simple layouts over algorithms** | Никакой топологической сортировки и graph layout |
| **Data-driven curriculum** | Темы, шаблоны, зависимости описываются данными, не кодом |
| **Components under 300 lines** | Превышение = сигнал к декомпозиции. Успешно реализовано: PropertiesPanel декомпозирован на 14 специализированных компонентов (ColorPicker, ShapeProperties, GeoShapeProperties, TextProperties, ArrowProperties, LineProperties, ChartProperties, FractionProperties, PenSettingsPanel и др.), а также новые: TransformSection, RotationSection, ImageSection, ActionSection |
| **Zero unnecessary dependencies** | Новая библиотека только при явной необходимости |
| **Refs-first state** | Критические данные доступны синхронно через refs, без ожидания рендера React |

### Room-based совместная работа

Учитель нажимает «Поделиться» → генерируется уникальный `roomId` → ссылка вида `?room=abc-123` копируется в буфер. Ученик открывает ссылку — оба работают на одном холсте в реальном времени без регистрации.

**Особенности реализации:**

- **Централизованный контекст:** Вся логика совместной работы инкапсулирована в `CollaborationProvider` (`src/hooks/useCollaborationContext.tsx`). Единый источник правды для состояния комнаты, ролей и прав доступа (`role`, `canEdit`, `boardSettings`).
- **Транспорт:** Синхронизация через **Supabase Realtime (Broadcast)**. Надёжная доставка сообщений всем участникам комнаты.
- **CRDT и State Sync:** Yjs CRDT для слияния изменений без конфликтов. Состояние холста (`Y.Map('canvas')`) и настройки доски (`Y.Map('board_settings')`) синхронизируются через кастомный `SupabaseProvider`. Настройки доски в Y.Doc гарантируют получение актуального состояния при переподключении.
- **Bootstrap синхронизация:** При подключении клиент отправляет `sync-request` с вектором состояния. Peer отвечает `sync-response` с дельтой — холст восстанавливается корректно. `onSynced` callback гарантирует что editor получает данные только после применения `sync-response`, не до него.
- **Защита от петель:** Локальные транзакции помечаются origin `'mathviz-local'`. Observer в `useYjsSync` пропускает их. `SupabaseProvider` не ретранслирует обновления с origin `this` (свои же remote applies).
- **Изоляция локального UI state:** Через Yjs синхронизируются только `objects`, `pages`, `activePageId`. Инструмент, zoom, выделение, курсор — строго локальные.
- **Явная публикация:** `publishLocalChange` вызывается только из Canvas после завершённых действий пользователя (mouseup, text commit, resize, property change и т.д.). Читает актуальный snapshot через `getCanvasSnapshot()` из refs — никогда не устаревает.
- **Курсоры участников:** `useAwareness` подключается к `SimpleAwareness` внутри `SupabaseProvider`. Позиции передаются через отдельный broadcast event `'awareness'`, throttled до 50ms. `RemoteCursors` оверлей отрисовывает курсоры поверх canvas.
- **Система ролей и режимов:**
  - **Роли:** `teacher` (владелец комнаты) и `student`.
  - **Режимы доски:**
    - `view`: Только учитель может редактировать.
    - `collaboration`: Все участники могут редактировать.
    - `student_turn`: Учитель и один выбранный ученик могут редактировать.

```
┌──────────────────────────────────────────────────────────────┐
│  CollaborationProvider  (useCollaborationContext.tsx)         │
│                                                              │
│  roomStateRef ─── исключает stale closure на isConnected     │
│  publishLocalChange() ─── единственный путь local → Yjs      │
│  canEdit ─── вычисляется из role + boardSettings             │
├──────────────────────────────────────────────────────────────┤
│  useYjsSync.ts          CRDT-синхронизация                   │
│                                                              │
│  Y.Doc( Y.Map('canvas'), Y.Map('board_settings') )           │
│  canvasObserver — только remote (origin ≠ 'mathviz-local')   │
│  publishCanvasChange — throttle 16ms, origin='mathviz-local' │
├──────────────────────────────────────────────────────────────┤
│  SupabaseProvider.ts    Транспортный слой                    │
│                                                              │
│  sync-request / sync-response — начальный обмен состоянием  │
│  broadcast:update — realtime дельты Yjs                      │
│  broadcast:awareness — курсоры и присутствие                 │
│  onSynced callback — bootstrap после применения sync-response│
├──────────────────────────────────────────────────────────────┤
│  Canvas.tsx + EditorContext   Применение состояния           │
│                                                              │
│  getCanvasSnapshot() ─── читает из refs, никогда не устарел  │
│  loadRemoteState() ─── setCanvasState, без CommandHistory    │
│  RemoteCursors ─── оверлей курсоров поверх SVG              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
src/
├── components/
│   ├── Canvas.tsx               # Холст рисования
│   ├── PropertiesPanel.tsx       # Панель свойств (обёртка)
│   ├── properties/              # Декомпозированные компоненты панели
│   │   ├── TransformSection.tsx  # X, Y, Width, Height + aspect lock
│   │   ├── RotationSection.tsx   # Slider + input + reset
│   │   ├── ImageSection.tsx      # Preview для изображений
│   │   └── ActionSection.tsx     # Duplicate, Delete, Front, Back
│   ├── canvas/
│   │   ├── ObjectRenderer.tsx    # Рендер объектов
│   │   ├── ImageResizeHandles.tsx # Угловые handles для resize
│   │   └── resizeImage.ts       # Логика resize
│   ├── room/
│   │   ├── TeacherControlPanel.tsx # Панель управления для учителя
│   │   └── RemoteCursors.tsx    # Оверлей курсоров участников
│   ├── SkillTree/
│   │   └── SkillTree.tsx        # Дерево тем (CSS Grid)
│   ├── interactive/             # 18 визуальных модулей
│   └── challenge/
│       └── ChallengeMode.tsx    # UI режима задач
│       └── MathText.tsx        # KaTeX рендер: $...$, дроби 1/2→\frac{1}{2}
├── lib/
│   ├── curriculum.ts            # Классы → предметы → темы
│   ├── topicGraph.ts            # Граф зависимостей (prerequisites)
│   ├── math/
│   │   └── normalization.ts     # normalizeMathExpression (1x→x, 1/2→\frac{1}{2})
│   ├── templates/               # Шаблоны задач
│   ├── supabase.ts              # Supabase клиент
│   ├── sync/
│   │   └── SupabaseProvider.ts  # Yjs транспорт + SimpleAwareness
│   └── engine/                  # Движок генерации и проверки задач
├── hooks/
│   ├── useAppState.ts           # Глобальное состояние холста (refs-first)
│   ├── useAuth.ts               # Supabase Auth (email/Google/anonymous)
│   ├── useRoom.ts               # Создание/вход в комнату
│   ├── useYjsSync.ts            # CRDT синхронизация через Supabase Broadcast
│   ├── useAwareness.ts          # Курсоры и присутствие участников
│   └── useCollaborationContext.tsx # Центральный провайдер совместной работы
└── contexts/
    └── EditorContext.tsx        # Глобальный контекст редактора
```

---

## 🎮 Режим задач

### Архитектурный цикл

```
Topic → ProblemSelector → VariantGenerator → UserAnswer
  → AssessmentEngine → AdaptiveEngine → next Topic
```

### Шаблон задачи

```typescript
interface ProblemTemplate {
  id: string
  class: number
  subject: 'algebra' | 'geometry' | 'probability' | 'logic'
  topic: string
  problemType: 'numeric' | 'comparison' | 'text' | 'magicSquare' | 'canvas_action'
  difficulties: Partial<Record<1 | 2 | 3 | 4, DifficultyConfig>>
  relatedModule?: string
}

interface DifficultyConfig {
  template: string                    // Текст задачи с LaTeX: $\frac{-b \pm \sqrt{D}}{2a}$
  parameters: Record<string, ParameterDef>  // Параметры для генерации
  answer_formula: string              // Формула для вычисления ответа
  hints?: string[]                    // Массив подсказок для прогрессивного показа
  answer_type?: AnswerType            // 'number' | 'fraction' | 'coordinate' | 'expression' | 'interval'
}

type AnswerType = 
  | 'number'      // Числовой ответ
  | 'fraction'    // Дробь (3/4)
  | 'coordinate'  // Координаты (3, 4)
  | 'expression'  // Алгебраическое выражение (x1=2, x2=5)
  | 'interval'     // Интервал [2; +inf), (-3; 5]
  | 'canvas_action'; // Экспериментальный: действие на холсте
```

### Weight-based Assessment (Система весов)

Использование подсказок влияет на расчёт прогрессии:

| Подсказок использовано | Вес ответа | Влияние |
|------------------------|------------|---------|
| 0 | 100% | Полный засчёт для серии |
| 1 | 50% | Частичный засчёт |
| 2+ | 0% | Не засчитывается для повышения сложности |

**Алгоритм:**
- 3 правильных ответа **без подсказок** → сложность +1
- Правильный ответ **с подсказкой** → не увеличивает счётчик серии
- Это мотивирует учеников сначала пытаться решить самостоятельно

### Адаптивный алгоритм

| Условие | Действие |
|---------|---------|
| 3 правильных подряд | difficulty +1 |
| 3 ошибок подряд | difficulty −1 |
| Accuracy > 80% (10 задач) | difficulty +1 |
| Accuracy < 40% (10 задач) | difficulty −1 |

---

## 🔬 Интерактивные модули (18 шт.)

Каждый модуль — отдельный React-компонент в `src/components/interactive/`. Layout: двухколоночный (график слева + панель управления справа).

Регистрация через `registerModule()` в `src/modules/index.ts`.

---

## 🖊️ Canvas-редактор

### Команды

Все изменения холста проходят через `CommandHistory` — поддержка Undo/Redo.

| Сочетание | Действие |
|-----------|----------|
| `Ctrl+Z` | Отменить (Undo) |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Повторить (Redo) |
| `Ctrl+C` | Копировать выбранные объекты |
| `Ctrl+V` | Вставить объекты из буфера |
| `Ctrl+D` | Ддублировать выбранные объекты |
| `Ctrl+A` | Выбрать все объекты на странице |
| `Delete` / `Backspace` | Удалить выбранные объекты |
| `Ctrl+Shift+V` | Вставить изображение из буфера обмена (Optimistic UI) |

### Resize изображений

При выделении изображения отображаются **4 угловых resize handles**:

```
┌───────◉
│       │
│ image │
│       │
◉───────◉
```

**Функции:**
- Drag handle → изменение width/height
- Shift → сохранение пропорций
- Min size: 40x40px
- Одно действие в истории (один Undo)

### Rotation

- Slider 0-360° + числовое поле + reset кнопка
- Вращение вокруг **центра объекта**
- Поддерживается для всех типов объектов (кроме line, chart, text, geoshape, geopoint, freehand)

### Навигация

| Действие | Результат |
|----------|-----------|
| `Scroll` | Перемещение по холсту (Pan) |
| `Ctrl + Scroll` | Масштабирование (Zoom: 30% – 200%) |
| `Space + Drag` | Перемещение по холсту |

### Инструменты Canvas

| Клавиша | Инструмент |
|---------|-----------|
| `V` | Выделение |
| `P` | Геоточка |
| `S` | Геоотрезок |
| `A` | Геоугол |
| `L` | Линия |
| `F` | Свободный рисунок |
| `T` | Текст |
| `E` | Ластик |

### Properties Panel

Панель свойств поддерживает:

| Секция | Описание |
|--------|----------|
| **Image Preview** | Миниатюра для изображений |
| **Transform** | X, Y, Width, Height + lock соотношения сторон |
| **Rotation** | Slider + input + reset кнопка |
| **Actions** | Duplicate, Delete, Bring to Front, Send to Back |

**Aspect Ratio Lock:**
- Lock button между Width и Height
- При изменении width → автоматически меняется height (и наоборот)
- Shift при drag resize также сохраняет пропорции

---

### Canvas Архитектура (Viewport + World)

```
┌─────────────────────────────────┐   ← viewport (overflow:hidden)
│   ┌─────────────────────────┐   │
│   │    canvas-world        │   │  ← transform: translate(pan) scale(zoom)
│   │    ┌───────────────┐   │   │
│   │    │   SVG (static)│   │   │  ← 800x600 logical canvas
│   │    └───────────────┘   │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Преимущества:**
- Zoom и pan не ограничены размером экрана
- Pointer events корректно конвертируются через viewport rect
- Бесконечный canvas для рисования

---

## 📚 Учебная программа

Структура определяется данными, не кодом:

```
curriculum.ts     — список тем по предметам и классам
topicGraph.ts     — prerequisites (что нужно пройти перед темой)
problemTemplates  — шаблоны задач для каждой темы
```

**Классы:** 5–11 (9–11: расширенная поддержка с LaTeX, интервалами, выражениями)
**Предметы:** числа · дроби · алгебра · геометрия · тригонометрия

---

## 🏛️ Инфраструктура (Supabase)

### Таблицы

| Таблица | Описание |
|---------|---------|
| `user_progress` | Прогресс ученика по темам с RLS по `user_id` |
| `sync_queue` | Локальная очередь (IndexedDB) для офлайн-first синхронизации |
| `sync_log` | Лог синхронизаций для отладки |
| `rooms` | Совместные комнаты холста с RLS по `owner_id` |
| `problems` | Шаблоны задач (seed через скрипт) |

### Схема таблицы `rooms`

| Поле | Тип | Описание |
|------|-----|---------|
| `id` | `text` | Уникальный идентификатор комнаты (`abc-123-xyz`) |
| `owner_id` | `uuid` | `auth.uid()` создателя комнаты |
| `canvas_data` | `jsonb` | Снапшот холста при закрытии комнаты |
| `is_active` | `boolean` | Флаг активности — `false` после `closeRoom()` |
| `expires_at` | `timestamptz` | Время жизни комнаты (24 часа от создания) |

RLS policies: `SELECT` открыт для всех авторизованных; `INSERT/UPDATE` разрешён только `owner_id = auth.uid()`.

### Локальная БД (IndexedDB / Dexie)

| Таблица | Описание |
|---------|---------|
| `user_progress` | Прогресс по темам — читается/пишется через `useStudentProgress` |
| `sync_queue` | Очередь изменений для отправки в Supabase |

Хук `useStudentProgress` автоматически пишет в `sync_queue` при каждом ответе и вызывает `triggerSync()`. При недоступности IndexedDB — fallback на `localStorage`.

### Supabase Auth

- **Email/Password** — для учителей с аккаунтом
- **Anonymous** — для учеников в совместных комнатах (без регистрации)
- Миграция: офлайн-данные переносятся в Supabase при первом входе

### Загрузка данных

```bash
npx tsx scripts/seedProblems.ts   # загрузить шаблоны в БД
```

### Supabase Storage

Для загрузки изображений (Ctrl+V) требуется **Public Bucket** с именем `assets`:

1. Откройте **Supabase Dashboard** → **Storage**
2. Создайте новый bucket: **New bucket**
3. Имя: `assets`
4. **Public bucket**: включить (Public)
5. **Save**

Настройте RLS policy для anonymous доступа:

```sql
-- Разрешить чтение всем
create policy "Public Access - Read"
on storage.objects for select
using ( bucket_id = 'assets' );

-- Разрешить запись авторизованным пользователям
create policy "Authenticated - Upload"
on storage.objects for insert
with check ( bucket_id = 'assets' AND auth.role() IN ('authenticated', 'anon') );
```

### Переменные окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

```env
# Обязательные
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Только для seed-скриптов
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ✅ Статус реализации

> Этот раздел описывает систему совместной работы, реализованную в текущей кодовой базе. Предназначен для новых разработчиков, которые хотят разобраться в архитектуре коллаборации.

Система совместной работы состоит из четырёх независимых слоёв, связанных через React-хуки:

```
┌──────────────────────────────────────────────────────────────┐
│  CollaborationProvider       Центральный узел                │
│  src/hooks/useCollaborationContext.tsx                        │
├──────────────────────────────────────────────────────────────┤
│  useYjsSync.ts       CRDT-синхронизация                      │
│  Y.Doc · Supabase Broadcast Provider · loop protection       │
├──────────────────────────────────────────────────────────────┤
│  useAwareness.ts     Курсоры и присутствие                   │
│  SimpleAwareness · broadcast:awareness · throttle 50ms       │
├──────────────────────────────────────────────────────────────┤
│  Canvas.tsx + EditorContext   Применение состояния           │
│  getCanvasSnapshot() · loadRemoteState() · RemoteCursors     │
└──────────────────────────────────────────────────────────────┘
```

---

### Room Management (`src/hooks/useRoom.ts`)

Хук управляет жизненным циклом совместной комнаты.

**Создание комнаты (учитель):**

```
handleShare()
  → createRoom()
  → ensureAnonAuth()
  → supabase.from('rooms').insert(...)
  → URL обновляется на ?room=abc-123
  → copyRoomLink()
```

**Подключение к комнате (ученик):**

```
Открытие URL ?room=abc-123
  → joinRoom(roomId)
  → ensureAnonAuth()
  → supabase.from('rooms').select(...)
  → setRoomState({ roomId, role, isConnected })
```

---

### Real-Time Synchronization (`src/hooks/useYjsSync.ts`)

Хук инкапсулирует всю логику CRDT-синхронизации через Yjs и кастомный `SupabaseProvider`.

**Bootstrap синхронизация:**

При подключении клиент отправляет `sync-request` с вектором состояния Yjs. Peer отвечает `sync-response` с дельтой. `SupabaseProvider` вызывает `onSynced` callback только **после** применения `sync-response` — это гарантирует что editor получает данные в правильный момент, не раньше.

Если никто не ответил за 2 секунды (учитель первый в комнате) — `onSynced` срабатывает по таймауту.

**Защита от бесконечных циклов:**

Двойной барьер: локальные транзакции помечаются origin `'mathviz-local'` — observer их пропускает. Провайдер применяет входящие updates с origin `this` — `onLocalUpdate` их не ретранслирует. Оба барьера независимы.

**Явная публикация:**

`publishCanvasChange` вызывается только из Canvas после завершённых действий (mouseup, text commit, etc.). Читает актуальный snapshot через `getCanvasSnapshot()` из refs в `useAppState` — не зависит от цикла рендера React, никогда не устаревает. Throttled до 16ms (~60fps).

**Изоляция локального UI state:**

Через Yjs синхронизируются только: `objects`, `pages`, `activePageId`. Никогда не синхронизируются: activeTool, zoom, panOffset, selectedObjectIds, hover, временные фигуры.

---

### Canvas Integration (`src/components/Canvas.tsx`)

`Canvas.tsx` потребляет `useCollaborationContext`, получая `canEdit`, `publishLocalChange` и `updateCursor`. После каждого завершённого действия пользователя Canvas явно вызывает `publishLocalChange(getCanvasSnapshot())` — это единственный путь локальных изменений в Yjs.

`RemoteCursors` (`src/components/room/RemoteCursors.tsx`) — оверлей поверх SVG холста, отображает курсоры всех подключённых участников. Позиции конвертируются из canvas-координат в screen-координаты с учётом `zoom` и `panOffset`.

### Awareness (`src/hooks/useAwareness.ts`)

Подключается к `SimpleAwareness` внутри `SupabaseProvider` через `getProvider()`. Каждый клиент транслирует `{ name, color, cursor }` через broadcast event `'awareness'`. Throttle 50ms (20fps) предотвращает перегрузку канала при движении мыши. При размонтировании или уходе мыши с холста — `setLocalState(null)`, курсор исчезает у остальных участников.

---

## 🌐 Деплой

| Хостинг | Способ |
|---------|--------|
| **GitHub Pages** | Автодеплой через Actions при push в `main` |
| **Netlify** | Drag & drop папки `dist/` |
| **Vercel** | `vercel --prod` |

> ⚠️ **Важно (SPA):** сервер должен возвращать `index.html` на все 404.

<details>
<summary><strong>GitHub Pages — настройка (один раз)</strong></summary>

1. Settings → Pages → Source: **"GitHub Actions"**
2. Settings → Actions → General → **"Read and write permissions"**

</details>

---

## 🔧 Как добавить...

### ...новый шаблон задачи

**Файл:** `src/lib/templates/grade*/`

```typescript
// ...
difficulties: {
  1: { 
    template: 'Решите уравнение: $x^2 + {b}x + {c} = 0$',
    parameters: {
      r1: { type: 'int', min: 1, max: 5 },
      r2: { type: 'int', min: 1, max: 5 },
      b: { type: 'expression', value: '-(r1 + r2)' },
      c: { type: 'expression', value: 'r1 * r2' }
    },
    answer_formula: 'Math.min(r1, r2)',
    constraints: ['r1 !== r2'],
    hint: 'Найдите корни уравнения',
    solution: [
      { explanation: '$x^2 + {b}x + {c} = (x-{r1})(x-{r2})$' },
      { explanation: 'Ответ:', result: '$x = {r1}$ или $x = {r2}$' },
    ]
  },
},
// ...
```

**Требования:**
- Формулы LaTeX оборачивай в `$...$` (инлайн) или `$$...$$` (блок).
- Внутри формул используй `^` для степеней: `x^2`, не `x²`.
- Дроби 5-7 классов (например `1/2`, `a/b`) автоматически конвертируются в LaTeX: `1/2` → `$\frac{1}{2}$`.
- Используй паттерн "build from answer" для гарантии валидных решений.
- Для геометрии с прямоугольными треугольниками — ТОЛЬКО пифагоровы тройки.
- Проверка: `pnpm test:templates`.

### ...новый интерактивный модуль

1. Создать компонент в `src/components/interactive/`
2. Зарегистрировать в `src/modules/index.ts` через `registerModule()`

---

## ⚠️ Известные ограничения

| Ограничение | Описание |
|-------------|---------|
| **Expression parser** | Работает только с числовыми выражениями. Строковые `choice`-параметры нельзя использовать в `answer_formula`. |
| **Numeric answer_formula** | Все шаблоны с `problemType: 'numeric'` должны возвращать числовое значение, не строку. |
| **canvas_action** | Экспериментальный тип — требует интеграции с интерактивными модулями |

---

## 🐛 Решение проблем

<details>
<summary><strong>Не запускается веб-версия</strong></summary>

```bash
rm -rf node_modules && pnpm install && pnpm run dev
```
</details>

<details>
<summary><strong>Нужен доступ по сети</strong></summary>

```bash
pnpm run dev -- --host
```
</details>

<details>
<summary><strong>Ошибки TypeScript</strong></summary>

Ожидается TypeScript ~5.6.2:
```bash
pnpm list typescript
```
</details>

<details>
<summary><strong>Electron не запускается</strong></summary>

```bash
pnpm run build && pnpm run electron
```
</details>

<details>
<summary><strong>Supabase запросы блокируются антивирусом (локально)</strong></summary>

Kaspersky и некоторые другие антивирусы перехватывают HTTPS трафик к внешним доменам при работе с `localhost`. Это проблема только в dev-режиме — на продакшене работает корректно.

Решение: добавить `*.supabase.co` в исключения антивируса, или проверять на задеплоенной версии.
</details>

<details>
<summary><strong>Ученик не видит изменения учителя в реальном времени</strong></summary>

Открой DevTools → Console в обоих окнах. Должна быть цепочка логов:

```
[provider] subscribed — sending sync-request
[provider] received broadcast:sync-response
[provider] onSynced fired
```

После действия учителя:
```
[provider] broadcasting local update N bytes
[provider] received broadcast:update N bytes   ← на стороне ученика
[yjs] canvasObserver delivering to editor: N objects
[collab] remote canvas update received N objects
```

Если `received broadcast:update` отсутствует — проверь RLS политики Supabase Realtime на таблице `rooms` и убедись что оба клиента авторизованы (`ensureAnonAuth` завершился успешно).
</details>

---

## 🚧 В разработке

- [ ] Шаблоны задач 7 класса (алгебра + геометрия)
- [ ] Расширение шаблонов 8 класса (новые темы)
- [ ] Property-based тестирование шаблонов (fast-check + variantGenerator)
- [ ] Debug-страница `/debug/templates`
- [ ] Дополнительные интерактивные модули (интегралы, 3D сечения)
- [ ] Удаление debug-логов из SupabaseProvider перед релизом
- [x] **MathJS интеграция** — символьные вычисления для expression/interval типов
- [x] **KaTeX рендеринг** — LaTeX формулы в задачах
- [x] **MathText парсер** — parseMathText разбивает текст по разделителям $...$ и $$...$$
- [x] **MathText нормализация** — normalizeMathExpression исправляет 1x→x, +-+→-, :→÷
- [x] **Авто-конвертация дробей** — 1/2 → \frac{1}{2}, a/b → \frac{a}{b}, x^2/y → \frac{x^2}{y}
- [x] **Система подсказок** — прогрессивное раскрытие + веса ответов
- [x] **Weight-based Assessment** — 0/50%/0% вес ответа в зависимости от подсказок
- [x] **expression / interval answer types** — интервалы [2; +∞), выражения x1=2
- [x] **canvas_action тип** — экспериментальная поддержка заданий на холсте
- [x] **Viewport + World architecture** — исправлен clipping при zoom/pan
- [x] **Rotation pivot** — вращение вокруг центра объекта
- [x] **Aspect ratio lock** — Lock button в Properties Panel
- [x] **Properties Panel refactoring** — декомпозиция на TransformSection, RotationSection, ImageSection, ActionSection
- [x] **Image resize handles** — drag угловых handles для изменения размера
- [x] **Performance optimization** — React.memo для ObjectRenderer, кастомный comparison для предотвращения cascade re-renders
- [x] **PropertiesPanel decomposition** — декомпозиция на 14 специализированных компонентов (все менее 300 строк)
- [x] **Browser zoom fix** — нативный wheel listener с `passive: false` предотвращает зум браузера при Ctrl+Scroll
- [x] **Enhanced PenSettingsPanel** — пресеты цвета (6 цветов), пресеты толщины (3 кнопки с иконками), live preview
- [x] **High-impact keyboard shortcuts** — Ctrl+C/V/D/A, Delete/Backspace с правильной обработкой полей ввода
- [x] **Streamlined Share logic** — единая кнопка "Поделиться" в TopBar, удалён дублирующий floating button из Canvas
- [x] **Image paste support (Optimistic UI)** — Ctrl+V для вставки изображений из буфера обмена с мгновенным предпросмотром через blob URL
- [x] **Page sync (Lecture Mode)** — студенты автоматически следуют за учителем в режиме просмотра
- [x] **Курсоры участников на совместном холсте** (SimpleAwareness + RemoteCursors)
- [x] **Production-стабильная синхронизация** (loop protection, stale closure fix, bootstrap timing)
- [x] **Изоляция локального UI state** (tool, zoom, selection не синхронизируются)
- [x] **Явная публикация через `publishLocalChange`** (нет автоматических useEffect-петель)
- [x] **`getCanvasSnapshot()` из refs** (публикация всегда актуального state)
- [x] **`onSynced` callback в SupabaseProvider** (bootstrap после sync-response, не до)
- [x] **Type guards в SupabaseProvider** (production TypeScript без `as any`)
- [x] Замена y-webrtc на Supabase Realtime (Broadcast)
- [x] Централизованный контекст управления (CollaborationProvider)
- [x] Room-based совместный холст (Yjs CRDT + Supabase)
- [x] Стабилизация шаблонов 8 класса
- [x] Переработка теоремы Виета (4 типа задач с числовыми ответами)
- [x] Валидация шаблонов через Zod
- [x] Замена `localStorage` на IndexedDB (Dexie.js)
- [x] Supabase схема: `user_progress` + `sync_log` с RLS
- [x] Supabase Auth (email/password + анонимный вход)
- [x] Синхронизация `sync_queue` → Supabase
- [x] Миграция офлайн-данных при первом входе
- [x] Bootstrap синхронизация: ученик сразу видит холст учителя
- [x] Кнопка «Поделиться» в Canvas с копированием ссылки
- [x] `loadRemoteState()` / `setCanvasState()` в EditorContext (без записи в CommandHistory)

---

## 🤝 Участие в проекте

Мы приветствуем вклад в развитие проекта!

### Как внести вклад

1. **Fork** репозитория
2. Создайте **feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit** изменения: `git commit -m 'Add amazing feature'`
4. **Push** в branch: `git push origin feature/amazing-feature`
5. Откройте **Pull Request**

### Что можно улучшить

- 📝 Новые шаблоны задач для 7–11 классов
- 🎨 Новые интерактивные модули
- 🐛 Исправление багов
- 📖 Улучшение документации
- 🌍 Локализация

> Перед большими изменениями рекомендуем [создать Issue](../../issues) для обсуждения.

---

## 📄 Лицензия

<!-- TODO: Укажите конкретную лицензию (MIT, GPL, Apache, etc.) -->
Проект создан для образовательных целей.

---

**Автор:** Timur — основной разработчик

📫 [Создать Issue](../../issues) · ⭐ [Поставить звезду](../../stargazers)

---

**Приятной работы! 🚀**
