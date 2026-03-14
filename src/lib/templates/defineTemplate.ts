// src/lib/templates/defineTemplate.ts
// Обёртка для валидации шаблонов при загрузке модуля.
// Использование: export const myTemplates = defineTemplates([...])

import { ProblemTemplate } from '../types';
import { ProblemTemplateSchema } from './templateSchema';

/**
 * Валидирует один шаблон через Zod-схему.
 * В dev-режиме бросает ошибку с подробным описанием.
 * В prod-режиме логирует предупреждение и пропускает невалидный шаблон.
 */
function validateTemplate(template: ProblemTemplate): ProblemTemplate {
  const result = ProblemTemplateSchema.safeParse(template);

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `  [${issue.path.join('.')}] ${issue.message}`)
      .join('\n');

    const message = `❌ Невалидный шаблон '${template.id}':\n${errors}`;

    if (import.meta.env.DEV) {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }

  return template;
}

/**
 * Валидирует массив шаблонов.
 * В dev — падает на первой ошибке.
 * В prod — возвращает только валидные шаблоны.
 */
export function defineTemplates(templates: ProblemTemplate[]): ProblemTemplate[] {
  if (import.meta.env.DEV) {
    return templates.map(validateTemplate);
  }

  return templates.filter(template => {
    const result = ProblemTemplateSchema.safeParse(template);
    if (!result.success) {
      const errors = result.error.issues
        .map(issue => `  [${issue.path.join('.')}] ${issue.message}`)
        .join('\n');
      console.warn(`❌ Шаблон '${template.id}' пропущен из-за ошибок:\n${errors}`);
      return false;
    }
    return true;
  });
}
