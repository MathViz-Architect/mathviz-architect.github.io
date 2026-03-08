import React from 'react';
import {
  Square,
  Circle,
  Triangle,
  Type,
  ArrowRight,
  BarChart3,
  Percent,
  Plus,
} from 'lucide-react';
import { generateId } from '@/hooks/useAppState';
import { AnyCanvasObject } from '@/lib/types';

interface ObjectCreatorProps {
  mode: string;
  onAddObject: (obj: AnyCanvasObject) => void;
}

const objectTypes = [
  {
    id: 'rectangle',
    name: 'Прямоугольник',
    icon: Square,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'rectangle',
      x: 300,
      y: 200,
      width: 150,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        fill: '#4F46E5',
        stroke: '#312E81',
        strokeWidth: 2,
        cornerRadius: 0,
      },
    }),
  },
  {
    id: 'circle',
    name: 'Круг',
    icon: Circle,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'circle',
      x: 300,
      y: 200,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        fill: '#10B981',
        stroke: '#047857',
        strokeWidth: 2,
      },
    }),
  },
  {
    id: 'triangle',
    name: 'Треугольник',
    icon: Triangle,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'triangle',
      x: 300,
      y: 200,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        fill: '#F59E0B',
        stroke: '#D97706',
        strokeWidth: 2,
      },
    }),
  },
  {
    id: 'text',
    name: 'Текст',
    icon: Type,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'text',
      x: 300,
      y: 200,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        text: 'Текст',
        fontSize: 24,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        fill: '#1F2937',
        textAlign: 'left',
      },
    }),
  },
  {
    id: 'arrow',
    name: 'Стрелка',
    icon: ArrowRight,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'arrow',
      x: 300,
      y: 200,
      width: 150,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        points: [{ x: 0, y: 20 }, { x: 150, y: 20 }],
        stroke: '#374151',
        strokeWidth: 2,
        arrowHead: 'end',
      },
    }),
  },
  {
    id: 'fraction',
    name: 'Дробь',
    icon: Percent,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
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
    }),
  },
  {
    id: 'bar-chart',
    name: 'Столбчатая диаграмма',
    icon: BarChart3,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'chart',
      x: 300,
      y: 200,
      width: 200,
      height: 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        chartType: 'bar',
        data: [
          { label: 'А', value: 40, color: '#3B82F6' },
          { label: 'Б', value: 65, color: '#10B981' },
          { label: 'В', value: 30, color: '#F59E0B' },
        ],
        title: 'Столбчатая диаграмма',
      },
    }),
  },
  {
    id: 'pie-chart',
    name: 'Круговая диаграмма',
    icon: Circle,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'chart',
      x: 300,
      y: 200,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        chartType: 'pie',
        data: [
          { label: 'А', value: 40, color: '#8B5CF6' },
          { label: 'Б', value: 35, color: '#EC4899' },
          { label: 'В', value: 25, color: '#F59E0B' },
        ],
        title: 'Круговая диаграмма',
      },
    }),
  },
];

export const ObjectCreator: React.FC<ObjectCreatorProps> = ({ mode, onAddObject }) => {
  // Show only for modes with multiple object choices
  if (mode === 'select' || mode === 'interactive' || mode === 'challenge' || mode === 'library' ||
    mode === 'text' || mode === 'arrow' || mode === 'fraction' || mode === 'line' || mode === 'eraser') {
    return null;
  }

  // Filter objects based on mode
  const getFilteredObjects = () => {
    switch (mode) {
      case 'shape':
        return objectTypes.filter(obj => obj.id === 'rectangle' || obj.id === 'circle' || obj.id === 'triangle');
      case 'text':
        return objectTypes.filter(obj => obj.id === 'text');
      case 'arrow':
        return objectTypes.filter(obj => obj.id === 'arrow');
      case 'fraction':
        return objectTypes.filter(obj => obj.id === 'fraction');
      case 'chart':
        return objectTypes.filter(obj => obj.id === 'bar-chart' || obj.id === 'pie-chart');
      default:
        return objectTypes;
    }
  };

  const filteredObjects = getFilteredObjects();

  return (
    <div className="w-48 bg-white border-l border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Plus size={16} />
        Добавить объект
      </h3>
      <div className="space-y-2">
        {filteredObjects.map((objType) => (
          <button
            key={objType.id}
            onClick={() => onAddObject(objType.createObject())}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
              <objType.icon size={18} className="text-gray-600" />
            </div>
            <span className="text-sm text-gray-700">{objType.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Нажмите на объект для добавления на холст
      </p>
    </div>
  );
};

export default ObjectCreator;
