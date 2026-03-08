import React, { useState } from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';

export const ProbabilityTree: React.FC = () => {
    const [simpleMode, setSimpleMode] = useState(false);
    const [pA, setPa] = useState(0.6);
    const [pB, setPb] = useState(0.7);
    const [pB_A, setPbA] = useState(0.7);
    const [pB_notA, setPbNotA] = useState(0.4);
    const [hasThirdLevel, setHasThirdLevel] = useState(false);
    const [pC_AB, setPcAB] = useState(0.5);
    const [pC_AnotB, setPcAnotB] = useState(0.5);
    const [pC_notAB, setPcNotAB] = useState(0.5);
    const [pC_notAnotB, setPcNotAnotB] = useState(0.5);

    const [nameA, setNameA] = useState('A');
    const [nameB, setNameB] = useState('B');
    const [nameC, setNameC] = useState('C');

    const instructions = [
        'Используйте слайдеры для изменения вероятностей событий',
        'Кликните на название события (A, B, C) чтобы переименовать его',
        'Нажмите "Добавить событие" для расширения дерева на третий уровень',
        'В листьях дерева показаны итоговые вероятности',
        'Сумма всех листьев всегда равна 1'
    ];

    // Calculate probabilities
    const pNotA = 1 - pA;
    const pNotB = simpleMode ? 1 - pB : undefined;
    const pNotB_A = simpleMode ? 1 - pB : 1 - pB_A;
    const pNotB_notA = simpleMode ? 1 - pB : 1 - pB_notA;

    // Leaf probabilities (level 2)
    const pAandB = simpleMode ? pA * pB : pA * pB_A;
    const pAandNotB = simpleMode ? pA * (1 - pB) : pA * pNotB_A;
    const pNotAandB = simpleMode ? pNotA * pB : pNotA * pB_notA;
    const pNotAandNotB = simpleMode ? pNotA * (1 - pB) : pNotA * pNotB_notA;

    // Level 3 probabilities
    const pNotC_AB = 1 - pC_AB;
    const pNotC_AnotB = 1 - pC_AnotB;
    const pNotC_notAB = 1 - pC_notAB;
    const pNotC_notAnotB = 1 - pC_notAnotB;

    // Final leaf probabilities (level 3)
    const pABC = pAandB * pC_AB;
    const pABnotC = pAandB * pNotC_AB;
    const pAnotBC = pAandNotB * pC_AnotB;
    const pAnotBnotC = pAandNotB * pNotC_AnotB;
    const pnotABC = pNotAandB * pC_notAB;
    const pnotABnotC = pNotAandB * pNotC_notAB;
    const pnotAnotBC = pNotAandNotB * pC_notAnotB;
    const pnotAnotBnotC = pNotAandNotB * pNotC_notAnotB;

    const total = hasThirdLevel
        ? pABC + pABnotC + pAnotBC + pAnotBnotC + pnotABC + pnotABnotC + pnotAnotBC + pnotAnotBnotC
        : pAandB + pAandNotB + pNotAandB + pNotAandNotB;

    const reset = () => {
        setPa(0.6);
        setPb(0.7);
        setPbA(0.7);
        setPbNotA(0.4);
        setHasThirdLevel(false);
        setPcAB(0.5);
        setPcAnotB(0.5);
        setPcNotAB(0.5);
        setPcNotAnotB(0.5);
        setNameA('A');
        setNameB('B');
        setNameC('C');
    };

    // Tree layout - dynamic sizing based on levels
    const width = hasThirdLevel ? 1200 : 600;
    const height = hasThirdLevel ? 700 : 400;
    const rootX = 50;
    const rootY = height / 2;
    const level1X = hasThirdLevel ? 250 : 150;
    const level2X = hasThirdLevel ? 550 : 350;
    const level3X = hasThirdLevel ? 950 : 550;

    const level1Y_A = height * 0.3;
    const level1Y_notA = height * 0.7;

    const level2Y_AB = height * 0.15;
    const level2Y_AnotB = height * 0.45;
    const level2Y_notAB = height * 0.55;
    const level2Y_notAnotB = height * 0.85;

    // Level 3 - more spacing for 8 leaves
    const level3Y_ABC = height * 0.07;
    const level3Y_ABnotC = height * 0.21;
    const level3Y_AnotBC = height * 0.35;
    const level3Y_AnotBnotC = height * 0.49;
    const level3Y_notABC = height * 0.58;
    const level3Y_notABnotC = height * 0.72;
    const level3Y_notAnotBC = height * 0.86;
    const level3Y_notAnotBnotC = height * 0.93;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }} className="bg-white">
            <div className="p-4 border-b" style={{ flexShrink: 0 }}>
                <ModuleInstructions
                    title="Как использовать этот модуль"
                    instructions={instructions}
                    defaultExpanded={false}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden', width: '100%', height: '100%' }}>
                <div style={{ flex: 1, minWidth: 0, overflow: 'auto', backgroundColor: '#f9fafb', padding: '32px' }}>
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="border border-gray-200 rounded-lg bg-white shadow-sm"
                        style={{
                            width: '100%',
                            height: 'auto',
                            minHeight: hasThirdLevel ? '700px' : '500px'
                        }}
                        preserveAspectRatio="xMinYMid meet"
                    >
                        {/* Root node */}
                        <circle cx={rootX} cy={rootY} r="8" fill="#4F46E5" />
                        <text x={rootX} y={rootY - 15} className="text-sm fill-gray-700 font-medium" textAnchor="middle">
                            Начало
                        </text>

                        {/* Level 1: A and ¬A */}
                        <line x1={rootX} y1={rootY} x2={level1X} y2={level1Y_A} stroke="#4F46E5" strokeWidth="2" />
                        <text
                            x={(rootX + level1X) / 2}
                            y={(rootY + level1Y_A) / 2 - 10}
                            className="text-xs fill-indigo-600 font-medium"
                            textAnchor="middle"
                        >
                            {simpleMode ? `p(${nameA}) = ${pA.toFixed(2)}` : `p(${nameA}) = ${pA.toFixed(2)}`}
                        </text>
                        <circle cx={level1X} cy={level1Y_A} r="8" fill="#10B981" />
                        <text
                            x={level1X}
                            y={level1Y_A - 15}
                            className="text-sm fill-gray-700 font-medium"
                            textAnchor="middle"
                        >
                            {nameA}
                        </text>

                        <line x1={rootX} y1={rootY} x2={level1X} y2={level1Y_notA} stroke="#4F46E5" strokeWidth="2" />
                        <text
                            x={(rootX + level1X) / 2}
                            y={(rootY + level1Y_notA) / 2 + 20}
                            className="text-xs fill-indigo-600 font-medium"
                            textAnchor="middle"
                        >
                            p(¬{nameA}) = {pNotA.toFixed(2)}
                        </text>
                        <circle cx={level1X} cy={level1Y_notA} r="8" fill="#EF4444" />
                        <text x={level1X} y={level1Y_notA + 25} className="text-sm fill-gray-700 font-medium" textAnchor="middle">
                            ¬{nameA}
                        </text>

                        {/* Level 2: B branches */}
                        <line x1={level1X} y1={level1Y_A} x2={level2X} y2={level2Y_AB} stroke="#10B981" strokeWidth="2" />
                        <text
                            x={(level1X + level2X) / 2}
                            y={(level1Y_A + level2Y_AB) / 2 - 10}
                            className="text-xs fill-green-600 font-medium"
                            textAnchor="middle"
                        >
                            {simpleMode ? `p(${nameB}) = ${pB.toFixed(2)}` : `p(${nameB}|${nameA}) = ${pB_A.toFixed(2)}`}
                        </text>
                        <circle cx={level2X} cy={level2Y_AB} r="8" fill="#8B5CF6" />
                        <text x={level2X + 15} y={level2Y_AB + 5} className="text-sm fill-gray-700 font-medium">
                            {nameA} ∩ {nameB}
                        </text>
                        {!hasThirdLevel && (
                            <text x={level2X + 15} y={level2Y_AB + 20} className="text-xs fill-purple-600 font-medium">
                                {pAandB.toFixed(3)}
                            </text>
                        )}

                        <line x1={level1X} y1={level1Y_A} x2={level2X} y2={level2Y_AnotB} stroke="#10B981" strokeWidth="2" />
                        <text
                            x={(level1X + level2X) / 2}
                            y={(level1Y_A + level2Y_AnotB) / 2 + 20}
                            className="text-xs fill-green-600 font-medium"
                            textAnchor="middle"
                        >
                            {simpleMode ? `p(¬${nameB}) = ${(1 - pB).toFixed(2)}` : `p(¬${nameB}|${nameA}) = ${pNotB_A.toFixed(2)}`}
                        </text>
                        <circle cx={level2X} cy={level2Y_AnotB} r="8" fill="#8B5CF6" />
                        <text x={level2X + 15} y={level2Y_AnotB + 5} className="text-sm fill-gray-700 font-medium">
                            {nameA} ∩ ¬{nameB}
                        </text>
                        {!hasThirdLevel && (
                            <text x={level2X + 15} y={level2Y_AnotB + 20} className="text-xs fill-purple-600 font-medium">
                                {pAandNotB.toFixed(3)}
                            </text>
                        )}

                        <line x1={level1X} y1={level1Y_notA} x2={level2X} y2={level2Y_notAB} stroke="#EF4444" strokeWidth="2" />
                        <text
                            x={(level1X + level2X) / 2}
                            y={(level1Y_notA + level2Y_notAB) / 2 - 10}
                            className="text-xs fill-red-600 font-medium"
                            textAnchor="middle"
                        >
                            {simpleMode ? `p(${nameB}) = ${pB.toFixed(2)}` : `p(${nameB}|¬${nameA}) = ${pB_notA.toFixed(2)}`}
                        </text>
                        <circle cx={level2X} cy={level2Y_notAB} r="8" fill="#8B5CF6" />
                        <text x={level2X + 15} y={level2Y_notAB + 5} className="text-sm fill-gray-700 font-medium">
                            ¬{nameA} ∩ {nameB}
                        </text>
                        {!hasThirdLevel && (
                            <text x={level2X + 15} y={level2Y_notAB + 20} className="text-xs fill-purple-600 font-medium">
                                {pNotAandB.toFixed(3)}
                            </text>
                        )}

                        <line x1={level1X} y1={level1Y_notA} x2={level2X} y2={level2Y_notAnotB} stroke="#EF4444" strokeWidth="2" />
                        <text
                            x={(level1X + level2X) / 2}
                            y={(level1Y_notA + level2Y_notAnotB) / 2 + 20}
                            className="text-xs fill-red-600 font-medium"
                            textAnchor="middle"
                        >
                            {simpleMode ? `p(¬${nameB}) = ${(1 - pB).toFixed(2)}` : `p(¬${nameB}|¬${nameA}) = ${pNotB_notA.toFixed(2)}`}
                        </text>
                        <circle cx={level2X} cy={level2Y_notAnotB} r="8" fill="#8B5CF6" />
                        <text x={level2X + 15} y={level2Y_notAnotB + 5} className="text-sm fill-gray-700 font-medium">
                            ¬{nameA} ∩ ¬{nameB}
                        </text>
                        {!hasThirdLevel && (
                            <text x={level2X + 15} y={level2Y_notAnotB + 20} className="text-xs fill-purple-600 font-medium">
                                {pNotAandNotB.toFixed(3)}
                            </text>
                        )}

                        {/* Level 3: C branches */}
                        {hasThirdLevel && (
                            <>
                                {/* From A∩B */}
                                <line x1={level2X} y1={level2Y_AB} x2={level3X} y2={level3Y_ABC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_AB + level3Y_ABC) / 2 - 10} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p({nameC}) = {pC_AB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_ABC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_ABC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">{nameA}∩{nameB}∩{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pABC.toFixed(3)}</tspan>
                                </text>

                                <line x1={level2X} y1={level2Y_AB} x2={level3X} y2={level3Y_ABnotC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_AB + level3Y_ABnotC) / 2 + 15} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p(¬{nameC}) = {pNotC_AB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_ABnotC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_ABnotC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">{nameA}∩{nameB}∩¬{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pABnotC.toFixed(3)}</tspan>
                                </text>

                                {/* From A∩¬B */}
                                <line x1={level2X} y1={level2Y_AnotB} x2={level3X} y2={level3Y_AnotBC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_AnotB + level3Y_AnotBC) / 2 - 10} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p({nameC}) = {pC_AnotB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_AnotBC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_AnotBC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">{nameA}∩¬{nameB}∩{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pAnotBC.toFixed(3)}</tspan>
                                </text>

                                <line x1={level2X} y1={level2Y_AnotB} x2={level3X} y2={level3Y_AnotBnotC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_AnotB + level3Y_AnotBnotC) / 2 + 15} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p(¬{nameC}) = {pNotC_AnotB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_AnotBnotC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_AnotBnotC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">{nameA}∩¬{nameB}∩¬{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pAnotBnotC.toFixed(3)}</tspan>
                                </text>

                                {/* From ¬A∩B */}
                                <line x1={level2X} y1={level2Y_notAB} x2={level3X} y2={level3Y_notABC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_notAB + level3Y_notABC) / 2 - 10} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p({nameC}) = {pC_notAB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_notABC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_notABC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">¬{nameA}∩{nameB}∩{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pnotABC.toFixed(3)}</tspan>
                                </text>

                                <line x1={level2X} y1={level2Y_notAB} x2={level3X} y2={level3Y_notABnotC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_notAB + level3Y_notABnotC) / 2 + 15} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p(¬{nameC}) = {pNotC_notAB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_notABnotC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_notABnotC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">¬{nameA}∩{nameB}∩¬{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pnotABnotC.toFixed(3)}</tspan>
                                </text>

                                {/* From ¬A∩¬B */}
                                <line x1={level2X} y1={level2Y_notAnotB} x2={level3X} y2={level3Y_notAnotBC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_notAnotB + level3Y_notAnotBC) / 2 - 10} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p({nameC}) = {pC_notAnotB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_notAnotBC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_notAnotBC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">¬{nameA}∩¬{nameB}∩{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pnotAnotBC.toFixed(3)}</tspan>
                                </text>

                                <line x1={level2X} y1={level2Y_notAnotB} x2={level3X} y2={level3Y_notAnotBnotC} stroke="#8B5CF6" strokeWidth="2" />
                                <text x={(level2X + level3X) / 2} y={(level2Y_notAnotB + level3Y_notAnotBnotC) / 2 + 15} className="text-xs fill-purple-600 font-medium" textAnchor="middle">
                                    p(¬{nameC}) = {pNotC_notAnotB.toFixed(2)}
                                </text>
                                <circle cx={level3X} cy={level3Y_notAnotBnotC} r="6" fill="#F59E0B" />
                                <text x={level3X + 10} y={level3Y_notAnotBnotC} className="text-xs fill-gray-700 font-medium">
                                    <tspan x={level3X + 10} dy="0">¬{nameA}∩¬{nameB}∩¬{nameC}</tspan>
                                    <tspan x={level3X + 10} dy="12" className="fill-purple-600 font-semibold">{pnotAnotBnotC.toFixed(3)}</tspan>
                                </text>
                            </>
                        )}

                        {/* Total sum check */}
                        <text x={width / 2} y={height - 20} className="text-sm fill-gray-700 font-medium" textAnchor="middle">
                            Сумма: {total.toFixed(3)} {Math.abs(total - 1) < 0.001 ? '✓' : '✗'}
                        </text>
                    </svg>
                </div>

                <div style={{ width: '280px', maxWidth: '280px', minWidth: '280px', flexShrink: 0, overflowY: 'auto', padding: '12px', borderLeft: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Вероятностное дерево</h3>
                            <span className="text-sm text-gray-500">Последовательные события</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-gray-700 font-medium">Режим:</span>
                                <button
                                    onClick={() => setSimpleMode(!simpleMode)}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${simpleMode
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                        }`}
                                >
                                    {simpleMode ? 'Простое дерево' : 'Условные вероятности'}
                                </button>
                            </div>

                            <div className="p-2 bg-blue-50 rounded flex items-center gap-2">
                                <span className="text-blue-600 font-medium">Событие 1:</span>
                                <input
                                    type="text"
                                    value={nameA}
                                    onChange={(e) => setNameA(e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded text-sm"
                                    placeholder="Название события"
                                />
                            </div>
                            <div className="p-2 bg-green-50 rounded flex items-center gap-2">
                                <span className="text-green-600 font-medium">Событие 2:</span>
                                <input
                                    type="text"
                                    value={nameB}
                                    onChange={(e) => setNameB(e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded text-sm"
                                    placeholder="Название события"
                                />
                            </div>
                            {hasThirdLevel && (
                                <div className="p-2 bg-purple-50 rounded flex items-center gap-2">
                                    <span className="text-purple-600 font-medium">Событие 3:</span>
                                    <input
                                        type="text"
                                        value={nameC}
                                        onChange={(e) => setNameC(e.target.value)}
                                        className="flex-1 px-2 py-1 border rounded text-sm"
                                        placeholder="Название события"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">p({nameA}) = {pA.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={pA}
                                    onChange={(e) => setPa(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {simpleMode ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">p({nameB}) = {pB.toFixed(2)}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={pB}
                                        onChange={(e) => setPb(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">p({nameB}|{nameA}) = {pB_A.toFixed(2)}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pB_A}
                                            onChange={(e) => setPbA(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">p({nameB}|¬{nameA}) = {pB_notA.toFixed(2)}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pB_notA}
                                            onChange={(e) => setPbNotA(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                        />
                                    </div>
                                </>
                            )}

                            {hasThirdLevel && !simpleMode && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">p({nameC}|{nameA}∩{nameB}) = {pC_AB.toFixed(2)}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pC_AB}
                                            onChange={(e) => setPcAB(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">p({nameC}|{nameA}∩¬{nameB}) = {pC_AnotB.toFixed(2)}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pC_AnotB}
                                            onChange={(e) => setPcAnotB(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">p({nameC}|¬{nameA}∩{nameB}) = {pC_notAB.toFixed(2)}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pC_notAB}
                                            onChange={(e) => setPcNotAB(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">p({nameC}|¬{nameA}∩¬{nameB}) = {pC_notAnotB.toFixed(2)}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pC_notAnotB}
                                            onChange={(e) => setPcNotAnotB(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                </>
                            )}

                            {hasThirdLevel && simpleMode && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">p({nameC}) = {pC_AB.toFixed(2)}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={pC_AB}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setPcAB(val);
                                            setPcAnotB(val);
                                            setPcNotAB(val);
                                            setPcNotAnotB(val);
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            )}
                        </div>

                        {!hasThirdLevel && (
                            <button
                                onClick={() => setHasThirdLevel(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                                <Plus size={18} />
                                Добавить событие
                            </button>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={reset}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                <RotateCcw size={18} />
                                Сброс
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProbabilityTree;
