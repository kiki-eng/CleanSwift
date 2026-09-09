/**
 * Single source of truth for every backend path.
 * Change the base URL in src/config/env.ts; change paths here.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    registerCustomer: '/auth/register/customer',
    registerCleaner: '/auth/register/cleaner',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },
  users: {
    me: '/users/me',
    preferences: '/users/me/preferences',
    deactivate: '/users/me/deactivate',
  },
  dashboard: {
    customer: '/dashboard/customer',
    cleaner: '/dashboard/cleaner',
  },
  cleanerProfiles: {
    me: '/cleaner-profiles/me',
    apply: '/cleaner-profiles/apply',
    public: '/cleaner-profiles/public',
    publicById: (userId: string) => `/cleaner-profiles/public/${userId}`,
  },
  listings: {
    root: '/cleaner-listings',
    byId: (id: string) => `/cleaner-listings/${id}`,
  },
  listingRequests: {
    root: '/listing-requests',
    mine: '/listing-requests/my-requests',
    forCleaner: '/listing-requests/cleaner-requests',
    status: (id: string) => `/listing-requests/${id}/status`,
    byId: (id: string) => `/listing-requests/${id}`,
  },
  jobs: {
    root: '/jobs',
    myPostings: '/jobs/my-postings',
    open: '/jobs/open',
    myJobs: '/jobs/my-jobs',
    byId: (id: string) => `/jobs/${id}`,
    cancel: (id: string) => `/jobs/${id}/cancel`,
    accept: (id: string) => `/jobs/${id}/accept`,
    start: (id: string) => `/jobs/${id}/start`,
    complete: (id: string) => `/jobs/${id}/complete`,
  },
  applications: {
    apply: (jobId: string) => `/job-applications/job/${jobId}/apply`,
    forJob: (jobId: string) => `/job-applications/job/${jobId}`,
    accept: (id: string) => `/job-applications/${id}/accept`,
  },
  reviews: {
    forJob: (jobId: string) => `/reviews/job/${jobId}`,
    forListingRequest: (requestId: string) => `/reviews/listing-request/${requestId}`,
    forCleaner: (cleanerUserId: string) => `/reviews/cleaner/${cleanerUserId}`,
  },
  notifications: {
    root: '/notifications',
    unreadCount: '/notifications/unread-count',
    markAllRead: '/notifications/mark-all-read',
    deviceToken: '/notifications/device-token',
    byId: (id: string) => `/notifications/${id}`,
  },
} as const;
