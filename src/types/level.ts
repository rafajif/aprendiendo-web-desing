export interface ElementTarget {
  selector: string;
  expectedCenterX: number;
  expectedCenterY: number;
  expectedWidth: number;
  expectedHeight: number;
  tolerance: number;
}

export interface Level {
  id: string;
  chapterId: string;
  titleKey: string;
  instructionKey: string;
  scaffoldHTML: string;
  initialCSS: string;
  solution: string;
  targets: ElementTarget[];
  hints: [string, string, string];
  tags: string[];
}

export interface Chapter {
  id: string;
  nameKey: string;
  levelIds: string[];
}
