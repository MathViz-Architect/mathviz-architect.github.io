export interface TopicNode {
    id: string;
    prerequisites: string[];
}

export const topicGraph: TopicNode[] = [
    // ===== Grade 5 =====
    { id: 'comparison', prerequisites: [] },
    { id: 'arithmetic', prerequisites: ['comparison'] },
    { id: 'divisors', prerequisites: ['arithmetic'] },
    { id: 'patterns', prerequisites: ['arithmetic'] },
    { id: 'perimeter', prerequisites: ['arithmetic'] },
    { id: 'area', prerequisites: ['perimeter'] },
    { id: 'triangles', prerequisites: ['area'] },
    { id: 'magicSquare', prerequisites: ['arithmetic'] },
    { id: 'olympiad', prerequisites: ['arithmetic', 'patterns'] },

    // ===== Grade 6 =====
    { id: 'divisibility_rules', prerequisites: ['arithmetic'] },
    { id: 'prime_factorization', prerequisites: ['divisibility_rules'] },
    { id: 'gcd', prerequisites: ['prime_factorization'] },
    { id: 'lcm', prerequisites: ['gcd'] },
    { id: 'fraction_property', prerequisites: ['arithmetic'] },
    { id: 'fraction_reduction', prerequisites: ['fraction_property', 'gcd'] },
    { id: 'common_denominator', prerequisites: ['fraction_reduction', 'lcm'] },
    { id: 'fraction_add_sub', prerequisites: ['common_denominator'] },
    { id: 'fraction_mul', prerequisites: ['fraction_reduction'] },
    { id: 'fraction_div', prerequisites: ['fraction_mul'] },
    { id: 'ratios', prerequisites: ['fraction_reduction'] },
    { id: 'proportions', prerequisites: ['ratios'] },
    { id: 'direct_proportion', prerequisites: ['proportions'] },
    { id: 'percent_basics', prerequisites: ['fraction_property'] },
    { id: 'percent_of_number', prerequisites: ['percent_basics', 'fraction_mul'] },
    { id: 'number_by_percent', prerequisites: ['percent_of_number'] },
    { id: 'percent_change', prerequisites: ['number_by_percent'] },
    { id: 'linear_equations_basic', prerequisites: ['fraction_add_sub'] },
    { id: 'linear_equations_brackets', prerequisites: ['linear_equations_basic'] },
    { id: 'word_problems_equations', prerequisites: ['linear_equations_brackets'] },
    { id: 'coordinate_plane', prerequisites: ['arithmetic'] },
    { id: 'quadrants', prerequisites: ['coordinate_plane'] },
    { id: 'distance_on_axis', prerequisites: ['quadrants'] },
    { id: 'circles', prerequisites: ['perimeter'] },
    { id: 'figureArea', prerequisites: ['area'] },

    // ===== Grade 7 — Algebra =====
    { id: 'powerOfNumber',       prerequisites: [] },
    { id: 'productOfPowers',     prerequisites: ['powerOfNumber'] },
    { id: 'powerOfPower',        prerequisites: ['powerOfNumber'] },
    { id: 'divisionOfPowers',    prerequisites: ['powerOfNumber'] },
    { id: 'monomialStdForm',     prerequisites: ['powerOfNumber'] },
    { id: 'monomialMultiply',    prerequisites: ['monomialStdForm'] },
    { id: 'monomialPower',       prerequisites: ['monomialStdForm'] },
    { id: 'likeTerms',           prerequisites: ['monomialStdForm'] },
    { id: 'polyAddition',        prerequisites: ['likeTerms'] },
    { id: 'polySubtraction',     prerequisites: ['likeTerms'] },
    { id: 'polyMultiply',        prerequisites: ['likeTerms'] },
    { id: 'squareOfSum',         prerequisites: ['polyMultiply'] },
    { id: 'squareOfDiff',        prerequisites: ['polyMultiply'] },
    { id: 'diffOfSquares',       prerequisites: ['polyMultiply'] },
    { id: 'factoringApply',      prerequisites: ['squareOfSum', 'squareOfDiff', 'diffOfSquares'] },
    { id: 'linearEqSimple',      prerequisites: ['monomialStdForm'] },
    { id: 'linearEqTranspose',   prerequisites: ['linearEqSimple'] },
    { id: 'linearEqBrackets',    prerequisites: ['linearEqSimple'] },
    { id: 'funcValue',           prerequisites: ['linearEqSimple'] },
    { id: 'funcCoefficients',    prerequisites: ['funcValue'] },
    { id: 'systemsSubstitution', prerequisites: ['funcValue'] },
    { id: 'systemsElimination',  prerequisites: ['linearEqTranspose'] },

    // ===== Grade 7 — Geometry =====
    { id: 'corrAngles',         prerequisites: [] },
    { id: 'altAngles',          prerequisites: ['corrAngles'] },
    { id: 'coInteriorAngles',   prerequisites: ['corrAngles'] },
    { id: 'triangleAngles',     prerequisites: [] },
    { id: 'exteriorAngle',      prerequisites: ['triangleAngles'] },
    { id: 'congruenceSSS',      prerequisites: ['triangleAngles'] },
    { id: 'congruenceSAS',      prerequisites: ['triangleAngles'] },
    { id: 'congruenceASA',      prerequisites: ['triangleAngles'] },
    { id: 'triangleInequality', prerequisites: ['triangleAngles'] },

    // ===== Legacy Grade 7 IDs (backward compat) =====
    { id: 'powers',             prerequisites: ['powerOfNumber'] },
    { id: 'monomials',          prerequisites: ['monomialStdForm'] },
    { id: 'polynomials',        prerequisites: ['likeTerms'] },
    { id: 'factoring',          prerequisites: ['polyMultiply'] },
    { id: 'linearEquations7',   prerequisites: ['linearEqSimple'] },
    { id: 'linearFunctions',    prerequisites: ['funcValue'] },
    { id: 'systems',            prerequisites: ['funcValue'] },
    { id: 'parallelLines',      prerequisites: ['corrAngles'] },
    { id: 'triangleCongruence', prerequisites: ['triangleAngles'] },

    // ===== Grade 8 — Algebra =====
    //
    // Entry topics (prerequisites: []) — открыты сразу:
    //   quadraticTrinomial, linearInequality, rationalExpression
    //
    { id: 'quadraticTrinomial',    prerequisites: [] },                        // ENTRY
    { id: 'trinomialFactoring',    prerequisites: ['quadraticTrinomial'] },
    { id: 'quadraticIncomplete',   prerequisites: ['quadraticTrinomial'] },
    { id: 'quadraticFormula',      prerequisites: ['quadraticIncomplete'] },
    { id: 'vietasTheorem',         prerequisites: ['quadraticFormula'] },
    { id: 'quadraticWordProblems', prerequisites: ['vietasTheorem'] },
    { id: 'parabolaBasics',        prerequisites: ['quadraticFormula'] },

    { id: 'linearInequality',      prerequisites: [] },                        // ENTRY
    { id: 'absoluteValueEq',       prerequisites: ['linearInequality'] },

    { id: 'rationalExpression',    prerequisites: [] },                        // ENTRY

    // ===== Grade 8 — Geometry =====
    //
    // Entry topics:
    //   pythagoreanTheorem, triangleSimilarityAA, quadrilateralArea
    //
    { id: 'pythagoreanTheorem',   prerequisites: [] },                         // ENTRY
    { id: 'triangleSimilarityAA', prerequisites: [] },                         // ENTRY
    { id: 'quadrilateralArea',    prerequisites: [] },                         // ENTRY
    { id: 'inscribedAngle',       prerequisites: ['quadrilateralArea'] },
    { id: 'distanceFormula',      prerequisites: ['pythagoreanTheorem'] },
];

/**
 * Get all prerequisite topic IDs for a given topic.
 * Always returns string[] — never a union type.
 */
export function getPrerequisites(topicId: string): string[] {
    const node = topicGraph.find(n => n.id === topicId);
    return node?.prerequisites ?? [];
}

/**
 * Get unmet prerequisite topic IDs for a given topic
 * @param topicId - The topic to check prerequisites for
 * @param masteredTopics - List of topic IDs where skillLevel is 'proficient' or 'mastered'
 */
export function getUnmetPrerequisites(topicId: string, masteredTopics: string[]): string[] {
    const prerequisites = getPrerequisites(topicId);
    return prerequisites.filter(prereqId => !masteredTopics.includes(prereqId));
}
