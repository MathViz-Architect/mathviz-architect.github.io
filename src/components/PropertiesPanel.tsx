import React from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { X, Move, RotateCw, Maximize2 } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedObjects,
    updateObject: onUpdateObject,
    handleDeleteObject: onDeleteObject,
  } = useEditorContext();
  // saveToHistory removed from context — calls are no-ops via optional chaining
  const onSaveToHistory: (() => void) | undefined = undefined;
  const selectedObject = selectedObjects[0];

  if (selectedObjects.length === 0) {
    return null;
  }

  // Segment: show minimal panel with only relevant controls
  if (selectedObject.type === 'geosegment') {
    const data = selectedObject.data as { pointAId: string; pointBId: string; color: string; strokeWidth: number; showPoints?: boolean };
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Отрезок</h3>
            <button onClick={() => onDeleteObject(selectedObject.id)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Удалить">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Цвет</label>
            <div className="flex gap-2">
              <input type="color" value={data.color || '#374151'} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, color: e.target.value } })} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={data.color || '#374151'} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, color: e.target.value } })} className="flex-1 px-2 py-1 text-sm border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Толщина</label>
            <input type="number" value={data.strokeWidth || 2} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, strokeWidth: parseInt(e.target.value) || 1 } })} className="w-full px-2 py-1 text-sm border rounded" min={1} max={20} />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.showPoints !== false} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, showPoints: e.target.checked } })} className="rounded" />
              <span className="text-xs text-gray-600">Показывать точки</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Angle: minimal panel
  if (selectedObject.type === 'geoangle') {
    const data = selectedObject.data as {
      pointAId: string; pointBId: string; pointCId: string;
      color: string; arcRadius: number; showLabel: boolean;
    };
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Угол</h3>
            <button onClick={() => onDeleteObject(selectedObject.id)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Удалить">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Цвет</label>
            <div className="flex gap-2">
              <input type="color" value={data.color || '#7C3AED'} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, color: e.target.value } })} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={data.color || '#7C3AED'} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, color: e.target.value } })} className="flex-1 px-2 py-1 text-sm border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Радиус дуги (px)</label>
            <input type="number" value={data.arcRadius || 25} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, arcRadius: parseInt(e.target.value) || 25 } })} className="w-full px-2 py-1 text-sm border rounded" min={10} max={80} />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.showLabel !== false} onChange={(e) => onUpdateObject(selectedObject.id, { data: { ...data, showLabel: e.target.checked } })} className="rounded" />
              <span className="text-xs text-gray-600">Показывать значение угла</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (selectedObjects.length > 1) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Свойства</h3>
        <p className="text-sm text-gray-400">Выбрано объектов: {selectedObjects.length}</p>
        <button
          onClick={() => selectedObjects.forEach((obj) => onDeleteObject(obj.id))}
          className="mt-4 w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
        >
          Удалить все
        </button>
      </div>
    );
  }

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdateObject(selectedObject.id, {
      data: { ...selectedObject.data, [key]: value },
    });
  };

  const renderPropertyFields = () => {
    switch (selectedObject.type) {
      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'polygon': {
        const data = selectedObject.data as {
          fill: string;
          stroke: string;
          strokeWidth: number;
          cornerRadius?: number;
        };
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Заливка</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.fill || '#4F46E5'}
                  onChange={(e) => handleUpdateData('fill', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.fill || '#4F46E5'}
                  onChange={(e) => handleUpdateData('fill', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Обводка</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.stroke || '#312E81'}
                  onChange={(e) => handleUpdateData('stroke', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.stroke || '#312E81'}
                  onChange={(e) => handleUpdateData('stroke', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Толщина обводки</label>
              <input
                type="number"
                value={data?.strokeWidth || 2}
                onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded"
                min={0}
                max={20}
              />
            </div>
            {selectedObject.type === 'rectangle' && (
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Скругление углов</label>
                <input
                  type="number"
                  value={(data as { cornerRadius?: number })?.cornerRadius || 0}
                  onChange={(e) => handleUpdateData('cornerRadius', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min={0}
                  max={50}
                />
              </div>
            )}
          </>
        );
      }


      case 'geoshape': {
        const data = selectedObject.data as {
          shapeKind: 'circle' | 'triangle' | 'quadrilateral';
          radius?: number;
          sideA?: number; sideB?: number; sideC?: number;
          sideAB?: number; sideBC?: number; sideCD?: number; sideDA?: number;
          stroke: string;
          strokeWidth: number;
        };

        // Triangle validation
        const triValid = data.shapeKind !== 'triangle' || (() => {
          const a = data.sideA ?? 0, b = data.sideB ?? 0, c = data.sideC ?? 0;
          return a + b > c && a + c > b && b + c > a;
        })();

        return (
          <div className="space-y-4">
            {/* Stroke color */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Цвет линии</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.stroke || '#374151'}
                  onChange={(e) => handleUpdateData('stroke', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-500">{data.stroke || '#374151'}</span>
              </div>
            </div>

            {/* Stroke width */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Толщина линии</label>
              <input
                type="number"
                value={data.strokeWidth || 2}
                onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-sm border rounded"
                min={1} max={10}
              />
            </div>

            {/* Circle */}
            {data.shapeKind === 'circle' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Радиус (px)</label>
                <input
                  type="number"
                  value={data.radius || 80}
                  onChange={(e) => {
                    const r = parseInt(e.target.value) || 1;
                    onUpdateObject(selectedObject.id, {
                      data: { ...selectedObject.data, radius: r },
                      width: r * 2,
                      height: r * 2,
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min={10} max={400}
                />
              </div>
            )}

            {/* Triangle */}
            {data.shapeKind === 'triangle' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Стороны треугольника</label>
                {!triValid && (
                  <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                    ⚠ Не выполняется неравенство треугольника
                  </div>
                )}
                {(['sideA', 'sideB', 'sideC'] as const).map((key, i) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-4">{['a', 'b', 'c'][i]}</label>
                    <input
                      type="number"
                      value={(data[key] ?? 100) as number}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const a = key === 'sideA' ? val : (data.sideA ?? 100);
                        const b = key === 'sideB' ? val : (data.sideB ?? 100);
                        const c = key === 'sideC' ? val : (data.sideC ?? 100);
                        const maxSide = Math.max(a, b, c);
                        onUpdateObject(selectedObject.id, {
                          data: { ...selectedObject.data, [key]: val },
                          width: maxSide * 1.2,
                          height: maxSide * 1.0,
                        });
                      }}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      min={1}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quadrilateral */}
            {data.shapeKind === 'quadrilateral' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Стороны</label>
                {([
                  ['sideAB', 'AB'], ['sideBC', 'BC'], ['sideCD', 'CD'], ['sideDA', 'DA']
                ] as [string, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-20">{label}</label>
                    <input
                      type="number"
                      value={(data[key as keyof typeof data] ?? 100) as number}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        handleUpdateData(key, val);
                      }}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      min={1}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'fraction': {
        const data = selectedObject.data as {
          numerator: number;
          denominator: number;
          fill: string;
          stroke: string;
          strokeWidth: number;
          showLabels: boolean;
        };
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Числитель</label>
              <input
                type="number"
                value={data?.numerator || 1}
                onChange={(e) => handleUpdateData('numerator', parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-sm border rounded"
                min={0}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Знаменатель</label>
              <input
                type="number"
                value={data?.denominator || 1}
                onChange={(e) => handleUpdateData('denominator', parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-sm border rounded"
                min={1}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Заливка</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.fill || '#4F46E5'}
                  onChange={(e) => handleUpdateData('fill', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.fill || '#4F46E5'}
                  onChange={(e) => handleUpdateData('fill', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data?.showLabels ?? true}
                  onChange={(e) => handleUpdateData('showLabels', e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-500">Показать подписи</span>
              </label>
            </div>
          </>
        );
      }

      case 'text': {
        const data = selectedObject.data as {
          text: string;
          fontSize: number;
          fontFamily: string;
          fontWeight: string;
          fill: string;
          textAlign: string;
        };
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Текст</label>
              <textarea
                value={data?.text || 'Текст'}
                onChange={(e) => handleUpdateData('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded resize-none"
                rows={3}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Размер шрифта</label>
              <input
                type="number"
                value={data?.fontSize || 16}
                onChange={(e) => handleUpdateData('fontSize', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded"
                min={8}
                max={72}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Выравнивание</label>
              <select
                value={data?.textAlign || 'left'}
                onChange={(e) => handleUpdateData('textAlign', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                <option value="left">По левому краю</option>
                <option value="center">По центру</option>
                <option value="right">По правому краю</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Цвет текста</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.fill || '#1F2937'}
                  onChange={(e) => handleUpdateData('fill', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.fill || '#1F2937'}
                  onChange={(e) => handleUpdateData('fill', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          </>
        );
      }

      case 'arrow': {
        const data = selectedObject.data as {
          stroke: string;
          strokeWidth: number;
          arrowHead: string;
        };
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Длина стрелки</label>
              <input
                type="range"
                value={selectedObject.width}
                onChange={(e) => onUpdateObject(selectedObject.id, { width: parseInt(e.target.value) })}
                className="w-full"
                min={50}
                max={500}
              />
              <span className="text-xs text-gray-400">{Math.round(selectedObject.width)}px</span>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Цвет стрелки</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.stroke || '#374151'}
                  onChange={(e) => handleUpdateData('stroke', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.stroke || '#374151'}
                  onChange={(e) => handleUpdateData('stroke', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Толщина линии</label>
              <input
                type="number"
                value={data?.strokeWidth || 2}
                onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded"
                min={1}
                max={20}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Наконечник</label>
              <select
                value={data?.arrowHead || 'end'}
                onChange={(e) => handleUpdateData('arrowHead', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                <option value="end">Конец</option>
                <option value="both">Оба конца</option>
                <option value="none">Без наконечника</option>
              </select>
            </div>
          </>
        );
      }

      case 'line': {
        const data = selectedObject.data as {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          color: string;
          strokeWidth: number;
          arrowStart?: boolean;
          arrowEnd?: boolean;
        };
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Цвет линии</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.color || '#374151'}
                  onChange={(e) => handleUpdateData('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.color || '#374151'}
                  onChange={(e) => handleUpdateData('color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Толщина линии</label>
              <input
                type="number"
                value={data?.strokeWidth || 2}
                onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded"
                min={1}
                max={20}
              />
            </div>
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data?.arrowStart || false}
                  onChange={(e) => handleUpdateData('arrowStart', e.target.checked)}
                  className="rounded"
                />
                Стрелка в начале
              </label>
            </div>
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data?.arrowEnd || false}
                  onChange={(e) => handleUpdateData('arrowEnd', e.target.checked)}
                  className="rounded"
                />
                Стрелка в конце
              </label>
            </div>
          </>
        );
      }

      case 'chart': {
        const data = selectedObject.data as {
          chartType: 'bar' | 'pie' | 'line';
          data: Array<{ label: string; value: number; color: string }>;
          title: string;
        };

        const chartData = data?.data || [];

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
          if (chartData.length <= 1) return; // Keep at least one sector
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
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={sector.color}
                            onChange={(e) => handleSectorChange(index, 'color', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={sector.color}
                            onChange={(e) => handleSectorChange(index, 'color', e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                          />
                        </div>
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
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={column.color}
                            onChange={(e) => handleSectorChange(index, 'color', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={column.color}
                            onChange={(e) => handleSectorChange(index, 'color', e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                          />
                        </div>
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
      }

      case 'geopoint': {
        const data = selectedObject.data as { color: string; radius: number; label?: string };
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Цвет</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data?.color || '#1D4ED8'}
                  onChange={(e) => handleUpdateData('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data?.color || '#1D4ED8'}
                  onChange={(e) => handleUpdateData('color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Метка</label>
              <input
                type="text"
                value={data?.label ?? ''}
                onChange={(e) => handleUpdateData('label', e.target.value || null)}
                placeholder="A, B, C…"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </>
        );
      }

      default:
        return (
          <p className="text-sm text-gray-400">Нет доступных свойств</p>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Свойства</h3>
          <button
            onClick={() => onDeleteObject(selectedObject.id)}
            className="p-1 rounded hover:bg-red-50 text-red-500"
            title="Удалить объект"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1 capitalize">{selectedObject.type}</p>
      </div>

      {/* Position */}
      {selectedObject.type !== 'line' && selectedObject.type !== 'geoshape' && selectedObject.type !== 'geopoint' && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Move size={12} /> Позиция
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(selectedObject.x)}
                onChange={(e) => {
                  onUpdateObject(selectedObject.id, { x: parseInt(e.target.value) || 0 });
                  onSaveToHistory?.();
                }}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(selectedObject.y)}
                onChange={(e) => {
                  onUpdateObject(selectedObject.id, { y: parseInt(e.target.value) || 0 });
                  onSaveToHistory?.();
                }}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Size */}
      {selectedObject.type !== 'line' && selectedObject.type !== 'geoshape' && selectedObject.type !== 'geopoint' && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Maximize2 size={12} /> Размер
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400">Ширина</label>
              <input
                type="number"
                value={Math.round(selectedObject.width)}
                onChange={(e) => {
                  onUpdateObject(selectedObject.id, { width: parseInt(e.target.value) || 10 });
                  onSaveToHistory?.();
                }}
                className="w-full px-2 py-1 text-sm border rounded"
                min={10}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Высота</label>
              <input
                type="number"
                value={Math.round(selectedObject.height)}
                onChange={(e) => {
                  onUpdateObject(selectedObject.id, { height: parseInt(e.target.value) || 10 });
                  onSaveToHistory?.();
                }}
                className="w-full px-2 py-1 text-sm border rounded"
                min={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rotation - hide for chart, line and fraction objects */}
      {selectedObject.type !== 'chart' && selectedObject.type !== 'line' && selectedObject.type !== 'fraction' && selectedObject.type !== 'geoshape' && selectedObject.type !== 'text' && selectedObject.type !== 'geopoint' && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <RotateCw size={12} /> Поворот
          </h4>
          <div className="space-y-2">
            <input
              type="range"
              value={selectedObject.rotation}
              onChange={(e) => onUpdateObject(selectedObject.id, { rotation: parseInt(e.target.value) })}
              className="w-full"
              min={0}
              max={360}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={selectedObject.rotation}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdateObject(selectedObject.id, { rotation: Math.max(0, Math.min(360, val)) });
                }}
                className="flex-1 px-2 py-1 text-sm border rounded"
                min={0}
                max={360}
              />
              <span className="text-xs text-gray-400">°</span>
            </div>
          </div>
        </div>
      )}

      {/* Type-specific properties */}
      <div className="flex-1 p-4 overflow-auto">{renderPropertyFields()}</div>
    </div>
  );
};

export default PropertiesPanel;
