import React from 'react';
import { templates, getTemplatesByCategory, getCategoryName, Template } from '@/lib/templates';
import { AnyCanvasObject } from '@/lib/types';
import { generateId } from '@/hooks/useAppState';

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const categories: Template['category'][] = ['fractions', 'geometry', 'statistics', 'comparison', 'functions'];

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Библиотека шаблонов</h2>
        <p className="text-sm text-gray-500 mb-6">
          Выберите шаблон для быстрого создания математической инфографики
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              {getCategoryName(category)}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {getTemplatesByCategory(category).map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {template.preview}
                  </div>
                  <div className="text-sm font-medium text-gray-700">{template.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default TemplateLibrary;
