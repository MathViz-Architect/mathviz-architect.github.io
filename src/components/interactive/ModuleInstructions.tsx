import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ModuleInstructionsProps {
    title: string;
    instructions: string[];
    defaultExpanded?: boolean;
}

export const ModuleInstructions: React.FC<ModuleInstructionsProps> = ({
    title,
    instructions,
    defaultExpanded = true,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="mb-4 border border-indigo-200 rounded-lg overflow-hidden bg-indigo-50">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-indigo-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Info className="text-white" size={18} />
                    </div>
                    <span className="font-medium text-gray-800">{title}</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="text-gray-600" size={20} />
                ) : (
                    <ChevronDown className="text-gray-600" size={20} />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                    {instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 text-sm font-medium flex items-center justify-center mt-0.5">
                                {index + 1}
                            </span>
                            <p className="text-gray-700 text-sm leading-relaxed">{instruction}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModuleInstructions;
