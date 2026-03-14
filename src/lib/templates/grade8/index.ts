import { ProblemTemplate } from '../../types';
import { grade8QuadraticTemplates } from './quadratics';
import { grade8RootsTemplates } from './roots';
import { grade8VietaTemplates } from './vieta';
import { grade8LinearInequalityTemplates } from './linearInequality';
import { grade8AbsoluteValueEqTemplates } from './absoluteValueEq';
import { grade8RationalExpressionTemplates } from './rationalExpression';
import { grade8PythagoreanTheoremTemplates } from './pythagoreanTheorem';
import { grade8TriangleSimilarityAATemplates } from './triangleSimilarityAA';
import { grade8QuadrilateralAreaTemplates } from './quadrilateralArea';

// Сюда добавляйте импорты новых блоков шаблонов 8 класса
export const grade8Templates: ProblemTemplate[] = [
    ...grade8QuadraticTemplates,
    ...grade8RootsTemplates,
    ...grade8VietaTemplates,
    ...grade8LinearInequalityTemplates,
    ...grade8AbsoluteValueEqTemplates,
    ...grade8RationalExpressionTemplates,
    ...grade8PythagoreanTheoremTemplates,
    ...grade8TriangleSimilarityAATemplates,
    ...grade8QuadrilateralAreaTemplates,
];
