# MathViz Architect 📐

**Образовательная платформа по математике для учеников 5–11 классов.**

Интерактивные визуализации, адаптивные задачи и прогрессия тем в одном приложении — доступно в браузере и как desktop-приложение.

[![Version](https://img.shields.io/badge/version-3.2.0-blue)](https://github.com)
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
- [Coordinate System Protocol](#coordinate-system-protocol)
- [MathInput Module](#-mathinput-module)
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
| ⚛️ **High-School Math Engine** | Equivalence checks, interval parsing, and advanced function support for grades 9-11 curriculum. |
| 📊 **Интервалы и выражения** | Поддержка ответов в виде числовых промежутков [2; +∞), (-3; 5] и алгебраических выражений |
| 💡 **Система подсказок** | Динамическая помощь с прогрессивным раскрытием, влияет на алгоритм адаптивности |
| 🔬 **Визуальные модули** | 18 интерактивных объяснений: функции, геометрия, тригонометрия |
| 🖊️ **Canvas-редактор** | Геометрические фигуры, точки, отрезки, углы, свободный рисунок, маркер-выделитель, умный карандаш с Ink-to-Shape — с живой геометрией и умными привязками (вершины, середины, пересечения, on-path) |
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
| 🎨 **Панель свойств** | Визуальные пресеты цвета и толщины для всех типов объектов — без лишних технических параметров. При активном инструменте рисования (Карандаш, Выделитель) панель зафиксирована и не исчезает после каждого штриха |
| 📱 **Мобильная адаптация** | Responsive layout для всех модулей, компактная клавиатура, Bottom Sheet панель свойств, pointer events для touch/stylus |
| 🔄 **Rotation pivot** | Вращение вокруг центра объекта (Figma-подобное поведение) |
| 🔍 **Viewport culling** | Рендерятся только объекты в текущем viewport — производительность не деградирует при 500+ объектах |
| ☁️ **Supabase Storage** | Изображения сохраняются в Public Bucket 'assets' |
| 👩‍🏫 **Синхронизация страниц** | Ученики автоматически следуют за учителем в режиме лекции |
| 📐 **MathInput Module** | Универсальный ввод с KaTeX-превью, виртуальная клавиатура с 3 раскладками (числа, алгебра, интервалы), защита токенов и Smart Backspace. |
| ✍️ **Natural Math Input** | Ввод выражений в формате `a/b`, `sqrt(x)`, `2^3` — без знания LaTeX. Автоматическая конвертация в `\frac{a}{b}`, `\sqrt{x}` в слое рендеринга. |

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
| **UI** | Radix UI · Lucide React · vaul (bottom sheet) |
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
| **Components under 300 lines** | Превышение = сигнал к декомпозиции. Успешно реализовано: PropertiesPanel декомпозирован на 14 специализированных компонентов (ColorPalette, StrokeWidthSlider, ShapeProperties, GeoShapeProperties, TextProperties, ArrowProperties, LineProperties, ChartProperties, FractionProperties, PenSettingsPanel и др.), а также ImageSection |
| **Zero unnecessary dependencies** | Новая библиотека только при явной необходимости |
| **Refs-first state** | Критические данные доступны синхронно через refs, без ожидания рендера React |

### Room-based совместная работа

Учитель нажимает «Поделиться» → генерируется уникальный `roomId` → ссылка вида `?room=abc-123` копируется в буфер. Ученик открывает ссылку — оба работают на одном холсте в реальном времени без регистрации.

**Особенности реализации:**

- **Централизованный контекст:** Вся логика совместной работы инкапсулирована в `CollaborationProvider` (`src/hooks/useCollaborationContext.tsx`). Единый источник правды для состояния комнаты, ролей и прав доступа (`role`, `canEdit`, `boardSettings`).
- **Транспорт:** Синхронизация через **Supabase Realtime (Broadcast)**. Надёжная доставка сообщений всем участникам комнаты.
- **CRDT и State Sync:** Yjs CRDT для слияния изменений без конфликтов. Состояние холста (`Y.Map('canvas')`) и настройки доски (`Y.Map('board_settings')`) синхронизируются через кастомный `SupabaseProvider`. Настройки доски в Y.Doc гарантируют получение актуального состояния при переподключении.
- **Bootstrap синхронизация:** При подключении клиент отправляет `sync-request` с вектором состояния. Peer отвечает `sync-response` с дельтой — холст восстанавливается корректно. `onSynced` callback гарантирует что editor получает данные только после применения `sync-response`, не до него. Провайдер отслеживает фазу синхронизации (`idle` → `waiting_response` → `synced`): если peer обнаружен (получен его `sync-request`), но не ответил в течение 2s — в лог пишется предупреждение о возможно неполном состоянии.
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
│   ├── Canvas.tsx               # Холст рисования (pointer events, touch-action: none)
│   ├── PropertiesPanel.tsx       # Панель свойств (sidebar на десктопе / bottom sheet на мобильном)
│   ├── MobileBottomSheet.tsx     # vaul-based bottom sheet для мобильных
│   ├── properties/              # Хост-компонент панели свойств
│   │   └── ImageSection.tsx      # Preview для изображений
│   ├── PropertiesPanel/         # Специализированные компоненты свойств
│   │   ├── ColorPalette.tsx      # Сетка 4×2 пресетов цвета + transparent
│   │   ├── StrokeWidthSlider.tsx # Ползунок толщины 1–10
│   │   ├── ShapeProperties.tsx   # Заливка, цвет контура, толщина
│   │   ├── LineProperties.tsx    # Цвет линии, толщина
│   │   ├── ArrowProperties.tsx   # Цвет стрелки, толщина
│   │   ├── GeoShapeProperties.tsx
│   │   ├── GeoSegmentProperties.tsx
│   │   ├── GeoAngleProperties.tsx
│   │   ├── GeoPointProperties.tsx
│   │   ├── TextProperties.tsx
│   │   ├── FractionProperties.tsx
│   │   ├── ChartProperties.tsx
│   │   └── PenSettingsPanel.tsx
│   ├── canvas/
│   │   ├── ObjectRenderer.tsx    # Рендер объектов
│   │   ├── ImageResizeHandles.tsx # Угловые handles для resize
│   │   ├── resizeImage.ts       # Логика resize
│   │   └── tools/
│   │       ├── useFreehandTool.ts    # Хук свободного рисунка
│   │       └── useHighlighterTool.ts # Хук маркера-выделителя (Выделитель)
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
│   │   └── normalization.ts     # normalizeMathExpression pipeline + normalizeNumbers (единый слой нормализации чисел)
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
│   ├── useIsMobile.ts           # matchMedia hook, true при viewport < 768px
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
  | 'expression'  // Алгебраическое выражение (x1=2, x2=5) или иррациональное (sqrt(89))
  | 'interval'     // Интервал [2; +inf), (-3; 5]
  | 'canvas_action'; // Экспериментальный: действие на холсте
```

### Template Authoring Rules

> Обязательные правила при написании шаблонов задач. Нарушение приводит к артефактам вида `"" + "\\frac" + ...` в UI.

| Правило | Верно | Неверно |
|---------|-------|---------|
| Подстановка параметров | `{a}x + {b}` | `` `${a}x + ${b}` `` |
| LaTeX-дроби в `result` | `\\frac{{a}}{{b}}` | `a + "/" + b` |
| Логика вычислений | в `answer_formula` | в строках `template`/`result` |
| Строковая конкатенация | ❌ запрещена | `"" + "\\frac" + ...` |
| Иррациональный ответ (sqrt) | `result: 'sqrt({sum})'` | `result: 'Math.sqrt(a*a + b*b)'` |
| Текстовый ответ (да/нет) | `answer_type: 'text'` + `result: '{answer}'` | `result: '{isRight} === 1 ? "да" : "нет"'` |
| Гарантированно валидные данные | `type: 'choice'` из пифагоровых троек | широкие диапазоны `int` + constraint |

**Ключевые ограничения:**

- ❗ В полях `template` и `result` разрешена **только** `{param}` substitution. JS-выражения, шаблонные строки и конкатенация запрещены — они не вычисляются движком и попадают в UI как есть.
- ❗ `answer_formula` предназначен **только** для вычисления числового ответа. Не используйте его для построения строк с LaTeX.
- LaTeX-дроби всегда пишутся как `\\frac{числитель}{знаменатель}` — никогда как `числитель/знаменатель` в `result`.
- Вся логика (условия, ветвления, вычисления) выносится в `parameters`, а не в строки шаблона.
- Для иррациональных ответов используйте `answer_type: 'expression'`. Промежуточные суммы (`sum`, `diff`, `dsum`) выносятся в `expression`-параметры — движок вычисляет их до рендеринга, LaTeX получает готовые числа: `$\\sqrt{{sum}}$` → `$\\sqrt{89}$`.
- Для текстовых ответов (`"да"`/`"нет"`) используйте `answer_type: 'text'` и `result: '{answer}'` — специальный placeholder подставляет результат `answer_formula` напрямую.
- Для задач где constraint выполняется редко (например пифагоровы тройки) используйте `type: 'choice'` с индексом и expression-параметрами для вычисления сторон — это гарантирует валидные данные за 0 итераций вместо 100.

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

### Геймификация (Duolingo-стиль)

Режим задач включает элементы геймификации для повышения мотивации:

| Элемент | Описание |
|---------|---------|
| **Session Progress Bar** | Прогресс-бар в верхней части экрана (сессия из 10 задач) |
| **Streak Counter** | 🔥 бейдж с количеством правильных ответов подряд (сбрасывается при ошибке или подсказке) |
| **Hint Penalty UI** | Прозрачность штрафов: "Первая подсказка: -50% баллов", "Следующая подсказка: 0 баллов" |

**Логика стрика:**
- Правильный ответ → streak +1
- Неправильный ответ → streak = 0
- Использование подсказки → streak = 0 (штраф за подсказку)

### Адаптивный алгоритм

За один ответ применяется только одно правило (приоритет: streak > accuracy):

| Условие | Действие |
|---------|---------|
| 3 правильных подряд | difficulty +1 (сбрасывает счётчик) |
| 3 ошибок подряд | difficulty −1 (сбрасывает счётчик) |
| Accuracy > 80% (10 задач) | difficulty +1 (если streak не сработал) |
| Accuracy < 40% (10 задач) | difficulty −1 (если streak не сработал) |

### Компоненты движка задач

**`variantGenerator.ts`** — генерирует варианты задач из шаблонов. Все промежуточные вычисления (`a²`, `b²`, `sum`, `c_val`) выносятся в `parameters` типа `expression` и вычисляются до рендеринга. Ответы типа `Math.sqrt(N)` автоматически конвертируются: точный квадрат → целое число, иррациональный → строка `"sqrt(N)"`.

**`answerValidator.ts`** — валидирует ответы. Для ответов типа `sqrt(N)` поддерживает числовое сравнение через `math.evaluate` независимо от переданного `answerType` — `"sqrt(89)"` и `9.434...` считаются эквивалентными.

**`MathText.tsx`** — рендерит текст с LaTeX через KaTeX. Поддерживает сырые LaTeX-команды (`\sqrt{N}`, `\frac{a}{b}`) вне `$...$` блоков — автоматически сплиттит строку и рендерит их как inline math.

---

## 🔬 Интерактивные модули (18 шт.)

Каждый модуль — отдельный React-компонент в `src/components/interactive/`. Layout: двухколоночный на десктопе (график слева + панель управления справа), одноколоночный на мобильных (<768px, график сверху + панель снизу с `max-h-64`).

Регистрация через `registerModule()` в `src/modules/index.ts`.

---

## 🖊️ Canvas-редактор

### Command System

Все мутации холста проходят через паттерн **Command** (`src/lib/commands/`). Это обеспечивает:

- **Undo/Redo** — детерминированные переходы состояния через `CommandHistory`
- **Предсказуемость** — каждое действие инкапсулирует `execute()` и `undo()`

Примеры команд: `ClearCanvasCommand`, `ResizeObjectCommand`, `MoveObjectsCommand`.

> При добавлении нового инструмента, изменяющего объекты, интегрируй его через команду — не через прямой вызов `updateObject`.

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
| `F` | Свободный рисунок (Карандаш) |
| `H` | Выделитель (Highlighter) |
| `T` | Текст |
| `E` | Ластик |

**Highlighter (Выделитель):**

Инструмент для полупрозрачного выделения частей геометрических фигур (например, для демонстрации равенства или подобия треугольников) без перекрытия нижележащих штрихов.

- Толщина штриха: ~28px по умолчанию
- Прозрачность: `opacity: 0.4`
- Режим наложения: `mix-blend-mode: multiply` — реалистично затемняет область под маркером, не закрашивает её
- Реализован как вариант `FreehandTool` (`useHighlighterTool` в `src/components/canvas/tools/`)
- Объект типа `HighlighterObject` хранится отдельно от `FreehandPathObject` в `AnyCanvasObject`

### Properties Panel

Панель свойств отображает только визуальные параметры выбранного объекта — без технических координат и размеров. Если активен инструмент рисования (`freehand`, `highlighter`), панель показывает настройки инструмента и остаётся видимой после каждого штриха — рисование не сбрасывает контекст на "Выберите объект".

| Секция | Описание |
|--------|----------|
| **Image Preview** | Миниатюра для изображений |
| **ColorPalette** | Сетка 4×2 пресетов цвета + transparent (SVG-диагональ) |
| **StrokeWidthSlider** | Ползунок толщины 1–10 с числовым индикатором |

Метки на русском языке: "Заливка", "Цвет контура", "Цвет линии", "Цвет стрелки", "Толщина".

**Mobile Bottom Sheet:**

На мобильных устройствах (<768px) панель свойств рендерится как vaul bottom sheet вместо правого сайдбара:
- `modal={false}` — холст остаётся интерактивным пока открыт sheet
- `snapPoints={[0.4]}` — занимает 40vh, оставляя холст видимым
- Drag handle для закрытия
- Реализовано в `MobileBottomSheet.tsx` + `useIsMobile.ts`

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
│   │    │   SVG (2000x2000)│  │   │  ← логический canvas
│   │    └───────────────┘   │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Преимущества:**
- Zoom и pan не ограничены размером экрана
- Pointer events корректно конвертируются через viewport rect
- Бесконечный canvas для рисования
- **Viewport culling** (`useViewportCulling`): рендерятся только объекты в текущем viewport ± 150px. Hit-testing, eraser и snap всегда работают с полным списком объектов.

**Декомпозиция инструментов:**

Инструменты с изолированным lifecycle вынесены в отдельные хуки в `src/components/canvas/tools/`:

| Хук | Инструмент | Что инкапсулирует |
|-----|-----------|-------------------|
| `useFreehandTool` | Свободный рисунок | refs-first state, точки, `onMouseDown/Move/Up`, `finalize()`, `abort()`, overlay, поддержка tap/drag/stylus |
| `useHighlighterTool` | Выделитель | то же, что `useFreehandTool`; создаёт `HighlighterObject` вместо `FreehandPathObject` |
| `useSmartPencilTool` | Умный карандаш | то же, что `useFreehandTool` + stroke smoothing pipeline + Ink-to-Shape detection |

Оба хука используют единую модель ввода: `isDrawingRef` (не React state) как авторитетный флаг, `finalize()` для фиксации штриха и `abort()` для отмены без создания объекта. Overlay управляется внутри хука — Canvas не хранит его.

**Live Drawing Overlay:**

Пока пользователь рисует, штрих отображается через временный overlay-слой прямо в SVG — без записи в список объектов. Overlay управляется самим хуком инструмента (`setOverlay` внутри `useFreehandTool` / `useHighlighterTool`), а не Canvas. Это гарантирует:

- Overlay очищается при `pointerup`, `pointercancel` и переключении инструмента.
- Ghost-оверлеи невозможны: overlay существует только пока `isDrawingRef.current === true`.
- React не перерисовывает весь список объектов при каждом движении — только overlay-элемент.

Финальный объект добавляется через `onAddObject` только в `finalize()`.

**Touch / Stylus поддержка:**

Canvas использует `onPointerDown/Move/Up/Cancel` вместо mouse-событий и `touch-action: none` на контейнере — браузер не перехватывает скролл при рисовании. `ImageResizeHandles` также переведён на pointer events.

Поддерживаемые типы ввода: мышь, touch, стилус (pen). Некоторые стилусы (например, Wacom в режиме совместимости) сообщают `pointerType === 'mouse'` — они корректно обрабатываются через проверку `button === 0`.

Унифицированное определение рисующего ввода:

```ts
const isDrawingInput =
  e.pointerType === 'pen' ||
  e.pointerType === 'touch' ||
  (e.pointerType === 'mouse' && e.button === 0);
```

**Полный lifecycle указателя:**

| Событие | Действие |
|---------|---------|
| `pointerdown` | `setPointerCapture` + старт штриха (`onMouseDown`) |
| `pointermove` | добавление точки (`onMouseMove`) через `isDrawingRef` — не stale state |
| `pointerup` | `releasePointerCapture` + `finalize()` — объект создаётся |
| `pointercancel` | `releasePointerCapture` + `abort()` — объект НЕ создаётся |

`pointercancel` — принудительное прерывание (например, системный жест, потеря захвата). Всегда вызывает `abort()`, а не `finalize()`.

Pointer capture (`setPointerCapture`) удерживает события даже когда указатель выходит за пределы canvas — рисование продолжается. `releasePointerCapture` вызывается в `pointerup` и `pointercancel` с `try/catch` на случай если захват уже был снят.

**Модель состояния ввода:**

- `isDrawingRef` (`useRef`) — авторитетный флаг реального времени, никогда не устаревает в callbacks
- `isDrawing` (React state) — только для UI (overlay рендеринг)
- `pointsRef` — накапливает точки без ре-рендера
- `finalize()` / `abort()` — единственные пути завершения штриха

**Tap (одиночный клик → точка):**

Одиночный `pointerdown` + `pointerup` без движения создаёт объект с одной точкой. Точка дублируется (`[p, p]`) для формирования валидного path-сегмента нулевой длины. `strokeLinecap="round"` рендерит его как видимую точку.

**Инварианты:**

- Каждый `pointerdown` завершается `pointerup` ИЛИ `pointercancel`
- Overlay не может существовать без активного рисования
- Pointer capture всегда освобождается
- Состояние рисования не может "застрять"

---

### ✏️ Smart Pencil / Ink-to-Shape

Инструмент умного карандаша (`useSmartPencilTool.ts`) расширяет свободный рисунок автоматическим распознаванием геометрических фигур после завершения штриха.

**Stroke smoothing pipeline:**

```
rawPoints → downsample → rdpSimplify → chaikinSmooth → FreehandPathObject
```

**Ink-to-Shape pipeline:**

```
rawPoints → detectShape → [line | circle | rectangle | polygon] → CanvasObject
                       ↓ confidence < 0.65
                    FreehandPathObject (fallback)
```

**Поддерживаемые фигуры:**

| Фигура | Алгоритм | Тип объекта |
|--------|----------|-------------|
| Line | RMS-отклонение от прямой / длина штриха < 3.5% | `line` |
| Circle | Замкнутость + stdDev/meanRadius < 0.35 | `circle` |
| Rectangle | Direction clustering: H/V сегменты ≥ 72%, замкнутость | `rectangle` |
| Triangle | `extractPolygon` → 3 вершины + площадь > порога | `polygon` (label: `triangle`) |
| Diamond (Rhombus) | 4 вершины + все стороны равны + углы ≠ 90° | `polygon` (label: `diamond`) |
| Parallelogram | 4 вершины + обе пары сторон параллельны + ≠ прямоугольник | `polygon` (label: `parallelogram`) |
| Trapezoid | 4 вершины + ровно одна пара параллельных сторон | `polygon` (label: `trapezoid`) |

**Архитектура (`useSmartPencilTool.ts`):**

| Функция | Описание |
|---------|----------|
| `rdpSimplify` | Ramer–Douglas–Peucker упрощение точек |
| `chaikinSmooth` | Corner-cutting сглаживание (1–2 итерации) |
| `extractPolygon` | RDP с адаптивным epsilon (2.5% периметра), возвращает 3–6 вершин |
| `analyzePolygon` | Углы в вершинах, длины сторон, направления, флаг замкнутости |
| `detectLine` | RMS-метрика масштабируется от размера штриха |
| `detectCircle` | Проверка замкнутости + равномерность радиусов |
| `detectRectangleFast` | Direction clustering для axis-aligned прямоугольников |
| `detectPolygonShapes` | Запускает все polygon-классификаторы, возвращает лучший |
| `detectShape` | Собирает всех кандидатов, возвращает с наибольшим confidence |

**Confidence system:**

- Каждый детектор возвращает `confidence` от 0 до 1
- `detectShape` выбирает кандидата с наибольшим confidence
- Если `confidence < 0.65` → fallback в freehand
- Fallback гарантирован: если объект не создан по любой причине — всегда создаётся `FreehandPathObject`

**Polygon-фигуры** сохраняются с `type: 'polygon'` и `data.label` = kind (`triangle`, `diamond`, `parallelogram`, `trapezoid`), что позволяет рендереру и панели свойств различать их.

---

### Coordinate System Protocol

> Этот раздел — обязательное чтение перед любой работой с координатами на холсте. Нарушение протокола приводит к "дрейфу" объектов при зуме.

**Иерархия трансформаций:**

```
viewport div  — overflow:hidden, getBoundingClientRect() → screen-space rect
  world div   — CSS: translate(panX px, panY px) scale(zoom), transformOrigin: '0 0'
    SVG       — width=2000, height=2000, viewBox="0 0 2000 2000" (логический canvas)
```

**Прямое преобразование (canvas → screen):**

```
screenX = canvasX * zoom + panX + viewportRect.left
screenY = canvasY * zoom + panY + viewportRect.top
```

**Обратное преобразование (screen → canvas):**

```
canvasX = (screenX - viewportRect.left - panX) / zoom
canvasY = (screenY - viewportRect.top  - panY) / zoom
```

Реализовано в `src/math-core/transforms.ts` → `screenToCanvas` / `canvasToScreen`.

**Правила:**

1. `viewportRect` — всегда `canvasRef.current.getBoundingClientRect()` (viewport div, не SVG).
2. `panOffset` вычитается **до** деления на `zoom` — именно так работает CSS `translate` + `scale`.
3. Никакого множителя `canvasWidth / viewportRect.width` — SVG масштабируется только через CSS `scale(zoom)`, не через атрибуты `width`/`height`.
4. Device Pixel Ratio не применяется — проект использует SVG (не `<canvas>`), DPR обрабатывается браузером автоматически.
5. Все инструменты (freehand, shape, arrow, line, geopoint, eraser, marquee) получают координаты **только** через `screenToCanvas` — никаких прямых вычислений с `clientX/Y`.

**Тесты:** `src/math-core/transforms.test.ts` — 26 тестов, включая round-trip инварианты при произвольных zoom/pan.

---

## 📐 MathInput Module

Универсальный модуль для ввода математических формул, выражений и интервалов. Заменил собой стандартные поля ввода во всех текстовых типах задач, обеспечивая единый и мощный пользовательский опыт.

### Компоненты

| Компонент | Описание |
|-----------|----------|
| `MathInputField.tsx` | Основной компонент, объединяющий поле ввода, KaTeX-превью и виртуальную клавиатуру. Является управляемым компонентом, принимая `value`, `onChange` и `onSubmit`. |
| `MathKeyboard.tsx` | Виртуальная клавиатура с тактильным откликом и тремя раскладками для удобного ввода. |
| `useMathInputLogic.ts` | Хук, инкапсулирующий всю сложную логику: управление курсором, обработку токенов, "умный" Backspace и нормализацию выражений. |

### Ключевые возможности

- **KaTeX-превью в реальном времени:** Пользователь сразу видит, как будет выглядеть введённая им формула.
- **Виртуальная клавиатура с вкладками:**
  - **123:** Основная раскладка с цифрами, базовыми операциями, корнем и степенью.
  - **f(x):** Алгебраическая раскладка с переменными (`x, y, a, b...`), знаками равенства/неравенства (`=, ≠, ≤, ≥`) и тригонометрическими функциями.
  - **[;]:** Раскладка для ввода интервалов и геометрических символов (`(`, `)`, `[`, `]`, `;`, `∞`, `°`).
- **Защита атомарных токенов:** Функции (`sqrt`, `sin`), константы (`pi`) и спецсимволы (`\le`, `\infty`) обрабатываются как единое целое. Их нельзя "сломать", вставив символ в середину, а Backspace удаляет их целиком.
- **Двойная нормализация:** Ввод пользователя параллельно преобразуется в два формата:
  - Чистый **LaTeX** для рендеринга в KaTeX (`x \le 5`).
  - "Очищенное" выражение для движка **MathJS** или строкового валидатора (`x <= 5`).
- **Универсальность:** Компонент используется для всех типов ответов: `number`, `fraction`, `expression`, `interval`, `coordinate`.

### Тесты

Логика модуля покрыта юнит-тестами (`MathInput.test.ts`, `MathInput.fraction.test.ts`) с использованием **Vitest**. Тесты проверяют корректность обработки новых символов, логику "умного" удаления, правильность нормализации выражений и конвертацию дробей.

### Fraction Input UX

Пользователь никогда не взаимодействует с LaTeX напрямую. LaTeX — это только слой рендеринга.

**Принцип работы (input → normalize → render):**

```
Пользователь вводит:  a/b   или   (3x-5)/(5x+1)
                        ↓
normalizeMathExpression()  →  autoConvertFractions()
                        ↓
LaTeX:  \frac{a}{b}   или   \frac{3x-5}{5x+1}
                        ↓
KaTeX рендерит формулу в браузере
```

**Правила конвертации (`autoConvertFractions`):**

| Ввод пользователя | LaTeX в превью |
|-------------------|----------------|
| `a/b` | `\frac{a}{b}` |
| `(x-1)/(x+2)` | `\frac{x-1}{x+2}` |
| `(x-1)/2` | `\frac{x-1}{2}` |
| `3/(x+1)` | `\frac{3}{x+1}` |
| `1/x+y` | `\frac{1}{x}+y` (только `x` в знаменателе) |
| `\frac{a}{b}` | `\frac{a}{b}` (уже LaTeX — не трогается) |

**Важно:**
- Конвертация происходит **только** в `normalizeMathExpression` (preview-слой).
- Сырое значение поля ввода **никогда не мутируется** во время набора.
- Уже существующие `\frac{}{}` защищены от двойной обработки через placeholder-механизм.
- Кнопка `a/b` на виртуальной клавиатуре вставляет структурный `\frac{}{}` с курсором внутри числителя (см. `processFractionInsert`).

**Принципы UX (Mathway-style):**
- WYSIWYG: пользователь видит красивую дробь, вводит обычный текст.
- Нет необходимости знать LaTeX-синтаксис.
- Навигация между числителем и знаменателем через `ArrowRight`/`ArrowLeft`.
- Backspace на пустом `\frac{}{}` удаляет всю структуру атомарно.

---

### Advanced Math Support (Grades 9-11)

To support complex topics for senior classes, we have implemented a new set of engine components and UI features.

#### Equivalence Engine (`src/lib/engine/equivalence.ts`)

Instead of symbolic AST analysis, which is complex and slow, we use a robust sampling-based approach to check if two expressions are equivalent (e.g., `sin(x)^2 + cos(x)^2` and `1`).

-   **Algorithm**: The engine generates ~20 candidate points (a mix of random values in `[-10, 10]` and special points like `0, 1, PI, e`).
-   **Validation**: It evaluates both expressions at these points, ignoring domain errors (like `log(-1)`). The first 7 valid pairs of results are used for comparison.
-   **Floating-Point Safe**: Comparisons use an epsilon of `1e-9` to correctly handle floating-point inaccuracies.
-   **Result**: The `checkEquivalence` function returns an object containing `{ isEquivalent: boolean, confidence: number, validPointsUsed: number }`, providing a reliable and fast check suitable for most school-level problems.

#### Custom Interval Parser (`src/lib/engine/intervals.ts`)

The system now supports answers in the form of interval unions, like `(-Infinity; -2] U [2; +Infinity)`.

-   **Custom Parser**: A lightweight, dependency-free parser (`parseIntervalSet`) handles the interval syntax, including inclusive/exclusive boundaries and infinities.
-   **Robust Comparison**: The `intervalSetsEqual` function compares two interval sets by testing over 50 critical points, including the boundaries themselves and points infinitesimally close (`1e-9`) to them, ensuring high accuracy.

#### Upgraded Token Pipeline & Keyboard

-   **Normalization pipeline** (`src/lib/math/normalization.ts`): единственный источник истины для нормализации. Все стадии выполняются строго по порядку:

    | # | Стадия | Что делает |
    |---|--------|-----------|
    | 1 | `protectLatex` | Защищает `\cmd{}` блоки плейсхолдерами — последующие стадии их не трогают |
    | 2 | `normalizeUnicode` | `\n` → пробел, `²³` → `^2 ^3` |
    | 3 | `normalizeNumbers` | Десятичная запятая → точка; все формы бесконечности → `Infinity`/`-Infinity` |
    | 4 | `normalizeOperators` | `1x` → `x`, `x+0` → `x`, `--` → `+`, `+-` → `−` |
    | 5 | `normalizeFunctions` | `sqrt()` → `\sqrt{}`, `ln/lg/log_` → LaTeX *(single pass, без рекурсии)* |
    | 6 | `convertFractions` | `a/b` → `\frac{a}{b}` |
    | 7 | `normalizeSpacing` | `*` → `\cdot`, `<=` → `\le`, `>=` → `\ge` |
    | 8 | `restoreLatex` | Восстанавливает защищённые LaTeX блоки |
    | 9 | `processAbs` | `\|x\|` → `\left\|x\right\|` |

-   **`normalizeNumbers`** — экспортируемая функция, используется напрямую в `intervals.ts` и `equivalence.ts`:
    - `3,14` → `3.14` (только между цифрами, не затрагивает `;`, `(`, `)`, `[`, `]`)
    - `∞`, `+∞`, `inf`, `+inf` → `Infinity`; `-∞`, `-inf` → `-Infinity`
    - Идемпотентна: повторное применение не меняет результат
    - Работает только вне LaTeX-блоков (вызывается после `protectLatex`, до `restoreLatex`)

-   **Архитектурное правило:** вся нормализация чисел и бесконечностей — только через `normalizeNumbers`. Локальные `replace`-хаки в `intervals.ts` и `equivalence.ts` удалены.

-   **`normalizeFunctions`** — single-pass контракт: каждый паттерн (`sqrt`, `log`, `ln`, `lg`) применяется ровно один раз через `.replace()`, без циклов и рекурсии.

-   **New Keyboard Layout**: The virtual math keyboard (`src/components/challenge/MathKeyboard.tsx`) includes a new row with 10 buttons for senior-class functions and symbols: `log`, `ln`, `lg`, `|x|`, `arcsin`, `arccos`, `arctan`, `∪`, `∈`, `∞`.

#### Parser Features (v3.3+)

-   **Input normalization**: Expressions are automatically simplified — `1x` → `x`, `x+0` → `x`. Double signs are collapsed: `--` → `+`, `+-` → `-`. Unicode superscripts are converted: `x²` → `x^2`.
-   **Auto fraction formatting**: Simple slash fractions like `1/2` or `x^2/y` are automatically converted to `\frac{}{}` LaTeX. Parenthesized fractions like `(x+1)/(y-1)` are left as-is for safety.
-   **Interval & decimal validation**: Strict interval syntax validation. Decimal separator is flexible: `3,14` is treated as `3.14` via `normalizeNumbers` — the single source of truth for numeric normalization across the entire engine (`normalizeMathExpression`, `parseIntervalSet`, `compareExpressions`).

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

Подключается к `SimpleAwareness` внутри `SupabaseProvider` через `getProvider()`. Каждый клиент транслирует `{ name, color, cursor }` через broadcast event `'awareness'`. Throttle 50ms (20fps) предотвращает перегрузку канала при движении мыши. При размонтировании или уходе мыши с холста — `setLocalState(null)`, курсор исчезает у остальных участников. Курсоры пиров, которые закрыли вкладку без graceful disconnect, автоматически удаляются через 10 секунд (TTL в `SimpleAwareness`).

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

## 🧪 Тесты

Problem Engine покрыт юнит-тестами (Vitest). Запуск: `pnpm run test:run`.

| Файл | Модуль | Тестов |
|------|--------|--------|
| `adaptiveEngine.regression.test.ts` | `adaptiveEngine` — streak, accuracy, bounds, sliding window | 20 |
| `answerValidator.edge.test.ts` | `answerValidator` — number, fraction, coordinate, interval, expression | 69 |
| `expressionParser.test.ts` | `expressionParser` — арифметика, функции, переменные, Cyrillic ternaries, String() | 45 |
| `variantGenerator.test.ts` | `variantGenerator` — детерминизм, структура, constraints, expression params | 22 |
| `variantGenerator.property.test.ts` | `variantGenerator` — property-based (fast-check): NaN/Infinity, детерминизм, constraint exhaustion | 455 |

Итого: **948 тестов** (включая все тест-файлы проекта), все проходят. Часть тестов намеренно документирует известные баги (помечены комментарием `documents current behaviour`) — они фиксируют текущее поведение, не ожидаемое.

### Стресс-тестирование (Property-based tests)

`variantGenerator.property.test.ts` использует **fast-check** для генерации сотен случайных seed-значений и проверки инвариантов:

| Свойство | Что проверяется | Запусков |
|----------|----------------|---------|
| No NaN/Infinity | Каждый числовой шаблон × каждая сложность: ответ всегда `isFinite` | 200 на комбинацию |
| Determinism | Одинаковый seed → идентичный `GeneratedProblem` (JSON.stringify) | 100 на шаблон |
| Constraint exhaustion | Все числовые шаблоны × 500 seed: нет NaN, нет исключений | 500 |
| Tight constraints | `grade8-pythag-leg` diff 1: ответ всегда положительное целое | 500 |

Запуск только PBT: `npx vitest run src/lib/__tests__/variantGenerator.property.test.ts`

**Баги, обнаруженные PBT — исправлены в v3.2.1:**
- ~~`expressionParser` не поддерживает `String()`~~ — исправлено: `String(x)` и `Number(x)` теперь поддерживаются в `parsePrimary()`
- ~~Глубоко вложенные ternary с кириллическими строками вызывают `Expected :`~~ — исправлено: неполный ternary без `else`-ветки возвращает `0` вместо исключения

### Валидация ответов — гарантии

- Строгий парсинг дробей: `parseStrictFractionValue` принимает только `a/b` (через `parseFractionToRational`) или точный decimal-regex. `parseFloat` не используется в пути дробей.
- Защита от NaN/Infinity: `validateAnswer` возвращает `false` если expected answer — `NaN` или `Infinity`; аналогично для user input в типах `number` и `fraction`.
- Защита от null/undefined: `validateAnswer` принимает `null`/`undefined` как `userAnswer` без исключений — возвращает `false`.
- `variantGenerator`: если `answer_formula` возвращает `Infinity`/`NaN`, в консоль пишется `[variantGenerator] warning` с деталями шаблона и параметров.

---

## ⚠️ Известные ограничения

| Ограничение | Описание |
|-------------|---------|
| **Expression parser** | ~~Работает только с числовыми выражениями~~ — исправлено в v3.2.1. `String()`, `Number()` и кириллические ternary-цепочки теперь поддерживаются. |
| **Numeric answer_formula** | Все шаблоны с `problemType: 'numeric'` должны возвращать числовое значение, не строку. |
| **canvas_action** | Экспериментальный тип — требует интеграции с интерактивными модулями |
| **Sync при разрыве соединения** | Если peer отключился во время bootstrap sync, canvas может быть неполным. В консоли появится предупреждение `[provider] sync timeout: peer was detected but did not respond`. |
| **Offline canvas** | Canvas-изменения не сохраняются в offline-очередь (в отличие от прогресса). При работе без комнаты используется autosave в localStorage. |
| **validateAnswer — fraction parsing** | ~~`parseFraction()` использует `parseFloat()` как первый шаг~~ — исправлено в v3.2.1. Используется строгий `parseStrictFractionValue`: только `parseFractionToRational` для строк с `/`, только точное decimal-regex для чисел. |
| **validateAnswer — unicode minus** | Unicode минус (U+2212, `−`) в дробях не поддерживается — `parseFractionToRational` ожидает ASCII дефис (U+002D). Задокументировано в тестах. |
| **expression params ordering** | ~~`expression`-параметры, зависящие от других `expression`-параметров, вычислялись в неправильном порядке~~ — исправлено в v3.2.2. Итеративный алгоритм N+1 проходов в `evaluateExpressionParams` гарантирует корректный порядок. |
| **sqrt answer validation** | ~~`answer_type: 'expression'` с `Math.sqrt(N)` в `answer_formula` хранил ответ как число, а не строку — `sqrt(89)` не принималось~~ — исправлено в v3.2.2. Ответ конвертируется в `'sqrt(N)'` при генерации. |
| **solution steps raw expressions** | ~~`result` в solution steps с `Math.sqrt(a*a + b*b)` отображался как сырая строка~~ — исправлено в v3.2.2. Используйте `result: 'sqrt({a*a + b*b})'` — движок вычислит `{...}` через `evaluateExpressionPlaceholders`. |

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
- [x] **Property-based тестирование шаблонов** — fast-check + variantGenerator; 455 PBT-тестов; 2 бага в expressionParser обнаружены и исправлены (String() и кириллические ternary)
- [x] **Debug-страница `/debug/templates`** — `TemplateDebug` компонент, доступен в dev-режиме по `/debug/templates`; группировка по классу, генерация 3–5 вариантов, NaN/Infinity badge
- [ ] Дополнительные интерактивные модули (интегралы, 3D сечения)
- [ ] Удаление debug-логов из SupabaseProvider перед релизом
- [x] **Strict number parsing** — `case 'number'` в `validateAnswer` использует regex `^-?(\d+\.?\d*|\.\d+)$` вместо `parseFloat`; `"4abc"` теперь возвращает `false`
- [x] **Fraction parsing fix** — `parseStrictFractionValue` заменил `parseFraction` в `case 'fraction'`; `'1/0'`, `'4abc'`, `'1/2/3'` теперь возвращают `false`; `0.75` корректно совпадает со строковым ответом `'3/4'`
- [x] **MathJS интеграция** — символьные вычисления для expression/interval типов
- [x] **KaTeX рендеринг** — LaTeX формулы в задачах
- [x] **Геймификация (Duolingo-стиль)** — Session Progress Bar, Streak Counter 🔥, Hint Penalty UI
- [x] **Исправление генерации задач** — фикс бесконечного цикла в useEffect, корректная генерация новых задач
- [x] **MathText парсер** — parseMathText разбивает текст по разделителям $...$ и $$...$$
- [x] **MathText нормализация** — normalizeMathExpression исправляет 1x→x, +-+→-, :→÷
- [x] **Авто-конвертация дробей** — 1/2 → \frac{1}{2}, a/b → \frac{a}{b}, x^2/y → \frac{x^2}{y}
- [x] **Иррациональные ответы (v3.2.2)** — `answer_type: 'expression'` принимает `sqrt(89)` символически и численно; `evaluateExpressionPlaceholders` вычисляет `{a*a + b*b}` в solution steps; итеративный `evaluateExpressionParams` исправляет порядок зависимых expression-параметров
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
- [x] **Properties Panel visual controls** — `ColorPalette` (сетка 4×2, transparent-свотч с SVG-диагональю) и `StrokeWidthSlider` (1–10) заменили `ColorPicker` и числовые инпуты; метки на русском; удалены координаты, размеры, кнопка удаления и секции Transform/Rotation/Actions
- [x] **PropertiesPanel decomposition** — декомпозиция на 14 специализированных компонентов (все менее 300 строк)
- [x] **Browser zoom fix** — нативный wheel listener с `passive: false` предотвращает зум браузера при Ctrl+Scroll
- [x] **Enhanced PenSettingsPanel** — пресеты цвета (6 цветов), пресеты толщины (3 кнопки с иконками), live preview
- [x] **High-impact keyboard shortcuts** — Ctrl+C/V/D/A, Delete/Backspace с правильной обработкой полей ввода
- [x] **Streamlined Share logic** — единая кнопка "Поделиться" в TopBar, удалён дублирующий floating button из Canvas
- [x] **Image paste support (Optimistic UI)** — Ctrl+V для вставки изображений из буфера обмена с мгновенным предпросмотром через blob URL
- [x] **Page sync (Lecture Mode)** — студенты автоматически следуют за учителем в режиме просмотра
- [x] **Мобильная адаптация интерактивных модулей** — responsive layout (flex-col на мобильном, flex-row на десктопе) для всех 17 модулей
- [x] **Компактная MathKeyboard на мобильном** — уменьшенные кнопки и padding на экранах < 768px
- [x] **TopBar мобильное меню** — zoom/grid/selection скрыты за hamburger-кнопкой на мобильном
- [x] **Canvas pointer events** — замена mouse events на pointer events + `touch-action: none` для поддержки touch/stylus
- [x] **PropertiesPanel Mobile Bottom Sheet** — vaul-based bottom sheet на мобильном (<768px), холст остаётся интерактивным (`modal={false}`)
- [x] **EquivalenceEngine иррациональные точки** — сэмплирование на π/4, √2, e + jitter для устранения ложных срабатываний на периодических функциях
- [x] **Динамическое извлечение переменных** — `extractVariables()` вместо хардкода `['x','y','z','a','b','c']`
- [x] **constants.ts** — единый источник правды для `TRIG_FUNCTIONS`, `IMPLICIT_MULT_VARS`, `DEFAULT_EQUIVALENCE_VARS`, `ATOMIC_KEYWORDS`
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

---

## 🖊️ Input System (Pointer Events)

Canvas использует `onPointerDown/Move/Up/Leave/Cancel` вместо mouse-событий — это обеспечивает корректную работу со стилусом, touch и мышью в одном коде.

**Ключевые изменения:**

- Все обработчики переименованы: `handleCanvasMouseDown/Move/Up` → `handleCanvasPointerDown/Move/Up`, принимают `React.PointerEvent`
- Убраны проверки `e.button !== 0`; вместо них: `if (e.pointerType === 'mouse' && e.button !== 0) return`
- Определение стилуса/touch: `const isPenLike = e.pointerType === 'pen' || e.pointerType === 'touch' || e.pressure > 0`
- `setPointerCapture` на `pointerdown`, `releasePointerCapture` на `pointerup` — гарантирует получение событий даже при выходе курсора за пределы элемента
- `touch-action: none` на viewport div — браузер не перехватывает скролл при рисовании
- `ObjectRenderer` и `ImageResizeHandles` переведены на `onPointerDown` / `React.PointerEvent`

**`onPointerCancel` handling:**

`handleCanvasPointerCancel` вызывается системой при прерывании ввода (жест ОС, palm rejection, переключение приложения). Безопасно завершает любое активное рисование:

```typescript
const handleCanvasPointerCancel = (e: React.PointerEvent) => {
  e.currentTarget.releasePointerCapture(e.pointerId);
  if (freehand.isDrawing) freehand.onMouseUp();
  if (highlighter.isDrawing) highlighter.onMouseUp();
  // ... сброс остальных drawing states
};
```

Без этого обработчика прерванный штрих мог бы "зависнуть" в состоянии рисования.

**Stylus fallback:**

Некоторые устройства (Wacom, старые Android) сообщают `pointerType === 'mouse'` даже для стилуса. Рисование разрешается если `pressure > 0` — это надёжный признак стилуса независимо от `pointerType`.

**Поддерживаемые устройства ввода:**

| Тип | `pointerType` | Примечание |
|-----|--------------|-----------|
| Мышь | `'mouse'` | `button === 0` для рисования |
| Touch | `'touch'` | Работает через pointer events |
| Стилус (Wacom, Apple Pencil) | `'pen'` | `pressure` доступен |
| Стилус-fallback | `'mouse'` + `pressure > 0` | Некоторые устройства |

**Файлы:** `src/components/Canvas.tsx`, `src/components/canvas/ObjectRenderer.tsx`, `src/components/canvas/ImageResizeHandles.tsx`

---

## 📍 Snapping System

Централизованная логика привязки геометрических инструментов с четырьмя уровнями приоритетов.

**API (`src/lib/geometry/snapping.ts`):**

```typescript
export type SnapKind = 'point' | 'intersection' | 'midpoint' | 'on-path';

export interface SnapResult {
    x: number;
    y: number;
    snapped: boolean;
    targetId?: string;   // id geopoint при kind='point'
    kind?: SnapKind;
    sourceIds?: string[]; // id сегментов (1 для midpoint/on-path, 2 для intersection)
}

export function getSnapPoint(
    objects: AnyCanvasObject[],
    x: number,
    y: number,
    radius: number,
): SnapResult
```

**Приоритеты привязки (от высшего к низшему):**

| Приоритет | Kind | Описание |
|-----------|------|---------|
| 1 | `point` | Существующая вершина `geopoint` |
| 2 | `intersection` | Пересечение двух `geosegment` |
| 3 | `midpoint` | Середина `geosegment` |
| 4 | `on-path` | Ближайшая точка на `geosegment` |

**Оптимизация пересечений:** перед O(n²) перебором пар применяется bounding-box фильтр — рассматриваются только сегменты, чей AABB пересекает зону `radius × 2` вокруг курсора. На типичных чертежах (10–30 сегментов) это сводит реальное число пар к единицам.

**Математика (`src/math-core/geometry.ts`):**
- `getPointSegmentProjection(P, A, B)` — проекция точки на отрезок, возвращает `{x, y, t}` где `t ∈ [0,1]`
- `getSegmentIntersection(A, B, C, D)` — пересечение через определители Крамера, `null` при параллельных/невзаимных отрезках

**Поведение при клике:** для `kind = 'on-path' | 'midpoint' | 'intersection'` создаётся новый `geopoint` в snap-координатах (статическое создание, без динамической привязки к родительскому сегменту).

**Визуальная обратная связь:**

| Состояние | Радиус | Stroke | Заливка |
|-----------|--------|--------|---------|
| Snapped | 11 | 3, зелёный | зелёный |
| Unsnapped | 5 | 1, пунктир | серый |

> Визуальная дифференциация по `kind` (иконки для midpoint/intersection/on-path) — следующий шаг.

**Файлы:** `src/lib/geometry/snapping.ts`, `src/math-core/geometry.ts`, `src/components/Canvas.tsx`

---

## 🔷 Shape System Fixes

**Polygon:**

- Добавлен `case 'polygon'` в switch создания фигур в `handleCanvasPointerUp`
- Нормализованные 5 вершин: `[{x:0.5,y:0},{x:1,y:0.38},{x:0.81,y:1},{x:0.19,y:1},{x:0,y:0.38}]`
- Добавлен SVG-превью `<polygon>` в оверлей во время рисования (аналогично triangle)
- `ObjectRenderer` уже поддерживал `case 'polygon'` — изменений не потребовалось

**Файлы:** `src/components/Canvas.tsx`

---

## 🗑️ Command System — Clear Board

**`ClearCanvasCommand` (`src/lib/commands.ts`):**

```typescript
class ClearCanvasCommand implements Command {
    execute()  // → setObjects([])
    undo()     // → setObjects(previousObjects)
}
```

- Сохраняет предыдущее состояние при создании
- Полностью интегрирован в `CommandHistory` — Undo/Redo работает
- `clearBoard()` в `useAppState` выполняет команду и вызывает `publishLocalChange(getCanvasSnapshot())` для синхронизации через Yjs
- Кнопка в `TopBar` (иконка `Trash2`) видна только при `roomState.role === 'teacher'`

**Файлы:** `src/lib/commands.ts`, `src/hooks/useAppState.ts`, `src/components/TopBar.tsx`

---

## 🔄 Collaboration / Page Sync

**Исправление бесконечного цикла обновлений:**

Корневая причина: `handleActivePageIdChange` → `setActivePageId` → обновление `state.activePageId` → срабатывание `usePageSync` → повторный вызов `setActivePageId` → цикл.

**Решение:**

- `handleActivePageIdChange` в `useCollaborationContext.tsx` сохраняет страницу учителя в отдельный `useState<string | undefined>` (`teacherPageId`) — не вызывает `setActivePageId` напрямую
- `usePageSync` принимает `teacherPageId` как prop, сравнивает с `state.activePageId`, использует `appliedPageRef` для предотвращения дублирующих вызовов
- Строгий guard: `if (teacherPageId && teacherPageId !== currentPageId) { setActivePageId(teacherPageId); }`
- Лог срабатывает только при реальном переключении страницы

**Файлы:** `src/hooks/usePageSync.ts`, `src/hooks/useCollaborationContext.tsx`

---

## 🖊️ Smart Pencil — Ink-to-Shape

Инструмент "Умный карандаш" распознаёт нарисованные от руки фигуры и заменяет их идеальными геометрическими объектами.

**Pipeline:** `downsample → RDP simplify → Chaikin smooth → shape detection`

**Поддерживаемые фигуры:**

| Фигура | Алгоритм |
|--------|---------|
| Линия | RMS-отклонение от прямой < 3.5% длины |
| Окружность | Центр bounding box + равномерность радиусов + угловое покрытие ≥ 270° |
| Прямоугольник | Direction clustering (H/V сегменты) + проверка замкнутости |
| Треугольник, Ромб, Параллелограмм, Трапеция | `extractPolygon → analyzePolygon → классификатор` |

**Ключевые детали реализации:**

- Confidence-based detection — фигура создаётся только при уверенности ≥ 0.65, иначе fallback в freehand
- `detectCircle` использует центр bounding box (не центроид) — устойчив к неравномерной плотности точек при рисовании
- Polygon-объекты хранят вершины в нормализованных координатах `[0..1]` относительно bounding box — требование `ObjectRenderer`
- Отдельный `CIRCLE_CLOSURE_THRESHOLD = 0.30` (мягче общего `0.20`) — круги часто не замыкаются точно

**Файлы:** `src/components/canvas/tools/useSmartPencilTool.ts`

---

## 📐 Геометрические характеристики в сантиметрах

Панель свойств фигур отображает все размеры в сантиметрах вместо пикселей.

**Конвертация:** `1 см = 40 px` (клетка сетки = 20 px, 2 клетки = 1 см)

Затронутые фигуры: rectangle, circle, triangle, polygon (трапеция, ромб, параллелограмм).
Тултип над фигурой (SmartShapeToolbar) скрыт для обычных фигур — все характеристики доступны в правой панели. Тултип с интерактивными инпутами сохранён только для `geoshape`.

**Файлы:** `src/components/PropertiesPanel/ShapeProperties.tsx`, `src/components/canvas/SmartShapeToolbar.tsx`

---

## 🔲 Resize фигур и текста

Resize через угловые и боковые ручки распространён на все типы объектов (ранее работал только для изображений).

**Поддерживаемые типы:** `rectangle`, `circle`, `triangle`, `polygon`, `text`, `image`

Константа `RESIZABLE_TYPES` централизует список — добавить новый тип достаточно в одном месте.
Для `text` при resize пересчитывается `fontSize` пропорционально изменению высоты (минимум 8px).

**Файлы:** `src/components/Canvas.tsx`, `src/components/canvas/ObjectRenderer.tsx`

---

## 📋 Копирование объектов (Ctrl+C / Ctrl+V)

Внутренний clipboard для копирования и вставки canvas-объектов.

**Поведение:**
- Ctrl+C — копирует выделенные объекты во внутренний буфер (не системный clipboard)
- Ctrl+V — вставляет со смещением +20px, объекты становятся выделенными
- Ctrl+D — дублирует выделенные объекты
- Двойной клик по фигуре — дублирует её на месте со смещением

**Реализация:** `copyToClipboard` читает `stateRef.current.selectedObjectIds` (не `state`) — нет stale closure. Обработчики зарегистрированы в `Canvas.tsx` где доступен `publishState` для синхронизации через Yjs.

Ctrl+V для изображений из системного буфера обмена работает параллельно — `handlePaste` в `App.tsx` срабатывает только если в `ClipboardEvent` есть реальный `image/*` тип.

**Файлы:** `src/hooks/useAppState.ts`, `src/components/Canvas.tsx`, `src/App.tsx`

---

## 🗺️ Known Next Steps (TODO)

- **Architecture:** Проведение рефакторинга системы нормализации математики и декомпозиция Canvas (см. [REFACTORING_PLAN.md](./REFACTORING_PLAN.md))
- ~~**Ctrl+C/V:** разобраться почему keydown не перехватывается в некоторых сценариях~~ ✅ Исправлено — refs-based keyboard listener, стабильная подписка без gap
- ~~**Snapping:** расширить на линии, середины отрезков, пересечения~~ ✅ Реализовано — `SnapKind` с 4 уровнями приоритетов, bounding-box фильтр для O(n²)
- ~~**`pointercancel`:** добавить обработчик для корректного завершения жеста при системных прерываниях~~ ✅ Реализовано
- ~~**Image interaction:** стабилизировать resize при быстрых движениях стилуса~~ ✅ Исправлено — rAF throttling + resizeStartPosRef
- **Yjs batching:** добавить throttle/debounce для `publishLocalChange` при массовых операциях
- **Polygon:** поддержка произвольного числа вершин через интерактивное добавление точек
