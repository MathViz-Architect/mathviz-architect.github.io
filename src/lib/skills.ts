/**
 * Skill Taxonomy — единый источник истины для всех навыков в шаблонах задач.
 * Используется в problemTemplates.ts (поле `skills`) и coverage:skills скрипте.
 */

export const SKILL_TAXONOMY = {
    arithmetic: ['addition', 'subtraction', 'multiplication', 'division'],
    decimals: ['decimal_add', 'decimal_sub', 'decimal_mul', 'decimal_div'],
    fractions: [
        'fraction_concept',
        'fraction_reduction',
        'fraction_add',
        'fraction_sub',
        'fraction_mul',
        'fraction_div',
        'fraction_compare',
    ],
    number_theory: ['divisibility', 'prime_factorization', 'gcd', 'lcm'],
    geometry: ['perimeter', 'area', 'angle', 'coordinate'],
    word_problems: ['speed', 'price', 'percent', 'ratio', 'proportion', 'average'],
    logic: ['pattern', 'sequence', 'logical_reasoning'],
} as const;

export type SkillCategory = keyof typeof SKILL_TAXONOMY;
export type Skill = typeof SKILL_TAXONOMY[SkillCategory][number];

/** Flat list of all valid skills */
export const ALL_SKILLS: Skill[] = Object.values(SKILL_TAXONOMY).flat() as Skill[];

/** Validate that a skill string is in the taxonomy */
export function isValidSkill(skill: string): skill is Skill {
    return ALL_SKILLS.includes(skill as Skill);
}

/** Get the category of a skill */
export function getSkillCategory(skill: Skill): SkillCategory {
    for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
        if ((skills as readonly string[]).includes(skill)) {
            return category as SkillCategory;
        }
    }
    throw new Error(`Skill "${skill}" not found in taxonomy`);
}
