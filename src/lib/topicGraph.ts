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
