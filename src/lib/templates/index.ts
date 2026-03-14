// src/lib/templates/index.ts
// Единая точка входа для всех шаблонов задач.
// Заменяет старый problemTemplates.ts и grade8Templates.ts.

import { ProblemTemplate } from '../types';
import { grade5Templates } from './grade5';
import { grade6Templates } from './grade6';
import { grade7Templates } from './grade7';
import { grade8Templates } from './grade8';
import { defineTemplates } from './defineTemplate';

export { grade5Templates } from './grade5';
export { grade6Templates } from './grade6';
export { grade7Templates } from './grade7';
export { grade8Templates } from './grade8';

// Обратная совместимость: старый импорт `problemTemplates` продолжает работать.
// Все шаблоны прогоняются через валидацию при загрузке модуля.
export const problemTemplates: ProblemTemplate[] = defineTemplates([
  ...grade5Templates,
  ...grade6Templates,
  ...grade7Templates,
  ...grade8Templates,
]);
