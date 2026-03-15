import React, { useCallback } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { useCollaborationContext } from '@/hooks/useCollaborationContext';
import { X } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';
import { TransformSection } from './TransformSection';
import { RotationSection } from './RotationSection';
import { ImageSection } from './ImageSection';
import { ActionSection } from './ActionSection';
import {
  ShapeProperties,
  GeoShapeProperties,
  GeoPointProperties,
  GeoSegmentProperties,
  GeoAngleProperties,
  TextProperties,
  ArrowProperties,
  LineProperties,
  ChartProperties,
  FractionProperties,
  PenSettingsPanel,
  MultiSelectPanel,
} from '../PropertiesPanel/index';

const TYPE_LABELS: Record<string, string> = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  triangle: 'Triangle',
  polygon: 'Polygon',
  geoshape: 'Geo Shape',
  geopoint: 'Point',
  geosegment: 'Segment',
  geoangle: 'Angle',
  text: 'Text',
  arrow: 'Arrow',
  line: 'Line',
  chart: 'Chart',
  fraction: 'Fraction',
  image: 'Image',
  freehand: 'Freehand',
};

export const PropertiesPanel: React.FC = () => {
  const {
    state,
    selectedObjects,
    updateObject: onUpdateObject,
    handleDeleteObject: onDeleteObject,
    penSettings,
    setPenSettings,
    getCanvasSnapshot,
  } = useEditorContext();

  const { publishLocalChange } = useCollaborationContext();

  const selectedObject = selectedObjects[0];
  const mode = state.mode;

  const handlePublish = useCallback(() => {
    publishLocalChange(getCanvasSnapshot());
  }, [publishLocalChange, getCanvasSnapshot]);

  const createUpdater = useCallback((objId: string) => {
    return (updates: Partial<AnyCanvasObject>) => {
      onUpdateObject(objId, updates);
    };
  }, [onUpdateObject]);

  if (mode === 'freehand') {
    return <PenSettingsPanel penSettings={penSettings} setPenSettings={setPenSettings} />;
  }

  if (selectedObjects.length === 0) {
    return null;
  }

  if (selectedObjects.length > 1) {
    return (
      <MultiSelectPanel
        objects={selectedObjects}
        onDeleteAll={() => selectedObjects.forEach((obj) => onDeleteObject(obj.id))}
      />
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {TYPE_LABELS[selectedObject.type] || 'Properties'}
            </h3>
            <p className="text-xs text-gray-400 capitalize">{selectedObject.type}</p>
          </div>
          <button
            onClick={() => onDeleteObject(selectedObject.id)}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
            title="Delete object"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Image Preview (for images only) */}
      <ImageSection object={selectedObject} />

      {/* Transform Section */}
      <TransformSection
        object={selectedObject}
        onUpdate={createUpdater(selectedObject.id)}
        onPublish={handlePublish}
      />

      {/* Rotation Section */}
      <RotationSection
        object={selectedObject}
        onUpdate={createUpdater(selectedObject.id)}
        onPublish={handlePublish}
      />

      {/* Actions Section */}
      <ActionSection
        object={selectedObject}
        onDelete={() => {
          onDeleteObject(selectedObject.id);
          handlePublish();
        }}
      />

      {/* Type-specific Properties */}
      <div className="flex-1 p-4 overflow-auto">
        {selectedObject.type === 'rectangle' && (
          <ShapeProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'circle' && (
          <ShapeProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'triangle' && (
          <ShapeProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'polygon' && (
          <ShapeProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'geoshape' && (
          <GeoShapeProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'geopoint' && (
          <GeoPointProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'geosegment' && (
          <GeoSegmentProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'geoangle' && (
          <GeoAngleProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'text' && (
          <TextProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'arrow' && (
          <ArrowProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'line' && (
          <LineProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'chart' && (
          <ChartProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'fraction' && (
          <FractionProperties object={selectedObject} onUpdate={createUpdater(selectedObject.id)} />
        )}
        {selectedObject.type === 'freehand' && (
          <p className="text-sm text-gray-400">Select Pen tool to configure.</p>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
