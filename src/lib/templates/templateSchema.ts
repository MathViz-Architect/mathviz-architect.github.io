// src/lib/templates/templateSchema.ts
// Zod-схема для валидации шаблонов задач.
// Отражает структуру ProblemTemplate из types.ts.

import { z } from 'zod';

// ── Примитивы ──────────────────────────────────────────────

const AnswerTypeSchema = z.enum([
  'number',
  'fraction',
  'coordinate',
  'text',
  'expression',
  'interval',
  'set',
]);

const ParameterDefSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('int'), min: z.number(), max: z.number() }),
  z.object({ type: z.literal('choice'), values: z.array(z.union([z.string(), z.number()])) }),
  z.object({ type: z.literal('expression'), value: z.string() }),
]);

const SolutionStepSchema = z.object({
  explanation: z.string(),
  expression: z.string().optional(),
  result: z.string().optional(),
});

const CommonMistakeSchema = z.object({
  pattern: z.string(),
  feedback: z.string(),
});

// ── DifficultyConfig ───────────────────────────────────────

const DifficultyConfigSchema = z.object({
  template: z.string().min(1, 'template не может быть пустым'),
  parameters: z.record(ParameterDefSchema),
  answer_formula: z.string().min(1, 'answer_formula не может быть пустым'),
  constraints: z.array(z.string()).optional(),
  solution: z.array(SolutionStepSchema).optional(),
  hint: z.string().optional(),
  common_mistakes: z.array(CommonMistakeSchema).optional(),
  answer_type: AnswerTypeSchema.optional(),
});

// ── Кросс-поле валидация ───────────────────────────────────
// Правило: если problemType === 'numeric', answer_type не должен быть 'text'

const DifficultyConfigWithContextSchema = DifficultyConfigSchema;

// ── ProblemTemplate ────────────────────────────────────────

export const ProblemTemplateSchema = z
  .object({
    id: z.string().min(1, 'id обязателен'),
    class: z.number().int().min(1).max(11),
    subject: z.enum(['algebra', 'geometry', 'probability', 'logic']),
    section: z.string().min(1),
    topic: z.string().min(1),
    topic_title: z.string().min(1),
    problemType: z.enum(['numeric', 'multiple_choice', 'comparison', 'text', 'magicSquare']),
    difficulties: z.record(
      z.enum(['1', '2', '3', '4']),
      DifficultyConfigWithContextSchema
    ),
    relatedModule: z.string().optional(),
    skills: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    version: z.number().optional(),
  })
  .superRefine((template, ctx) => {
    // Правило 1: numeric-шаблон не должен иметь answer_type: 'text'
    if (template.problemType === 'numeric') {
      for (const [level, config] of Object.entries(template.difficulties)) {
        if (config?.answer_type === 'text') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['difficulties', level, 'answer_type'],
            message: `problemType 'numeric' несовместим с answer_type 'text' (уровень ${level})`,
          });
        }
      }
    }

    // Правило 2: text-шаблон не должен иметь answer_type: 'number' или 'fraction'
    // (предупреждение, т.к. это не всегда ошибка — оставляем как замечание)
    if (template.problemType === 'text') {
      for (const [level, config] of Object.entries(template.difficulties)) {
        if (config?.answer_type === 'number') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['difficulties', level, 'answer_type'],
            message: `Подозрительно: problemType 'text' с answer_type 'number' (уровень ${level}). Возможно, нужен answer_type: 'text'?`,
          });
        }
      }
    }

    // Правило 3: difficulties не должен быть пустым
    if (Object.keys(template.difficulties).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['difficulties'],
        message: `Шаблон '${template.id}' должен содержать хотя бы один уровень сложности`,
      });
    }

    // Правило 4: int-параметры — min не должен быть больше max
    for (const [level, config] of Object.entries(template.difficulties)) {
      if (!config) continue;
      for (const [paramName, param] of Object.entries(config.parameters)) {
        if (param.type === 'int' && param.min > param.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['difficulties', level, 'parameters', paramName],
            message: `Параметр '${paramName}' (уровень ${level}): min (${param.min}) > max (${param.max})`,
          });
        }
      }
    }
  });

export type ValidatedProblemTemplate = z.infer<typeof ProblemTemplateSchema>;
