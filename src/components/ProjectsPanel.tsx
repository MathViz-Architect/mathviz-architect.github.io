import React, { useState } from 'react';
import { FolderOpen, Trash2, Save, Clock } from 'lucide-react';
import { useEditorContext } from '@/contexts/EditorContext';

export const ProjectsPanel: React.FC = () => {
    const { getSavedProjects, loadProjectFromStorage, deleteProjectFromStorage, saveProjectToStorage } = useEditorContext();
    const [projects, setProjects] = useState(getSavedProjects());

    const handleSaveProject = () => {
        const name = window.prompt('Введите название проекта:');
        if (name && name.trim()) {
            saveProjectToStorage(name.trim());
            setProjects(getSavedProjects());
        }
    };

    const handleLoadProject = (id: string) => {
        loadProjectFromStorage(id);
    };

    const handleDeleteProject = (id: string) => {
        if (window.confirm('Удалить этот проект?')) {
            deleteProjectFromStorage(id);
            setProjects(getSavedProjects());
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex-1 bg-gray-50 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Мои проекты</h2>
                    <button
                        onClick={handleSaveProject}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Save size={18} />
                        Сохранить текущий
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Нет сохранённых проектов</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Нажмите "Сохранить текущий" чтобы сохранить ваш проект
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => {
                            const isAutosave = project.id === 'autosave';
                            return (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {project.name}
                                                </h3>
                                                {isAutosave && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                                        Автосохранение
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                <Clock size={14} />
                                                <span>{formatDate(project.updatedAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleLoadProject(project.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                            >
                                                <FolderOpen size={18} />
                                                Открыть
                                            </button>
                                            {!isAutosave && (
                                                <button
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Удалить проект"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsPanel;
