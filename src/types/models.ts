import type {
  ApplicationStatus,
  CleanerStatus,
  JobMode,
  JobStatus,
  ListingRequestStatus,
  ListingStatus,
  NotificationPriority,
  NotificationStatus,
  PropertyType,
  Role,
} from './enums';

/** Backend uses snake_case keys; models mirror the wire format 1:1. */

export interface User {
  id: string;
  created_at: number;
  updated_at: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string | null;
  profile_photo_url?: string | null;
  role: Role;
  is_active?: boolean | null;
  email_verified?: boolean;
  phone_number?: string | null;
  location?: string | null;
}

export interface CleanerProfile {
  id: string;
  created_at: number;
  updated_at: number;
  user_id: string;
  status: CleanerStatus;
  is_individual: boolean;
  company_name?: string | null;
  cleaning_experience?: string | null;
  hourly_rate?: number | null;
  service_areas?: string[] | null;
  specialties?: string[] | null;
  average_rating?: number | null;
  total_jobs_completed?: number | null;
  total_listing_requests_completed?: number | null;
  total_reviews?: number | null;
  background_checked?: boolean | null;
  rejection_reason?: unknown;
  user?: User | null;
  listings?: CleanerListing[] | null;
}

export interface CleanerListing {
  id: string;
  cleaner_id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string | null;
  status: ListingStatus;
  cleaner?: CleanerProfile | null;
}

export interface ListingRequest {
  id: string;
  listing_id: string;
  customer_id: string;
  status: ListingRequestStatus;
  requested_date: string;
  address: string;
  additional_notes?: string | null;
  image_url?: string | null;
  created_at?: number;
  listing?: CleanerListing | null;
  customer?: User | null;
}

export interface Job {
  id: string;
  created_at: number;
  updated_at: number;
  customer_id: string;
  assigned_cleaner_id?: string | null;
  status: JobStatus;
  mode: JobMode;
  title: string;
  description: string;
  property_type: PropertyType;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  scheduled_date: number;
  estimated_duration: number;
  budget: number;
  currency: string;
  special_requirements?: string[] | null;
  customer?: User | null;
  assigned_cleaner?: CleanerProfile | null;
}

export interface JobApplication {
  id: string;
  created_at: number;
  job_id: string;
  cleaner_id: string;
  status: ApplicationStatus;
  cover_letter?: string | null;
  proposed_price?: number | null;
  job?: Job | null;
  cleaner?: CleanerProfile | null;
}

export interface Review {
  id: string;
  created_at: number;
  job_id?: string | null;
  listing_request_id?: string | null;
  customer_id: string;
  cleaner_id: string;
  rating: number;
  comment?: string | null;
  customer?: User | null;
}

export interface AppNotification {
  id: string;
  created_at: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  entity_type?: string | null;
  entity_id?: string | null;
  action_url?: string | null;
  read_at?: number | null;
}

export interface NotificationPreferences {
  job_updates?: boolean;
  payment_alerts?: boolean;
  application_updates?: boolean;
  push_notifications?: boolean;
  email_notifications?: boolean;
}

export interface UserPreferences {
  timezone?: string | null;
  notifications?: NotificationPreferences | null;
  settings?: Record<string, unknown> | null;
}

export interface CustomerDashboard {
  total_requests: number;
  total_jobs_booked: number;
  total_spent: number;
}

export interface CleanerDashboard {
  total_jobs: number;
  total_listings: number;
  active_listings: number;
  completed_requests: number;
  total_earnings: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string | null;
}

export interface AuthPayload extends AuthTokens {
  user: User;
}
