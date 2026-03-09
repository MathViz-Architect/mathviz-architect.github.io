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
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'image' | 'chart' | 'fraction' | 'arrow' | 'group' | 'triangle' | 'polygon' | 'geoshape';
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

export type AnyCanvasObject = RectangleObject | CircleObject | TriangleObject | PolygonObject | GeoShapeObject | FractionObject | ChartObject | TextObject | ArrowObject | LineObject | CanvasObject;

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  objects: AnyCanvasObject[];
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

export type AppMode = 'select' | 'draw' | 'text' | 'shape' | 'library' | 'challenge' | 'interactive' | 'fraction' | 'chart' | 'arrow' | 'line' | 'eraser' | 'projects';

export interface AppState {
  mode: AppMode;
  selectedObjectIds: string[];
  objects: AnyCanvasObject[];
  projectPath: string | null;
  projectName: string;
  isDirty: boolean;
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
  | 'number'       // ✅ реализовать
  | 'fraction'     // ✅ реализовать
  | 'coordinate'   // ✅ реализовать
  | 'expression'   // 🔜 зарезервировать
  | 'interval'     // 🔜 зарезервировать
  | 'set';         // 🔜 зарезервировать

export interface DifficultyConfig {
  template: string;
  parameters: Record<string, ParameterDef>;
  answer_formula: string;
  constraints?: string[];
  solution?: SolutionStep[];
  hint?: string;
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
  problemType: 'numeric' | 'multiple_choice' | 'comparison' | 'text';
  difficulties: Partial<Record<1 | 2 | 3 | 4, DifficultyConfig>>;
  relatedModule?: string;
  skills?: string[];
}

export interface GeneratedProblem {
  id: string;
  template_id: string;
  params: Record<string, number | string>;
  question: string;
  answer: number | string;
  hint?: string;
  solution?: SolutionStep[];
  answer_type?: AnswerType;  // default: 'number'
}

// Legacy types for backward compatibility
export interface GeneratedData {
  [key: string]: number | string;
}

export interface StaticChallenge {
  type: 'static';
  id: string;
  title: string;
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
