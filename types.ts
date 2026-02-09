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
  DRAFT = 'Draft',
  EXPIRED = 'Expired'
}

export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer'
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'Active' | 'Inactive';
}

export interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  affectedItem: string;
  timestamp: number;
}

export interface JobFees {
  general: string;
  obc: string;
  sc_st: string;
}

export interface JobDates {
  start: string;
  end: string;
  exam: string;
}

export interface JobSEO {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export interface Job {
  id: string;
  job_name: string;
  organization: string;
  min_age: number;
  max_age: number;
  qualification: Qualification;
  category: Category | 'All';
  gender: Gender | 'All';
  state: string;
  isCentral: boolean;
  competition_level: CompetitionLevel;
  apply_link: string;
  official_website?: string;
  status: JobStatus;
  deadline: string;
  required_streams: string[];
  salary_range: string;
  notification_link?: string;
  syllabus_link?: string;
  fees: JobFees;
  dates: JobDates;
  shortDescription: string;
  seo: JobSEO;
}

export interface UserProfile {
  age: number | '';
  qualification: Qualification | '';
  stream: string;
  category: Category | '';
  gender: Gender;
  statePreference: string;
}

export type AlertFrequency = 'Instant' | 'Daily' | 'Weekly';
export type NotificationChannel = 'WhatsApp' | 'Telegram' | 'Email';
export type AlertType = 'New Job' | 'Deadline' | 'Admit Card' | 'Result';

export interface AlertPreferences {
  contact: string;
  isSubscribed: boolean;
  categories: string[];
  alertTypes: AlertType[];
  locations: string[];
  frequency: AlertFrequency;
  channels: NotificationChannel[];
  deadlineDays: number;
  lastUpdated: number;
}

export interface QuickLink {
  id: string;
  text: string;
  url: string;
  publishDate?: string;
  jobId?: string;
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
    answerKeys: QuickLink[];
  };
  banner: {
    badgeText: string;
    title: string;
    highlight: string;
    description: string;
    buttonText: string;
  };
  settings: {
    siteName: string;
    primaryColor: string;
    accentColor: string;
    footerText: string;
    telegramLink: string;
    whatsappLink: string;
    enableNotifications: boolean;
  };
}