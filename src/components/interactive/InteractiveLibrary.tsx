import React, { useState } from 'react';
import { getModules, getModuleById } from '@/lib/moduleRegistry';

interface InteractiveLibraryProps {
  onClose?: () => void;
}

export const InteractiveLibrary: React.FC<InteractiveLibraryProps> = ({ onClose }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const renderModule = () => {
    if (!activeModule) return null;
    const plugin = getModuleById(activeModule);
    if (!plugin) return null;
    const Component = plugin.component;
    return <Component />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      algebra: 'Алгебра',
      geometry: 'Геометрия',
      trigonometry: 'Тригонометрия',
      functions: 'Функции',
    };
    return labels[category] || category;
  };

  // Get all modules from registry and group by category
  const modules = getModules();
  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  if (activeModule) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Back button */}
        <button
          onClick={() => setActiveModule(null)}
          className="m-4 mb-0 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Назад к библиотеке
        </button>

        {/* Module content */}
        <div className="flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
          {renderModule()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Интерактивные модули</h2>
        <p className="text-sm text-gray-500 mt-1">
          Выберите тему для изучения с помощью интерактивных визуализаций
        </p>
      </div>

      {/* Categories */}
      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            {getCategoryLabel(category)}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {categoryModules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <span className="text-indigo-600">
                      <module.icon size={24} />
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{module.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{module.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Coming soon */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-medium text-gray-700 mb-2">Скоро появится:</h4>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Сечения многогранников (3D)</li>
          <li>• Интегралы и площади под кривыми</li>
        </ul>
      </div>
    </div>
  );
};

export default InteractiveLibrary;
