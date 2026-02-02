
export type Level = 'primary' | 'middle' | 'secondary';

export interface Grade {
  id: number;
  label: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface Specialization {
  id: string;
  name: string;
  icon: string;
}

export interface LessonContent {
  title: string;
  explanation: string;
  youtubeId: string;
  keyPoints: string[];
}

export type ReviewPeriod = 'semester1' | 'semester2' | 'semester3' | 'full_year' | 'certificate_prep';

export type ViewState = 'home' | 'grades' | 'mode_selection' | 'specializations' | 'subjects' | 'review_periods' | 'lesson' | 'review';

// Adding missing types for TemplateSelector and DocumentPreview components
export type TemplateType = 'modern' | 'tech' | 'creative' | 'professional';

export interface DocumentState {
  template: TemplateType;
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  author?: string;
  date: string;
  ctaText?: string;
}
