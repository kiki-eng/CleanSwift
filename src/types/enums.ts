export type Role = 'CUSTOMER' | 'CLEANER' | 'ADMIN';

export type CleanerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED';

export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type JobMode = 'FIRST_COME' | 'CUSTOMER_SELECTS';

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'OTHER';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export type ListingRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
