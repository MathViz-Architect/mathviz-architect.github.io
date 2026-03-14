# Design Document: Grade 8 Problem Template Stabilization and Expansion

## Overview

This design addresses architectural violations in existing Grade 8 problem templates and establishes patterns for creating mathematically correct, engine-compatible templates. The Problem Engine generates adaptive math problems through a pipeline: ProblemTemplate → VariantGenerator → GeneratedProblem → AssessmentEngine → AdaptiveEngine.

The core issue is that some templates (particularly Vieta's theorem templates) violate the engine's contract by returning string values in `answer_formula` fields that should contain numeric expressions. The engine's expression parser expects numeric results, not formatted strings.

### Design Goals

1. Fix architectural violations where `answer_formula` returns strings instead of numbers
2. Redesign Vieta theorem templates to return numeric results (smaller root, larger root, sum, product)
3. Establish clear patterns for parameter generation that avoid edge cases
4. Maintain backward compatibility with the existing engine architecture
5. Ensure all templates follow the pattern: parameters → constraints → template → answer_formula

### Architectural Constraints

**CRITICAL - Must Not Modify:**
- Problem Engine architecture (src/lib/engine/)
- Expression parser (src/lib/engine/expressionParser.ts)
- Variant generator (src/lib/engine/variantGenerator.ts)
- Answer validator (src/lib/engine/answerValidator.ts)
- Adaptive engine (src/lib/adaptiveEngine.ts)
- Grade 7 templates

**Scope Limited To:**
- src/lib/templates/grade8/ directory only

## Architecture

### Template Structure

All Grade 8 templates follow the ProblemTemplate interface:

```typescript
interface ProblemTemplate {
  id: string;                    // Format: "grade8-{topicName}"
  class: number;                 // Always 8
  subject: 'algebra' | 'geometry' | 'probability' | 'logic';
  section: string;
  topic: string;
  topic_title: string;
  problemType: 'numeric' | 'comparison' | 'text' | 'magicSquare';
  difficulties: Partial<Record<1 | 2 | 3 | 4, DifficultyConfig>>;
  skills?: string[];
  tags?: string[];
}

interface DifficultyConfig {
  template: string;              // Problem text with {param} placeholders
  parameters: Record<string, ParameterDef>;
  answer_formula: string;        // MUST evaluate to number
  constraints?: string[];        // Boolean expressions
  solution?: SolutionStep[];
  hint?: string;
  common_mistakes?: CommonMistake[];
  answer_type?: AnswerType;      // 'number' | 'fraction' | 'coordinate'
}
```

### ProblemType Consistency Rule

**CRITICAL CONSTRAINT:** The `problemType` field must match the type of value returned by `answer_formula`:

| answer_formula returns | problemType MUST be |
|------------------------|---------------------|
| `number` | `'numeric'` |
| `string` (text answer) | `'text'` |
| Comparison expression | `'comparison'` |
| Magic square grid | `'magicSquare'` |

**Common Violation to Fix:**
```typescript
// ❌ WRONG - Returns number but uses 'text'
{
  problemType: 'text',
  answer_formula: 'Math.min(r1, r2)'  // Returns number
}

// ✅ CORRECT - Returns number, uses 'numeric'
{
  problemType: 'numeric',
  answer_formula: 'Math.min(r1, r2)'  // Returns number
}
```

**Rationale:** The engine's answer validator expects numeric values for `problemType: 'numeric'`. Using `'text'` for numeric answers breaks the validation pipeline and prevents proper answer checking.

### Parameter Generation Strategy

Templates use a "build from answer" approach to guarantee valid solutions:

**For Quadratics:**
```typescript
// Build from roots r1, r2 to ensure real solutions
r1: { type: 'int', min: -5, max: 5 }
r2: { type: 'int', min: -5, max: 5 }
b: { type: 'expression', value: '-(r1 + r2)' }
c: { type: 'expression', value: 'r1 * r2' }
// Discriminant D = (r1-r2)² is always non-negative
```

**For Square Roots:**
```typescript
// Build from the answer to ensure perfect squares
n: { type: 'int', min: 2, max: 12 }
c: { type: 'expression', value: 'n * n' }
// √c = n is guaranteed to be an integer
```

**For Geometry:**
```typescript
// Use Pythagorean triples for integer answers
// Common triples: (3,4,5), (5,12,13), (8,15,17), (7,24,25), (20,21,29)
triple: { type: 'choice', values: [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]
]}
a: { type: 'expression', value: 'triple[0]' }
b: { type: 'expression', value: 'triple[1]' }
c: { type: 'expression', value: 'triple[2]' }
// Guarantees integer hypotenuse and clean educational problems
```

**Alternative - Scaled Pythagorean Triples:**
```typescript
// Generate scaled versions of base triple (3,4,5)
scale: { type: 'int', min: 1, max: 4 }
a: { type: 'expression', value: '3 * scale' }
b: { type: 'expression', value: '4 * scale' }
c: { type: 'expression', value: '5 * scale' }
// Produces: (3,4,5), (6,8,10), (9,12,15), (12,16,20)
```

### Pythagorean Triple Patterns

For geometry templates involving right triangles, ALWAYS use Pythagorean triples to ensure integer answers and clean educational problems.

**Why Pythagorean Triples:**
- Guarantees integer hypotenuse (no irrational numbers)
- Produces clean, student-friendly numbers
- Avoids floating-point precision issues
- Maintains mathematical correctness

**Common Pythagorean Triples:**
| Triple | Scaled Versions |
|--------|----------------|
| (3, 4, 5) | (6, 8, 10), (9, 12, 15), (12, 16, 20) |
| (5, 12, 13) | (10, 24, 26), (15, 36, 39) |
| (8, 15, 17) | (16, 30, 34) |
| (7, 24, 25) | (14, 48, 50) |
| (20, 21, 29) | (40, 42, 58) |

**Implementation Approaches:**

1. **Choice Parameter (Recommended for variety):**
```typescript
parameters: {
  triple: { 
    type: 'choice', 
    values: [[3,4,5], [5,12,13], [8,15,17], [7,24,25]] 
  },
  a: { type: 'expression', value: 'triple[0]' },
  b: { type: 'expression', value: 'triple[1]' },
  c: { type: 'expression', value: 'triple[2]' }
}
```

2. **Scaled Triple (Recommended for progressive difficulty):**
```typescript
parameters: {
  scale: { type: 'int', min: 1, max: 3 },
  a: { type: 'expression', value: '3 * scale' },
  b: { type: 'expression', value: '4 * scale' },
  c: { type: 'expression', value: '5 * scale' }
}
```

3. **Indexed Selection (For specific difficulty levels):**
```typescript
parameters: {
  baseTriples: { 
    type: 'choice', 
    values: [[3,4,5], [5,12,13], [8,15,17]] 
  },
  // Use baseTriples[0], baseTriples[1], baseTriples[2] in expressions
}
```

**Anti-Pattern to Avoid:**
```typescript
// ❌ WRONG - Produces irrational numbers
a: { type: 'int', min: 3, max: 12 }
b: { type: 'int', min: 4, max: 12 }
c: { type: 'expression', value: 'Math.sqrt(a*a + b*b)' }
// Result: c = √(5² + 7²) = √74 ≈ 8.602 (irrational)
```

### Expression Parser Capabilities

The CSP-safe expression parser supports:
- Arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Comparison: `<`, `>`, `<=`, `>=`, `==`, `!=`, `===`, `!==`
- Logical: `&&`, `||`, `!`
- Ternary: `condition ? then : else`
- Math functions: `Math.floor`, `Math.ceil`, `Math.round`, `Math.abs`, `Math.sqrt`, `Math.pow`, `Math.max`, `Math.min`
- String concatenation: `+` operator with strings

**Returns:** `number | string`

**Critical Rules:** 
- `answer_formula` must evaluate to `number` for numeric problem types
- When `answer_formula` returns a number, `problemType` MUST be `'numeric'` (never `'text'`)
- `problemType: 'text'` is reserved only for non-numeric answers (e.g., word problems with text responses)

## Components and Interfaces

### Template Files

Each topic has its own file in `src/lib/templates/grade8/`:

- `absoluteValueEq.ts` - Absolute value equations
- `linearInequality.ts` - Linear inequalities
- `pythagoreanTheorem.ts` - Pythagorean theorem problems
- `quadratics.ts` - Quadratic equations and trinomials
- `quadrilateralArea.ts` - Quadrilateral area calculations
- `rationalExpression.ts` - Rational expressions
- `roots.ts` - Square roots and radicals
- `triangleSimilarityAA.ts` - Triangle similarity
- `vieta.ts` - Vieta's theorem (REQUIRES REDESIGN)
- `index.ts` - Aggregates all templates

### Vieta Template Redesign

**Current Problem:**
```typescript
// VIOLATION: Returns string instead of number
answer_formula: 'r1 < r2 ? r1 + " и " + r2 : r2 + " и " + r1'
```

**Solution - Four Separate Problem Types:**

1. **Find Sum of Roots** (numeric answer)
   ```typescript
   answer_formula: '-b / a'  // Returns number
   ```

2. **Find Product of Roots** (numeric answer)
   ```typescript
   answer_formula: 'c / a'  // Returns number
   ```

3. **Find Smaller Root** (numeric answer)
   ```typescript
   answer_formula: 'Math.min(r1, r2)'  // Returns number
   ```

4. **Find Larger Root** (numeric answer)
   ```typescript
   answer_formula: 'Math.max(r1, r2)'  // Returns number
   ```

### Constraint Patterns

**Prevent Division by Zero:**
```typescript
constraints: ['denominator !== 0', 'a !== 0']
```

**Prevent Negative Square Roots:**
```typescript
constraints: ['a >= 0', 'discriminant >= 0']
```

**Prevent Degenerate Geometry:**
```typescript
constraints: [
  'a > 0', 'b > 0', 'c > 0',           // Positive sides
  'a + b > c', 'b + c > a', 'c + a > b' // Triangle inequality
]
```

**Ensure Distinct Values:**
```typescript
constraints: ['r1 !== r2', 'a !== b']
```

**Ensure Integer Results:**
```typescript
constraints: [
  '(numerator % denominator) === 0',   // Exact division
  'Math.sqrt(value) === Math.floor(Math.sqrt(value))'  // Perfect square
]
```

## Data Models

### Parameter Types

**Integer Parameter:**
```typescript
{
  type: 'int',
  min: number,
  max: number
}
```

**Expression Parameter:**
```typescript
{
  type: 'expression',
  value: string  // Evaluated using previously defined parameters
}
```

**Choice Parameter:**
```typescript
{
  type: 'choice',
  values: (string | number)[]
}
```

### Parameter Dependency Order

Parameters are evaluated in definition order. Later parameters can reference earlier ones:

```typescript
parameters: {
  r1: { type: 'int', min: 1, max: 5 },        // Defined first
  r2: { type: 'int', min: 1, max: 5 },        // Can use r1
  sum: { type: 'expression', value: 'r1 + r2' },  // Can use r1, r2
  product: { type: 'expression', value: 'r1 * r2' }  // Can use r1, r2, sum
}
```

### Answer Types

- `'number'` (default): Single numeric value
- `'fraction'`: Fraction representation (still returns number for validation)
- `'coordinate'`: Coordinate pair (still returns number for validation)
- `'text'`: Text answer (used for problemType: 'text')

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Numeric Answer Formula Evaluation

*For any* Grade 8 template with problemType 'numeric' and *for any* valid parameter combination that satisfies all constraints, evaluating the answer_formula should return a numeric value (not a string, array, object, or undefined).

**Validates: Requirements 4.1, 4.4, 14.1**

### Property 2: No Division by Zero

*For any* Grade 8 template and *for any* valid parameter combination that satisfies all constraints, evaluating the answer_formula should not result in division by zero errors.

**Validates: Requirements 5.2, 7.5**

### Property 3: No Negative Square Root Arguments

*For any* Grade 8 template that uses sqrt() operations and *for any* valid parameter combination that satisfies all constraints, all arguments to sqrt() should be non-negative.

**Validates: Requirements 5.3**

### Property 4: Valid Geometric Constraints

*For any* Grade 8 geometry template and *for any* valid parameter combination that satisfies all constraints, geometric values should satisfy domain constraints (positive lengths, triangle inequality, valid angle measures).

**Validates: Requirements 5.4, 7.2**

### Property 5: Integer Results When Expected

*For any* Grade 8 template with problemType 'numeric' that expects integer answers and *for any* valid parameter combination that satisfies all constraints, the answer_formula should evaluate to an integer value.

**Validates: Requirements 5.5, 7.3**

### Property 6: Real Quadratic Solutions

*For any* Grade 8 quadratic template and *for any* valid parameter combination that satisfies all constraints, the discriminant (b² - 4ac) should be non-negative, ensuring real solutions exist.

**Validates: Requirements 7.1**

### Property 7: Sufficient Variant Generation

*For any* Grade 8 template, the parameter space (considering min/max ranges and constraints) should be capable of generating at least 20 distinct problem variants per difficulty level.

**Validates: Requirements 13.1**

### Property 8: Template Text Rendering

*For any* Grade 8 template and *for any* valid parameter combination that satisfies all constraints, substituting parameter values into the template string should not result in undefined or null values in the rendered text.

**Validates: Requirements 14.2**

### Property 9: Valid Parameter Space Existence

*For any* Grade 8 template and *for any* defined difficulty level, there should exist at least one parameter combination that satisfies all constraints, ensuring the template can generate valid problems.

**Validates: Requirements 14.3, 14.4**

## Error Handling

### Parameter Generation Errors

**Issue:** Constraints too restrictive, no valid parameter combinations exist

**Detection:** Variant generator attempts N iterations (default 100) and fails to find valid parameters

**Handling:**
- Log warning with template ID and difficulty level
- Return null variant
- Template author must relax constraints or adjust parameter ranges

### Formula Evaluation Errors

**Issue:** answer_formula throws error during evaluation

**Detection:** Expression parser catches error in safeEval()

**Handling:**
- Log error with formula, parameters, and error message
- Return 0 as fallback (per current implementation)
- Template author must fix formula or add constraints

### Type Mismatch Errors

**Issue:** answer_formula returns string for numeric problemType

**Detection:** Type check after formula evaluation

**Handling:**
- Log error with template ID and returned value
- Validation fails
- Template author must redesign to return numeric value

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples and edge cases for each template:

**Test Categories:**
1. **Template Structure Tests**
   - Verify required fields present (id, class, subject, topic, problemType)
   - Verify id format matches "grade8-{topicName}"
   - Verify class === 8
   - Verify at least one difficulty level defined

2. **Parameter Definition Tests**
   - Verify all parameters have valid type
   - Verify int parameters have min <= max
   - Verify expression parameters reference only defined parameters
   - Verify no circular dependencies

3. **Constraint Validation Tests**
   - Verify constraints are valid boolean expressions
   - Verify constraints reference only defined parameters
   - Verify at least one valid parameter combination exists

4. **Answer Formula Tests**
   - Verify formula syntax is valid
   - Verify formula references only defined parameters
   - Verify formula returns correct type for problemType
   - Test specific known cases (e.g., r1=2, r2=3 → sum=5)

5. **Edge Case Tests**
   - Test boundary values (min, max)
   - Test zero values where allowed
   - Test negative values where allowed
   - Test constraint boundary conditions

**Example Unit Test:**
```typescript
describe('Vieta Sum Template', () => {
  it('should return numeric sum for valid roots', () => {
    const params = { r1: 2, r2: 3, a: 1, b: -5, c: 6 };
    const result = evaluateFormula('-b / a', params);
    expect(typeof result).toBe('number');
    expect(result).toBe(5);
  });

  it('should handle negative roots', () => {
    const params = { r1: -2, r2: 3, a: 1, b: -1, c: -6 };
    const result = evaluateFormula('-b / a', params);
    expect(result).toBe(1);
  });
});
```

### Property-Based Testing Approach

Property tests verify universal properties across many generated inputs using the actual engine workflow.

**Property Test Configuration:**
- Use fast-check library for TypeScript
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: grade8-problem-templates, Property {N}: {property_text}`
- **Primary approach:** Use `variantGenerator(template)` to test the real generation pipeline
- **Secondary approach:** Direct parameter generation only when testing specific edge cases

**Property Test Structure (Primary Approach):**
```typescript
import fc from 'fast-check';
import { variantGenerator } from '@/lib/engine/variantGenerator';

describe('Property: Numeric Answer Formula Evaluation', () => {
  it('should always return number for numeric templates', () => {
    // Feature: grade8-problem-templates, Property 1: Numeric Answer Formula Evaluation
    const template = grade8VietaSumTemplate;
    
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // difficulty level
        (difficulty) => {
          const variant = variantGenerator(template, difficulty);
          
          // Skip if variant generation failed (constraints too restrictive)
          if (!variant) return true;
          
          // Verify answer is numeric
          return typeof variant.answer === 'number';
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property Test Structure (Secondary Approach - Edge Cases Only):**
```typescript
describe('Property: No Division by Zero', () => {
  it('should never divide by zero in rational expressions', () => {
    // Feature: grade8-problem-templates, Property 2: No Division by Zero
    fc.assert(
      fc.property(
        fc.record({
          numerator: fc.integer({ min: -10, max: 10 }),
          denominator: fc.integer({ min: -10, max: 10 }).filter(d => d !== 0)
        }),
        (params) => {
          // Test specific formula with edge case parameters
          const result = evaluateFormula('numerator / denominator', params);
          return typeof result === 'number' && isFinite(result);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property Tests to Implement:**

1. **Numeric Answer Formula** (Property 1)
   - Use `variantGenerator(template, difficulty)` for each template
   - Verify variant is not null (valid parameters exist)
   - Verify `variant.answer` is a number
   - Verify `template.problemType === 'numeric'` when answer is numeric

2. **No Division by Zero** (Property 2)
   - Use `variantGenerator(template, difficulty)` for templates with division
   - Verify variant generation succeeds
   - Verify answer is finite (not Infinity or NaN)

3. **No Negative Square Roots** (Property 3)
   - Use `variantGenerator(template, difficulty)` for templates with sqrt
   - Verify variant generation succeeds
   - For geometry templates, verify all side lengths are positive

4. **Valid Geometric Constraints** (Property 4)
   - Use `variantGenerator(template, difficulty)` for geometry templates
   - Verify triangle inequality holds for triangle problems
   - Verify all lengths are positive integers (when using Pythagorean triples)

5. **Integer Results** (Property 5)
   - Use `variantGenerator(template, difficulty)` for integer-answer templates
   - Verify `variant.answer` is an integer (answer === Math.floor(answer))

6. **Real Quadratic Solutions** (Property 6)
   - Use `variantGenerator(template, difficulty)` for quadratic templates
   - Verify variant generation succeeds (discriminant >= 0 enforced by constraints)
   - Verify answer is a real number

7. **Sufficient Variants** (Property 7)
   - For each template and difficulty
   - Generate 100 variants using `variantGenerator`
   - Count unique problem texts
   - Assert unique count >= 20

8. **Template Rendering** (Property 8)
   - Use `variantGenerator(template, difficulty)`
   - Verify `variant.problemText` contains no undefined/null placeholders
   - Verify all {param} placeholders are replaced

9. **Valid Parameter Space** (Property 9)
   - For each template and difficulty
   - Attempt `variantGenerator(template, difficulty)`
   - Assert at least one successful generation (variant !== null)

### Integration Testing

Integration tests verify templates work correctly with the actual engine:

1. **Variant Generation Test**
   - Call variantGenerator with template
   - Verify variant generated successfully
   - Verify all fields populated

2. **Answer Validation Test**
   - Generate variant
   - Evaluate answer_formula
   - Call answerValidator with correct answer
   - Verify validation passes

3. **End-to-End Test**
   - Generate problem from template
   - Render problem text
   - Validate student answer
   - Verify feedback generated

### Test Coverage Goals

- 100% of templates have unit tests
- 100% of templates pass all property tests
- All 9 correctness properties verified
- All edge cases covered
- All constraint patterns tested
