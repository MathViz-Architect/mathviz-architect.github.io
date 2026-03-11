import React, { useState } from 'react';
import { Page } from '@/lib/types';

interface Props {
  pages: Page[];
  activePageId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function PageSwitcher({ pages, activePageId, onSwitch, onAdd, onRemove }: Props) {
  const activeIndex = pages.findIndex(p => p.id === activePageId);
  const [inputValue, setInputValue] = useState('');

  const goToPrev = () => {
    if (activeIndex > 0) onSwitch(pages[activeIndex - 1].id);
  };

  const goToNext = () => {
    if (activeIndex < pages.length - 1) onSwitch(pages[activeIndex + 1].id);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const num = parseInt(inputValue, 10);
      if (!isNaN(num) && num >= 1 && num <= pages.length) {
        onSwitch(pages[num - 1].id);
      }
      setInputValue('');
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-t bg-background shrink-0 h-9">
      {/* Prev arrow */}
      <button
        className="px-1.5 py-1 rounded text-sm hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
        onClick={goToPrev}
        disabled={activeIndex === 0}
        title="Предыдущая страница"
      >
        ‹
      </button>

      {/* Page number input */}
      <input
        type="text"
        className="w-10 text-center text-xs border rounded px-1 py-0.5 bg-background text-foreground"
        placeholder={String(activeIndex + 1)}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        title={`Страница ${activeIndex + 1} из ${pages.length}. Введите номер и нажмите Enter`}
      />
      <span className="text-xs text-muted-foreground">/ {pages.length}</span>

      {/* Next arrow */}
      <button
        className="px-1.5 py-1 rounded text-sm hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
        onClick={goToNext}
        disabled={activeIndex === pages.length - 1}
        title="Следующая страница"
      >
        ›
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Page tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`flex items-center gap-1 px-3 py-1 rounded cursor-pointer text-sm select-none whitespace-nowrap transition-colors
              ${page.id === activePageId
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'}`}
            onClick={() => onSwitch(page.id)}
          >
            <span>{page.title}</span>
            {pages.length > 1 && (
              <button
                className="ml-1 opacity-40 hover:opacity-100 text-xs leading-none"
                onClick={(e) => { e.stopPropagation(); onRemove(page.id); }}
                title="Удалить страницу"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Add page */}
      <button
        className="px-2 py-1 rounded text-sm hover:bg-muted text-muted-foreground whitespace-nowrap transition-colors"
        onClick={onAdd}
        title="Добавить страницу"
      >
        + Страница
      </button>
    </div>
  );
}
