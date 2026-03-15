// Types for the MathViz Architect application

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ObjectStyle {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  dash?: boolean;
}

export interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'image' | 'chart' | 'fraction' | 'arrow' | 'group' | 'triangle' | 'polygon' | 'geoshape' | 'geopoint' | 'geosegment' | 'geoangle' | 'freehand';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  data: Record<string, unknown>;
  style?: ObjectStyle;
}

export interface RectangleObject extends CanvasObject {
  type: 'rectangle';
  data: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    cornerRadius: number;
  };
}

export interface CircleObject extends CanvasObject {
  type: 'circle';
  data: {
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
}

export interface TriangleObject extends CanvasObject {
  type: 'triangle';
  data: {
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
}

export interface PolygonObject extends CanvasObject {
  type: 'polygon';
  data: {
    points: { x: number; y: number }[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    label: string;
  };
}

export interface FractionObject extends CanvasObject {
  type: 'fraction';
  data: {
    numerator: number;
    denominator: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    showLabels: boolean;
  };
}

export interface ChartObject extends CanvasObject {
  type: 'chart';
  data: {
    chartType: 'bar' | 'pie' | 'line';
    data: Array<{ label: string; value: number; color: string }>;
    title: string;
  };
}

export interface TextObject extends CanvasObject {
  type: 'text';
  data: {
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fill: string;
    textAlign: 'left' | 'center' | 'right';
  };
}

export interface ArrowObject extends CanvasObject {
  type: 'arrow';
  data: {
    points: Point[];
    stroke: string;
    strokeWidth: number;
    arrowHead: 'end' | 'both' | 'none';
  };
}

export interface LineObject extends CanvasObject {
  type: 'line';
  data: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    strokeWidth: number;
    arrowStart?: boolean;
    arrowEnd?: boolean;
  };
}

export interface ImageObject extends CanvasObject {
  type: 'image';
  data: {
    url: string;
    alt?: string;
  };
}


export interface GeoShapeObject extends CanvasObject {
  type: 'geoshape';
  data: {
    shapeKind: 'circle' | 'triangle' | 'quadrilateral';
    // circle
    radius?: number;
    // triangle sides
    sideA?: number;
    sideB?: number;
    sideC?: number;
    // quadrilateral sides
    sideAB?: number;
    sideBC?: number;
    sideCD?: number;
    sideDA?: number;
    stroke: string;
    strokeWidth: number;
  };
}

export interface GeoPointObject extends CanvasObject {
  type: 'geopoint';
  data: {
    color: string;
    radius: number;
    label?: string;
  };
}

export interface GeoSegmentObject extends CanvasObject {
  type: 'geosegment';
  data: {
    pointAId: string;
    pointBId: string;
    color: string;
    strokeWidth: number;
  };
}

export interface GeoAngleObject extends CanvasObject {
  type: 'geoangle';
  data: {
    // B is the vertex, A and C are the two rays
    pointAId: string;
    pointBId: string;
    pointCId: string;
    color: string;
    arcRadius: number;   // visual radius of the arc, px
    showLabel: boolean;
  };
}

export interface FreehandPathObject extends CanvasObject {
  type: 'freehand';
  data: {
    points: { x: number; y: number }[];
    color: string;
    width: number;
  };
}

export type AnyCanvasObject = RectangleObject | CircleObject | TriangleObject | PolygonObject | GeoShapeObject | GeoPointObject | GeoSegmentObject | GeoAngleObject | FreehandPathObject | FractionObject | ChartObject | TextObject | ArrowObject | LineObject | ImageObject | CanvasObject;

export interface Page {
  id: string;
  title: string;
  objects: AnyCanvasObject[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  objects: AnyCanvasObject[];
  pages?: Page[];
  activePageId?: string;
  canvasSize: Size;
  backgroundColor: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  tools: Tool[];
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  category: string;
  createObject: () => Partial<AnyCanvasObject>;
}

export type AppMode = 'select' | 'draw' | 'text' | 'shape' | 'library' | 'challenge' | 'interactive' | 'fraction' | 'chart' | 'arrow' | 'line' | 'eraser' | 'projects' | 'geopoint' | 'geosegment' | 'geoangle' | 'freehand';

export interface AppState {
  mode: AppMode;
  selectedObjectIds: string[];
  objects: AnyCanvasObject[];
  projectPath: string | null;
  projectName: string;
  isDirty: boolean;
  pages: Page[];
  activePageId: string;
}

// Challenge types - New Template Architecture
export type ParameterDef =
  | { type: 'int'; min: number; max: number }
  | { type: 'choice'; values: (string | number)[] }
  | { type: 'expression'; value: string };

export interface SolutionStep {
  explanation: string;
  expression?: string;
  result?: string;
}

export interface CommonMistake {
  pattern: string;
  feedback: string;
}

export type AnswerType =
  | 'number'       // ✅ реализовано
  | 'fraction'     // ✅ реализовано
  | 'coordinate'   // ✅ реализовано
  | 'text'         // ✅ реализовано
  | 'expression'   // ✅ MathJS: symbolically equivalent expressions (x1=2, x2=5)
  | 'interval'     // ✅ MathJS: intervals like [2; +inf) or (-3; 5]
  | 'set';         // 🔜 зарезервировано

export interface DifficultyConfig {
  template: string;
  parameters: Record<string, ParameterDef>;
  answer_formula: string;
  constraints?: string[];
  solution?: SolutionStep[];
  hint?: string;
  hints?: string[];  // Multiple hints for progressive reveal
  common_mistakes?: CommonMistake[];
  answer_type?: AnswerType;  // default: 'number'
}

export interface ProblemTemplate {
  id: string;
  class: number;
  subject: 'algebra' | 'geometry' | 'probability' | 'logic';
  section: string;
  topic: string;
  topic_title: string;
  problemType: 'numeric' | 'multiple_choice' | 'comparison' | 'text' | 'magicSquare' | 'canvas_action';
  difficulties: Partial<Record<1 | 2 | 3 | 4, DifficultyConfig>>;
  relatedModule?: string;
  skills?: string[];
  tags?: string[];        // для поиска, фильтрации и coverage-анализа
  version?: number;       // для будущих миграций и аналитики
}

export interface GeneratedProblem {
  id: string;
  template_id: string;
  seed: number;              // для воспроизводимости задачи
  params: Record<string, number | string>;
  question: string;
  answer: number | string;
  hint?: string;
  hints?: string[];          // Progressive hints for the task
  solution?: SolutionStep[];
  answer_type?: AnswerType;  // default: 'number'
  canvasAction?: CanvasActionTarget;  // For canvas_action problem type
}

export interface CanvasActionTarget {
  action: 'move_point' | 'draw_line' | 'plot_function' | 'place_point';
  targetData: {
    point?: { x: number; y: number };
    line?: { x1: number; y1: number; x2: number; y2: number };
    function?: string;
    coordinates?: { x: number; y: number };
  };
  tolerance?: number;  // Pixel tolerance for canvas actions
}

// Legacy types for backward compatibility
export interface GeneratedData {
  [key: string]: number | string | number[] | (number | string)[];
}

export interface StaticChallenge {
  type: 'static';
  id: string;
  title: string;
  description?: string;
  category: string;
  topic: string;
  difficulty: number;
  question: string;
  hint?: string;
  correctAnswer: string;
  explanation?: string;
}

export interface GeneratedChallenge {
  type: 'generated';
  id: string;
  title: string;
  category: string;
  topic: string;
  difficulty: number;
  generator: () => GeneratedData;
  render: (data: GeneratedData) => { question: string; hint?: string };
  validate: (data: GeneratedData, answer: string) => boolean;
  explanation?: (data: GeneratedData) => string;
}

export type Challenge = StaticChallenge | GeneratedChallenge;

export type SkillLevel = 'not_started' | 'practicing' | 'proficient' | 'mastered';

export interface TopicProgress {
  topicKey: string;
  attempts: number;
  correct: number;
  streak: number;
  level: SkillLevel;
}

export interface StudentProgress {
  topics: Record<string, TopicProgress>;
}

// Curriculum structure types (used in ChallengeMode)
export interface CurriculumTopic {
  name: string;
  challenges: Challenge[];
  templates: ProblemTemplate[];
  prerequisites?: string[];
}

export interface CurriculumSubject {
  name: string;
  topics: Record<string, CurriculumTopic>;
}

export interface CurriculumCategory {
  name: string;
  color: string;
  subjects: Record<string, CurriculumSubject>;
}

// ── Room & Collaboration Types ──────────────────────────────────────────────
export type UserRole = 'teacher' | 'student';
export type BoardMode = 'view' | 'student_turn' | 'collaboration';

export interface BoardSettings {
  mode: BoardMode;
  activeStudentId: string | null;
}
