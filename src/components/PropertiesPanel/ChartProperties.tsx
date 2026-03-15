import React from 'react';
import { X } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface ChartPropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const ChartProperties: React.FC<ChartPropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    chartType: 'bar' | 'pie' | 'line';
    data: Array<{ label: string; value: number; color: string }>;
    title: string;
  };

  const chartData = data?.data || [];

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  const handleSectorChange = (index: number, field: 'label' | 'value' | 'color', value: string | number) => {
    const newData = [...chartData];
    newData[index] = { ...newData[index], [field]: value };
    handleUpdateData('data', newData);
  };

  const handleAddSector = () => {
    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];
    const newData = [
      ...chartData,
      {
        label: `Сектор ${chartData.length + 1}`,
        value: 10,
        color: colors[chartData.length % colors.length],
      },
    ];
    handleUpdateData('data', newData);
  };

  const handleRemoveSector = (index: number) => {
    if (chartData.length <= 1) return;
    const newData = chartData.filter((_, i) => i !== index);
    handleUpdateData('data', newData);
  };

  return (
    <>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Название</label>
        <input
          type="text"
          value={data?.title || 'Диаграмма'}
          onChange={(e) => handleUpdateData('title', e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>

      {data?.chartType === 'pie' && (
        <>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-500 mb-2">Секторы</label>
          </div>
          <div className="space-y-2 mb-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {chartData.map((sector, index) => (
              <div key={index} className="p-2 border rounded bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Сектор {index + 1}</span>
                  {chartData.length > 1 && (
                    <button
                      onClick={() => handleRemoveSector(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      title="Удалить сектор"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={sector.label}
                    onChange={(e) => handleSectorChange(index, 'label', e.target.value)}
                    placeholder="Название"
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                  <input
                    type="number"
                    value={sector.value}
                    onChange={(e) => handleSectorChange(index, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="Значение"
                    className="w-full px-2 py-1 text-xs border rounded"
                    min={0}
                  />
                  <ColorPicker
                    label=""
                    value={sector.color}
                    onChange={(value) => handleSectorChange(index, 'color', value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddSector}
            className="w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-medium"
          >
            + Добавить сектор
          </button>
        </>
      )}

      {data?.chartType === 'bar' && (
        <>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-500 mb-2">Столбцы</label>
          </div>
          <div className="space-y-2 mb-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {chartData.map((column, index) => (
              <div key={index} className="p-2 border rounded bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Столбец {index + 1}</span>
                  {chartData.length > 1 && (
                    <button
                      onClick={() => handleRemoveSector(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      title="Удалить столбец"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={column.label}
                    onChange={(e) => handleSectorChange(index, 'label', e.target.value)}
                    placeholder="Название"
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                  <input
                    type="number"
                    value={column.value}
                    onChange={(e) => handleSectorChange(index, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="Значение"
                    className="w-full px-2 py-1 text-xs border rounded"
                    min={0}
                  />
                  <ColorPicker
                    label=""
                    value={column.color}
                    onChange={(value) => handleSectorChange(index, 'color', value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddSector}
            className="w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-medium"
          >
            + Добавить столбец
          </button>
        </>
      )}
    </>
  );
};
