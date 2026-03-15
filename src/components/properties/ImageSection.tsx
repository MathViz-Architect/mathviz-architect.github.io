import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

interface ImageSectionProps {
  object: AnyCanvasObject;
}

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

export const ImageSection: React.FC<ImageSectionProps> = ({ object }) => {
  const [imageError, setImageError] = useState(false);

  if (object.type !== 'image') {
    return null;
  }

  const imageData = object.data as { url: string; alt?: string };
  const hasValidImage = imageData?.url && !imageError;

  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
        <ImageIcon size={12} /> Image
      </h4>

      <div className="space-y-2">
        {/* Image Preview Thumbnail */}
        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
          {hasValidImage ? (
            <img
              src={imageData.url}
              alt={imageData.alt || 'Image preview'}
              className="max-w-full max-h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ImageIcon size={24} className="mb-1" />
              <span className="text-xs">No preview</span>
            </div>
          )}
        </div>

        {/* Object Type Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Type: <span className="font-medium text-gray-700">{TYPE_LABELS[object.type] || object.type}</span>
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(object.width)} × {Math.round(object.height)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageSection;
