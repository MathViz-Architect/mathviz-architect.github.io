import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/hooks/useAppState';
import { ImageObject } from '@/lib/types';

interface UploadState {
  uploading: boolean;
  error: string | null;
}

interface PendingUpload {
  objectId: string;
  file: File;
  localUrl: string;
}

export function useImageUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({ uploading: false, error: null });
  const pendingUploadsRef = useState<PendingUpload[]>([])[0];

  const getImageDimensions = useCallback((url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width > 0 ? Math.min(img.width, 400) : 400;
        const height = img.height > 0 ? width / (img.width / img.height) : 300;
        resolve({ width, height });
      };
      img.onerror = () => resolve({ width: 400, height: 300 });
      img.src = url;
    });
  }, []);

  const createImageFromFile = useCallback(async (file: File): Promise<ImageObject> => {
    const localUrl = URL.createObjectURL(file);
    const { width, height } = await getImageDimensions(localUrl);
    
    return {
      id: generateId(),
      type: 'image',
      x: 100,
      y: 100,
      width,
      height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      data: {
        url: localUrl,
        alt: file.name,
      },
    };
  }, [getImageDimensions]);

  const uploadImage = useCallback(async (file: File): Promise<ImageObject | null> => {
    setUploadState({ uploading: true, error: null });
    console.log('[ImageUpload] Starting upload:', file.name, file.size, 'bytes');

    try {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(`Файл слишком большой. Максимум 5MB.`);
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${generateId()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      console.log('[ImageUpload] Uploading to Supabase Storage:', filePath);

      const { data, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error('[ImageUpload] Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error("Хранилище 'assets' не найдено. Создайте Public Bucket с именем 'assets' в Supabase Storage.");
        }
        if (uploadError.message.includes('violates row-level security') || uploadError.message.includes('row-level security')) {
          throw new Error("Ошибка доступа (RLS). Настройте Policies для бакета 'assets' в Supabase Storage.");
        }
        throw new Error(`Ошибка загрузки: ${uploadError.message}`);
      }

      console.log('[ImageUpload] Upload successful, getting public URL');

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error('[ImageUpload] No public URL returned');
        throw new Error('Не удалось получить ссылку на изображение');
      }

      console.log('[ImageUpload] Public URL:', urlData.publicUrl);

      const { width, height } = await getImageDimensions(urlData.publicUrl);

      const imageObject: ImageObject = {
        id: generateId(),
        type: 'image',
        x: 100,
        y: 100,
        width,
        height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        data: {
          url: urlData.publicUrl,
          alt: file.name,
        },
      };

      console.log('[ImageUpload] Created image object:', imageObject.id);
      setUploadState({ uploading: false, error: null });
      return imageObject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки';
      console.error('[ImageUpload] Error:', errorMessage);
      setUploadState({ uploading: false, error: errorMessage });
      return null;
    }
  }, [getImageDimensions]);

  const uploadImageInBackground = useCallback(async (
    imageObj: ImageObject,
    file: File,
    onUrlUpdate: (url: string) => void
  ): Promise<void> => {
    console.log('[ImageUpload] Starting background upload for:', imageObj.id);

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${generateId()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error('[ImageUpload] Background upload error:', uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        console.log('[ImageUpload] Background upload complete, updating URL');
        URL.revokeObjectURL(imageObj.data.url);
        onUrlUpdate(urlData.publicUrl);
      }
    } catch (err) {
      console.error('[ImageUpload] Background upload failed:', err);
    }
  }, []);

  const createAndUploadImage = useCallback(async (
    onUpdateObject?: (id: string, updates: Partial<ImageObject>) => void
  ): Promise<{ imageObj: ImageObject; uploadComplete: Promise<void> } | null> => {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      console.warn('[ImageUpload] Clipboard API not supported');
      return null;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      console.log('[ImageUpload] Clipboard items:', clipboardItems.length);

      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        
        if (imageType) {
          console.log('[ImageUpload] Found image type:', imageType);
          const blob = await item.getType(imageType);
          const file = new File([blob], 'clipboard-image.png', { type: imageType });

          const imageObj = await createImageFromFile(file);
          const uploadComplete = uploadImageInBackground(imageObj, file, (newUrl) => {
            if (onUpdateObject) {
              onUpdateObject(imageObj.id, { data: { ...imageObj.data, url: newUrl } });
            } else {
              imageObj.data.url = newUrl;
            }
          });

          return { imageObj, uploadComplete };
        }
      }

      console.log('[ImageUpload] No images found in clipboard');
      return null;
    } catch (err) {
      console.error('[ImageUpload] Clipboard read error:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setUploadState({ uploading: false, error: 'Доступ к буферу обмена запрещён. Разрешите доступ в браузере.' });
      }
      return null;
    }
  }, [createImageFromFile, uploadImageInBackground]);

  const uploadFromClipboard = useCallback(async (): Promise<ImageObject | null> => {
    const result = await createAndUploadImage();
    return result?.imageObj ?? null;
  }, [createAndUploadImage]);

  return {
    uploadImage,
    uploadFromClipboard,
    createAndUploadImage,
    uploadState,
  };
}
