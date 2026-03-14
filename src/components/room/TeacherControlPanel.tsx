import React from 'react';
import { useCollaborationContext } from '@/hooks/useCollaborationContext';
import { BoardSettings } from '@/lib/types';

export const TeacherControlPanel: React.FC = () => {
  const { roomState, boardSettings, updateBoardSettings } = useCollaborationContext();

  if (roomState.role !== 'teacher' || !roomState.isConnected) {
    return null;
  }

  const handleModeChange = (mode: BoardSettings['mode']) => {
    if (mode === 'student_turn') {
      const studentId = prompt('Введите ID ученика (для MVP используется анонимный ID):');
      if (studentId) {
        updateBoardSettings({ mode: 'student_turn', activeStudentId: studentId });
      }
    } else {
      updateBoardSettings({ mode, activeStudentId: null });
    }
  };

  const getButtonClass = (mode: BoardSettings['mode']) => {
    const base = 'px-3 py-1 text-sm rounded-md transition-colors';
    const active = 'bg-indigo-700 text-white';
    const inactive = 'bg-white hover:bg-indigo-50 text-gray-700';
    return `${base} ${boardSettings.mode === mode ? active : inactive}`;
  };

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-md p-1.5 flex items-center gap-2 border border-gray-200">
      <span className="text-xs font-semibold text-gray-500 mr-2 ml-1">Режим доски:</span>
      <button onClick={() => handleModeChange('view')} className={getButtonClass('view')}>
        Лекция
      </button>
      <button onClick={() => handleModeChange('collaboration')} className={getButtonClass('collaboration')}>
        Совместная работа
      </button>
      <button onClick={() => handleModeChange('student_turn')} className={getButtonClass('student_turn')}>
        Ответ у доски
      </button>
    </div>
  );
};
