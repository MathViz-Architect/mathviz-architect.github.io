# Requirements Document

## Introduction

This document specifies requirements for the Grade 8 Problem Engine templates in the MathViz Architect educational platform. The Problem Engine generates adaptive math problems through a pipeline: ProblemTemplate → VariantGenerator → GeneratedProblem → AssessmentEngine → AdaptiveEngine. Templates define problem structures with randomizable parameters to create many variants at different difficulty levels.

## Glossary

- **Problem_Engine**: The adaptive task generator component that creates math problems from templates
- **Template**: A ProblemTemplate object defining problem structure, parameters, and answer formulae
- **Variant**: A specific problem instance generated from a template with concrete parameter values
- **Difficulty_Level**: An integer from 1 to 4 indicating problem complexity (1=easiest, 4=hardest)
- **Parameter**: A variable in a template that can be randomized within specified constraints
- **Answer_Formula**: A numeric expression that evaluates to the correct answer using parameter values
- **Expression_Parser**: The engine component that evaluates answer_formula strings
- **Constraint**: A boolean condition that parameter values must satisfy
- **Grade8_Template_Set**: The collection of all problem templates for Grade 8 mathematics

## Requirements

### Requirement 1: Template Structure Compliance

**User Story:** As a Problem Engine developer, I want all Grade 8 templates to follow the ProblemTemplate interface, so that the engine can process them correctly.

#### Acceptance Criteria

1. THE Template SHALL include an id field in format "grade8-{topicName}"
2. THE Template SHALL set class field to 8
3. THE Template SHALL set subject field to one of: "algebra", "geometry", "probability", "logic"
4. THE Template SHALL include a topic field identifying the mathematical topic
5. THE Template SHALL set problemType to one of: "numeric", "comparison", "text", "magicSquare"
6. THE Template SHALL include a difficulties object with at least one difficulty level (1, 2, 3, or 4)

### Requirement 2: Difficulty Configuration

**User Story:** As an educator, I want problems at multiple difficulty levels, so that students can progress from basic to advanced concepts.

#### Acceptance Criteria

1. WHEN a Template includes difficulty level N, THE Template SHALL provide a DifficultyConfig for level N
2. THE DifficultyConfig SHALL include a template string with problem text
3. THE DifficultyConfig SHALL include a parameters object defining all variables
4. THE DifficultyConfig SHALL include an answer_formula string
5. WHERE constraints are needed, THE DifficultyConfig SHALL include a constraints array of boolean expressions

### Requirement 3: Parameter Definition

**User Story:** As a Problem Engine developer, I want parameters to be properly typed and bounded, so that generated problems have valid values.

#### Acceptance Criteria

1. THE Parameter SHALL specify a type field: "int", "expression", or other supported types
2. WHEN Parameter type is "int", THE Parameter SHALL include min and max fields
3. WHEN Parameter type is "expression", THE Parameter SHALL include a value field with a numeric expression
4. THE Parameter constraints SHALL reference only previously defined parameters
5. THE Parameter min and max values SHALL ensure non-degenerate problems

### Requirement 4: Answer Formula Compliance

**User Story:** As a Problem Engine developer, I want answer formulae to evaluate correctly, so that the engine can verify student responses.

#### Acceptance Criteria

1. THE Answer_Formula SHALL contain only numeric expressions
2. THE Answer_Formula SHALL use only allowed operations: +, -, *, /, ^, sqrt(), Math functions
3. THE Answer_Formula SHALL NOT contain strings, arrays, objects, or template literals
4. THE Answer_Formula SHALL evaluate to a numeric value for all valid parameter combinations
5. THE Answer_Formula SHALL reference only parameters defined in the DifficultyConfig

### Requirement 5: Constraint Validation

**User Story:** As a Problem Engine developer, I want constraints to prevent invalid parameter combinations, so that all generated problems are solvable and meaningful.

#### Acceptance Criteria

1. WHEN constraints are specified, THE Template SHALL ensure they are boolean expressions
2. THE Constraint SHALL prevent division by zero in answer formulae
3. THE Constraint SHALL prevent negative values under square roots
4. THE Constraint SHALL prevent degenerate geometric cases (e.g., zero-length sides)
5. THE Constraint SHALL ensure integer results when problemType is "numeric" and integers are expected

### Requirement 6: Template Organization

**User Story:** As a developer, I want templates organized by topic, so that I can easily locate and maintain them.

#### Acceptance Criteria

1. THE Grade8_Template_Set SHALL organize templates in separate files by topic
2. THE Template file SHALL export an array named "grade8{TopicName}Templates"
3. THE index.ts file SHALL import all topic template arrays
4. THE index.ts file SHALL export a combined "grade8Templates" array
5. THE Template file SHALL include comments documenting the generation strategy

### Requirement 7: Mathematical Correctness

**User Story:** As an educator, I want generated problems to be mathematically correct, so that students learn accurate concepts.

#### Acceptance Criteria

1. WHEN a Template generates quadratic equations, THE Template SHALL build from roots to ensure real solutions
2. WHEN a Template involves geometric figures, THE Template SHALL satisfy triangle inequality and other geometric constraints
3. WHEN a Template requires integer answers, THE Template SHALL construct parameters to guarantee integer results
4. THE Template SHALL avoid floating-point precision errors in answer evaluation
5. WHEN a Template involves fractions, THE Template SHALL ensure denominators are non-zero

### Requirement 8: Difficulty Progression

**User Story:** As an educator, I want difficulty levels to progress logically, so that students build skills incrementally.

#### Acceptance Criteria

1. WHEN a Template has multiple difficulty levels, THE Template SHALL increase complexity from level 1 to level 4
2. THE Difficulty_Level 1 SHALL focus on basic concept recognition
3. THE Difficulty_Level 2 SHALL require simple calculations
4. THE Difficulty_Level 3 SHALL involve multi-step problem solving
5. THE Difficulty_Level 4 SHALL include complex scenarios or negative/fractional values

### Requirement 9: Template Hints and Solutions

**User Story:** As a student, I want helpful hints and step-by-step solutions, so that I can learn from my mistakes.

#### Acceptance Criteria

1. WHERE pedagogically appropriate, THE DifficultyConfig SHALL include a hint field
2. WHERE pedagogically appropriate, THE DifficultyConfig SHALL include a solution array
3. THE Solution array SHALL contain explanation objects showing problem-solving steps
4. THE Hint SHALL reference parameter values using {parameterName} syntax
5. THE Solution SHALL show intermediate calculations leading to the answer

### Requirement 10: Common Mistake Handling

**User Story:** As an educator, I want to identify common student errors, so that I can provide targeted feedback.

#### Acceptance Criteria

1. WHERE common errors are predictable, THE DifficultyConfig SHALL include a common_mistakes array
2. THE Common_Mistake SHALL specify a pattern field matching the incorrect answer
3. THE Common_Mistake SHALL include a feedback field explaining the error
4. THE Feedback SHALL guide students toward the correct approach
5. THE Pattern SHALL use parameter expressions to match typical calculation errors

### Requirement 11: Topic Coverage

**User Story:** As an educator, I want comprehensive Grade 8 topic coverage, so that the curriculum is complete.

#### Acceptance Criteria

1. THE Grade8_Template_Set SHALL include templates for core algebra topics: quadratics, linear inequalities, rational expressions, roots
2. THE Grade8_Template_Set SHALL include templates for core geometry topics: Pythagorean theorem, triangle similarity, quadrilateral areas
3. THE Grade8_Template_Set SHALL include templates for absolute value equations
4. THE Grade8_Template_Set SHALL include templates for Vieta's theorem
5. WHEN new topics are added, THE Template SHALL follow existing naming and structure conventions

### Requirement 12: Engine Compatibility

**User Story:** As a Problem Engine developer, I want templates to work within engine limitations, so that the system functions reliably.

#### Acceptance Criteria

1. THE Template SHALL NOT modify the Problem Engine code
2. THE Template SHALL NOT modify Grade 7 templates
3. THE Template SHALL reside only in src/lib/templates/grade8/ directory
4. THE Template SHALL use only Expression_Parser supported operations
5. THE Template SHALL avoid overengineering and follow existing template patterns

### Requirement 13: Parameter Randomization

**User Story:** As an educator, I want sufficient problem variety, so that students cannot memorize answers.

#### Acceptance Criteria

1. THE Template SHALL define parameter ranges that generate at least 20 distinct problem variants
2. THE Parameter ranges SHALL balance variety with pedagogical appropriateness
3. WHEN parameters are interdependent, THE Template SHALL use expression type parameters
4. THE Template SHALL use constraints to filter out near-duplicate problems
5. THE Parameter randomization SHALL maintain consistent difficulty within each level

### Requirement 14: Template Testing

**User Story:** As a developer, I want to verify template correctness, so that I can catch errors before deployment.

#### Acceptance Criteria

1. FOR ALL valid parameter combinations, THE Answer_Formula SHALL evaluate without errors
2. FOR ALL valid parameter combinations, THE Template text SHALL render without undefined values
3. THE Template SHALL generate at least one valid problem variant per difficulty level
4. WHEN constraints are specified, THE Template SHALL have sufficient valid parameter space
5. THE Template SHALL produce answers matching expected mathematical results
