import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { generateId } from '@/hooks/useAppState';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'fractions' | 'geometry' | 'statistics' | 'comparison' | 'functions';
  preview: string;
  createObjects: () => AnyCanvasObject[];
}

// Template library
export const templates: Template[] = [
  // Fractions templates
  {
    id: 'fraction-circle',
    name: 'Круговая диаграмма',
    description: 'Визуализация дроби в виде круга',
    category: 'fractions',
    preview: '⭕',
    createObjects: (): AnyCanvasObject[] => {
      const id = generateId();
      return [
        {
          id,
          type: 'fraction',
          x: 300,
          y: 200,
          width: 150,
          height: 150,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            numerator: 1,
            denominator: 2,
            fill: '#4F46E5',
            stroke: '#312E81',
            strokeWidth: 2,
            showLabels: true,
          },
        },
      ];
    },
  },
  {
    id: 'fraction-multiple',
    name: 'Сравнение дробей',
    description: 'Сравнение нескольких дробей',
    category: 'fractions',
    preview: '🔲',
    createObjects: (): AnyCanvasObject[] => {
      const ids = [generateId(), generateId(), generateId()];
      return [
        {
          id: ids[0],
          type: 'fraction',
          x: 150,
          y: 200,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            numerator: 1,
            denominator: 2,
            fill: '#4F46E5',
            stroke: '#312E81',
            strokeWidth: 2,
            showLabels: true,
          },
        },
        {
          id: ids[1],
          type: 'fraction',
          x: 320,
          y: 200,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            numerator: 1,
            denominator: 3,
            fill: '#10B981',
            stroke: '#047857',
            strokeWidth: 2,
            showLabels: true,
          },
        },
        {
          id: ids[2],
          type: 'fraction',
          x: 490,
          y: 200,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            numerator: 2,
            denominator: 5,
            fill: '#F59E0B',
            stroke: '#B45309',
            strokeWidth: 2,
            showLabels: true,
          },
        },
      ];
    },
  },

  // Geometry templates
  {
    id: 'geometry-circles',
    name: 'Геометрические фигуры',
    description: 'Набор геометрических фигур',
    category: 'geometry',
    preview: '🔵',
    createObjects: (): AnyCanvasObject[] => {
      return [
        {
          id: generateId(),
          type: 'circle',
          x: 200,
          y: 200,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#10B981',
            stroke: '#047857',
            strokeWidth: 2,
          },
        },
        {
          id: generateId(),
          type: 'rectangle',
          x: 350,
          y: 200,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#EF4444',
            stroke: '#B91C1C',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        },
        {
          id: generateId(),
          type: 'rectangle',
          x: 500,
          y: 200,
          width: 87,
          height: 100,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#F59E0B',
            stroke: '#D97706',
            strokeWidth: 2,
            cornerRadius: 0,
            isTriangle: true,
          },
        },
      ];
    },
  },
  {
    id: 'geometry-pythagoras',
    name: 'Теорема Пифагора',
    description: 'Наглядное доказательство теоремы a² + b² = c²',
    category: 'geometry',
    preview: '📐',
    createObjects: (): AnyCanvasObject[] => {
      return [
        // Triangle
        {
          id: generateId(),
          type: 'rectangle',
          x: 200,
          y: 350,
          width: 180,
          height: 180,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#8B5CF6',
            stroke: '#6D28D9',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        },
        // Side a
        {
          id: generateId(),
          type: 'rectangle',
          x: 200,
          y: 170,
          width: 180,
          height: 180,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#EF4444',
            stroke: '#B91C1C',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        },
        // Side b
        {
          id: generateId(),
          type: 'rectangle',
          x: 380,
          y: 350,
          width: 180,
          height: 180,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#3B82F6',
            stroke: '#1E40AF',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        },
      ];
    },
  },

  // Statistics templates
  {
    id: 'stats-bar-chart',
    name: 'Столбчатая диаграмма',
    description: 'Столбчатая диаграмма для сравнения данных',
    category: 'statistics',
    preview: '📊',
    createObjects: (): AnyCanvasObject[] => {
      return [
        {
          id: generateId(),
          type: 'rectangle',
          x: 150,
          y: 150,
          width: 60,
          height: 150,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#4F46E5',
            stroke: '#312E81',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        },
        {
          id: generateId(),
          type: 'rectangle',
          x: 250,
          y: 100,
          width: 60,
          height: 200,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#10B981',
            stroke: '#047857',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        },
        {
          id: generateId(),
          type: 'rectangle',
          x: 350,
          y: 180,
          width: 60,
          height: 120,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#F59E0B',
            stroke: '#B45309',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        },
        {
          id: generateId(),
          type: 'rectangle',
          x: 450,
          y: 50,
          width: 60,
          height: 250,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#EF4444',
            stroke: '#B91C1C',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        },
      ];
    },
  },

  // Comparison templates
  {
    id: 'comparison-scale',
    name: 'Шкала сравнения',
    description: 'Визуальное сравнение величин',
    category: 'comparison',
    preview: '⚖️',
    createObjects: (): AnyCanvasObject[] => {
      return [
        // Bar 1
        {
          id: generateId(),
          type: 'rectangle',
          x: 150,
          y: 200,
          width: 200,
          height: 40,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#4F46E5',
            stroke: '#312E81',
            strokeWidth: 2,
            cornerRadius: 20,
          },
        },
        // Bar 2
        {
          id: generateId(),
          type: 'rectangle',
          x: 150,
          y: 280,
          width: 320,
          height: 40,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#10B981',
            stroke: '#047857',
            strokeWidth: 2,
            cornerRadius: 20,
          },
        },
        // Bar 3
        {
          id: generateId(),
          type: 'rectangle',
          x: 150,
          y: 360,
          width: 140,
          height: 40,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#F59E0B',
            stroke: '#B45309',
            strokeWidth: 2,
            cornerRadius: 20,
          },
        },
      ];
    },
  },
  {
    id: 'comparison-battery',
    name: 'Батарейка заряда',
    description: 'Визуализация процентов в виде батарейки',
    category: 'comparison',
    preview: '🔋',
    createObjects: (): AnyCanvasObject[] => {
      return [
        // Battery outline
        {
          id: generateId(),
          type: 'rectangle',
          x: 280,
          y: 200,
          width: 200,
          height: 100,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: 'transparent',
            stroke: '#374151',
            strokeWidth: 4,
            cornerRadius: 8,
          },
        },
        // Battery tip
        {
          id: generateId(),
          type: 'rectangle',
          x: 480,
          y: 225,
          width: 20,
          height: 50,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#374151',
            stroke: '#374151',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        },
        // Charge level (75%)
        {
          id: generateId(),
          type: 'rectangle',
          x: 290,
          y: 210,
          width: 140,
          height: 80,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#10B981',
            stroke: '#047857',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        },
      ];
    },
  },

  // Functions templates
  {
    id: 'functions-coords',
    name: 'Система координат',
    description: 'Декартова система координат',
    category: 'functions',
    preview: '📈',
    createObjects: (): AnyCanvasObject[] => {
      return [
        // X axis
        {
          id: generateId(),
          type: 'rectangle',
          x: 100,
          y: 290,
          width: 500,
          height: 4,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#374151',
            stroke: '#374151',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        },
        // Y axis
        {
          id: generateId(),
          type: 'rectangle',
          x: 340,
          y: 50,
          width: 4,
          height: 500,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#374151',
            stroke: '#374151',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        },
        // Origin point
        {
          id: generateId(),
          type: 'circle',
          x: 332,
          y: 282,
          width: 20,
          height: 20,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#EF4444',
            stroke: '#B91C1C',
            strokeWidth: 2,
          },
        },
      ];
    },
  },
];

export const getTemplatesByCategory = (category: Template['category']): Template[] => {
  return templates.filter((t) => t.category === category);
};

export const getCategoryName = (category: Template['category']): string => {
  const names: Record<Template['category'], string> = {
    fractions: 'Дроби и проценты',
    geometry: 'Геометрия',
    statistics: 'Статистика',
    comparison: 'Сравнение величин',
    functions: 'Функции и координаты',
  };
  return names[category];
};
