interface TopicNode {
    id: string;
    prerequisites: string[];
}

const topicGraph: TopicNode[] = [
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

    // Делимость
    { id: 'divisibility_rules', prerequisites: ['arithmetic'] },
    { id: 'prime_factorization', prerequisites: ['divisibility_rules'] },
    { id: 'gcd', prerequisites: ['prime_factorization'] },
    { id: 'lcm', prerequisites: ['gcd'] },

    // Дроби
    { id: 'fraction_property', prerequisites: ['arithmetic'] },
    { id: 'fraction_reduction', prerequisites: ['fraction_property', 'gcd'] },
    { id: 'common_denominator', prerequisites: ['fraction_reduction', 'lcm'] },
    { id: 'fraction_add_sub', prerequisites: ['common_denominator'] },
    { id: 'fraction_mul', prerequisites: ['fraction_reduction'] },
    { id: 'fraction_div', prerequisites: ['fraction_mul'] },

    // Отношения и пропорции
    { id: 'ratios', prerequisites: ['fraction_reduction'] },
    { id: 'proportions', prerequisites: ['ratios'] },
    { id: 'direct_proportion', prerequisites: ['proportions'] },

    // Проценты
    { id: 'percent_basics', prerequisites: ['fraction_property'] },
    { id: 'percent_of_number', prerequisites: ['percent_basics', 'fraction_mul'] },
    { id: 'number_by_percent', prerequisites: ['percent_of_number'] },
    { id: 'percent_change', prerequisites: ['number_by_percent'] },

    // Линейные уравнения
    { id: 'linear_equations_basic', prerequisites: ['fraction_add_sub'] },
    { id: 'linear_equations_brackets', prerequisites: ['linear_equations_basic'] },
    { id: 'word_problems_equations', prerequisites: ['linear_equations_brackets'] },

    // Геометрия 6 класса
    { id: 'coordinate_plane', prerequisites: ['arithmetic'] },
    { id: 'quadrants', prerequisites: ['coordinate_plane'] },
    { id: 'distance_on_axis', prerequisites: ['quadrants'] },
    { id: 'circles', prerequisites: ['perimeter'] },
    { id: 'figureArea', prerequisites: ['area'] },
];

/**
 * Get all prerequisite topic IDs for a given topic
 */
export function getPrerequisites(topicId: string): string[] {
    const node = topicGraph.find(n => n.id === topicId);
    return node ? node.prerequisites : [];
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
