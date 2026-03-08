import React from 'react';

export interface ModulePlugin {
    id: string;
    name: string;
    description: string;
    category: 'functions' | 'geometry' | 'trigonometry' | 'algebra';
    icon: React.ComponentType<{ size?: number }>;
    component: React.ComponentType;
}

const registry = new Map<string, ModulePlugin>();

export const registerModule = (plugin: ModulePlugin): void => {
    registry.set(plugin.id, plugin);
};

export const getModules = (): ModulePlugin[] => Array.from(registry.values());

export const getModuleById = (id: string): ModulePlugin | undefined => registry.get(id);

export const getModulesByCategory = (category: ModulePlugin['category']): ModulePlugin[] =>
    getModules().filter((m) => m.category === category);
