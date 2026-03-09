import React, { useState, useEffect } from 'react';
import { FileImage, FileCode, FileText, X } from 'lucide-react';
import { useEditorContext } from '@/contexts/EditorContext';
import { getBoundingBox } from '@/math-core';

interface ExportModalProps {
    onClose: () => void;
}

type ExportFormat = 'png' | 'svg' | 'pdf';
type PNGResolution = 1 | 2 | 3;

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
    const { state } = useEditorContext();
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
    const [pngResolution, setPngResolution] = useState<PNGResolution>(2);
    const [isExporting, setIsExporting] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const computeCanvasBounds = () => {
        if (state.objects.length === 0) {
            return { x: 0, y: 0, width: 800, height: 600 };
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        state.objects.forEach(obj => {
            const bbox = getBoundingBox(obj);
            minX = Math.min(minX, bbox.x);
            minY = Math.min(minY, bbox.y);
            maxX = Math.max(maxX, bbox.x + bbox.width);
            maxY = Math.max(maxY, bbox.y + bbox.height);
        });

        const padding = 20;
        return {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + padding * 2,
            height: (maxY - minY) + padding * 2,
        };
    };

    const exportAsSVG = () => {
        const svgElement = document.querySelector('[data-canvas-svg]') as SVGSVGElement;
        if (!svgElement) {
            alert('Не удалось найти холст для экспорта');
            return;
        }

        try {
            const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
            if (!svgClone.getAttribute('xmlns')) {
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }

            const selectionRects = svgClone.querySelectorAll('rect[stroke-dasharray]');
            selectionRects.forEach(rect => rect.remove());

            const bounds = computeCanvasBounds();
            svgClone.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
            svgClone.setAttribute('width', bounds.width.toString());
            svgClone.setAttribute('height', bounds.height.toString());

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);

            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${state.projectName}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onClose();
        } catch (e) {
            console.error('Failed to export SVG:', e);
            alert('Ошибка при экспорте SVG');
        }
    };

    const exportAsPNG = async () => {
        const svgElement = document.querySelector('[data-canvas-svg]') as SVGSVGElement;
        if (!svgElement) {
            alert('Не удалось найти холст для экспорта');
            return;
        }

        try {
            setIsExporting(true);

            const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
            if (!svgClone.getAttribute('xmlns')) {
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }

            const selectionRects = svgClone.querySelectorAll('rect[stroke-dasharray]');
            selectionRects.forEach(rect => rect.remove());

            const bounds = computeCanvasBounds();
            svgClone.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);

            const width = bounds.width * pngResolution;
            const height = bounds.height * pngResolution;
            svgClone.setAttribute('width', width.toString());
            svgClone.setAttribute('height', height.toString());

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${state.projectName}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            onClose();
                        }
                        setIsExporting(false);
                    }, 'image/png');
                }

                URL.revokeObjectURL(svgUrl);
            };

            img.onerror = () => {
                console.error('Failed to load SVG as image');
                alert('Ошибка при экспорте PNG');
                setIsExporting(false);
                URL.revokeObjectURL(svgUrl);
            };

            img.src = svgUrl;
        } catch (e) {
            console.error('Failed to export PNG:', e);
            alert('Ошибка при экспорте PNG');
            setIsExporting(false);
        }
    };

    const exportAsPDF = () => {
        const svgElement = document.querySelector('[data-canvas-svg]') as SVGSVGElement;
        if (!svgElement) {
            alert('Не удалось найти холст для экспорта');
            return;
        }

        try {
            const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
            if (!svgClone.getAttribute('xmlns')) {
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }

            const selectionRects = svgClone.querySelectorAll('rect[stroke-dasharray]');
            selectionRects.forEach(rect => rect.remove());

            const bounds = computeCanvasBounds();
            svgClone.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
            svgClone.setAttribute('width', bounds.width.toString());
            svgClone.setAttribute('height', bounds.height.toString());

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);

            // Note: For better PDF support, jsPDF library can be added in the future
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${state.projectName}</title>
              <style>
                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; }
                svg { max-width: 100%; height: auto; }
                @media print {
                  body { padding: 0; }
                  svg { max-width: 100%; page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              ${svgString}
              <script>
                window.onload = () => {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
                printWindow.document.close();
            }

            onClose();
        } catch (e) {
            console.error('Failed to export PDF:', e);
            alert('Ошибка при экспорте PDF');
        }
    };

    const handleExport = () => {
        switch (selectedFormat) {
            case 'svg':
                exportAsSVG();
                break;
            case 'png':
                exportAsPNG();
                break;
            case 'pdf':
                exportAsPDF();
                break;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl p-6 w-[480px] shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Экспорт</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Format selection */}
                <div className="space-y-3 mb-6">
                    {/* PNG */}
                    <button
                        onClick={() => setSelectedFormat('png')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedFormat === 'png'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedFormat === 'png' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                <FileImage size={24} className={selectedFormat === 'png' ? 'text-indigo-600' : 'text-gray-600'} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">PNG</div>
                                <div className="text-sm text-gray-500">Растровое изображение высокого качества</div>
                            </div>
                            {selectedFormat === 'png' && (
                                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>

                    {/* SVG */}
                    <button
                        onClick={() => setSelectedFormat('svg')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedFormat === 'svg'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedFormat === 'svg' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                <FileCode size={24} className={selectedFormat === 'svg' ? 'text-emerald-600' : 'text-gray-600'} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">SVG</div>
                                <div className="text-sm text-gray-500">Векторная графика для масштабирования</div>
                            </div>
                            {selectedFormat === 'svg' && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>

                    {/* PDF */}
                    <button
                        onClick={() => setSelectedFormat('pdf')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedFormat === 'pdf'
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedFormat === 'pdf' ? 'bg-rose-100' : 'bg-gray-100'}`}>
                                <FileText size={24} className={selectedFormat === 'pdf' ? 'text-rose-600' : 'text-gray-600'} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">PDF</div>
                                <div className="text-sm text-gray-500">Документ для печати</div>
                            </div>
                            {selectedFormat === 'pdf' && (
                                <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* PNG resolution selector */}
                {selectedFormat === 'png' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Разрешение
                        </label>
                        <div className="flex gap-2">
                            {([1, 2, 3] as PNGResolution[]).map((res) => (
                                <button
                                    key={res}
                                    onClick={() => setPngResolution(res)}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${pngResolution === res
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {res}x
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Выше разрешение = больше размер файла и лучше качество
                        </p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? 'Экспорт...' : 'Экспортировать'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
