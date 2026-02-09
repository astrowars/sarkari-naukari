export enum Qualification {
  TENTH = '10th Pass',
  TWELFTH = '12th Pass',
  GRADUATE = 'Graduate',
  POST_GRADUATE = 'Post Graduate'
}

export enum Category {
  GENERAL = 'General',
  OBC = 'OBC',
  SC = 'SC',
  ST = 'ST'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum CompetitionLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum JobStatus {
  ACTIVE = 'Active',
  CLOSED = 'Closed',
  DRAFT = 'Draft'
}

export interface Job {
  id: string;
  job_name: string;
  min_age: number;
  max_age: number;
  qualification: Qualification;
  category: Category | 'All';
  gender: Gender | 'All';
  state: string;
  competition_level: CompetitionLevel;
  apply_link: string;
  official_website?: string;
  status: JobStatus;
  deadline: string;
  required_streams: string[];
  salary_range: string;
  notification_link?: string;
  syllabus_link?: string;
}

export interface UserProfile {
  age: number | '';
  qualification: Qualification | '';
  stream: string;
  category: Category | '';
  gender: Gender;
  statePreference: string;
}

// --- Alert System Types ---

export type AlertFrequency = 'Instant' | 'Daily' | 'Weekly';
export type NotificationChannel = 'WhatsApp' | 'Telegram' | 'Email';
export type AlertType = 'New Job' | 'Deadline' | 'Admit Card' | 'Result';

export interface AlertPreferences {
  contact: string; // Phone or Email
  isSubscribed: boolean;
  categories: string[]; // e.g., 'SSC', 'Banking'
  alertTypes: AlertType[];
  locations: string[]; // e.g., 'All India', 'UP'
  frequency: AlertFrequency;
  channels: NotificationChannel[];
  deadlineDays: number; // Notification days before deadline
  lastUpdated: number;
}

// --- Dynamic Site Configuration ---

export interface QuickLink {
  id: string;
  text: string;
  url: string;
}

export interface SiteConfig {
  hero: {
    titlePrefix: string;
    titleGradient: string;
    titleSuffix: string;
    description: string;
    showFlag: boolean;
    showLoginPill: boolean;
    loginPillText: string;
  };
  lists: {
    results: QuickLink[];
    admitCards: QuickLink[];
    latestJobs: QuickLink[];
  };
  banner: {
    badgeText: string;
    title: string;
    highlight: string;
    description: string;
    buttonText: string;
  };
}