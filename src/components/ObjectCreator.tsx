import React from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import {
  Square,
  Circle,
  Triangle,
  Type,
  ArrowRight,
  BarChart3,
  Percent,
  Plus,
  Pentagon,
} from 'lucide-react';
import { generateId } from '@/hooks/useAppState';
import { AnyCanvasObject } from '@/lib/types';



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
  // GeoShapes
  {
    id: 'geoshape-circle',
    name: 'Окружность',
    icon: Circle,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'geoshape',
      x: 300,
      y: 150,
      width: 160,
      height: 160,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        shapeKind: 'circle',
        radius: 80,
        stroke: '#374151',
        strokeWidth: 2,
      },
    }),
  },
  {
    id: 'geoshape-triangle',
    name: 'Треугольник',
    icon: Triangle,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'geoshape',
      x: 300,
      y: 150,
      width: 160,
      height: 140,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        shapeKind: 'triangle',
        sideA: 100,
        sideB: 100,
        sideC: 100,
        stroke: '#374151',
        strokeWidth: 2,
      },
    }),
  },
  {
    id: 'geoshape-quad',
    name: 'Четырёхугольник',
    icon: Square,
    createObject: (): AnyCanvasObject => ({
      id: generateId(),
      type: 'geoshape',
      x: 300,
      y: 150,
      width: 160,
      height: 120,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        shapeKind: 'quadrilateral',
        sideAB: 160,
        sideBC: 120,
        sideCD: 160,
        sideDA: 120,
        stroke: '#374151',
        strokeWidth: 2,
      },
    }),
  },
];

export const ObjectCreator: React.FC = () => {
  const { state, handleAddObject: onAddObject } = useEditorContext();
  const mode = state.mode;
  // Show only for modes with multiple object choices
  if (mode === 'select' || mode === 'interactive' || mode === 'challenge' || mode === 'library' ||
    mode === 'text' || mode === 'arrow' || mode === 'fraction' || mode === 'line' || mode === 'eraser') {
    return null;
  }

  // Filter objects based on mode
  const getFilteredObjects = () => {
    const currentMode = mode as string;
    switch (currentMode) {
      case 'shape':
        return objectTypes.filter(obj =>
          obj.id === 'rectangle' || obj.id === 'circle' || obj.id === 'triangle' ||
          obj.id.startsWith('geoshape-')
        );
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

  const renderShapeObjects = () => {
    return filteredObjects.map((objType) => (
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
    ));
  };

  return (
    <div className="w-48 bg-white border-l border-gray-200 p-3 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Plus size={16} />
        Добавить объект
      </h3>
      <div className="space-y-2">
        {renderShapeObjects()}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Нажмите на объект для добавления на холст
      </p>
    </div>
  );
};

export default ObjectCreator;
