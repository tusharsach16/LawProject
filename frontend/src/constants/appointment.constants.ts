// Status constants
export const APPOINTMENT_STATUS = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
} as const;

// UI Constants
export const STATUS_BADGE_CLASSES = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
} as const;

export const TABS = [
    { key: 'all' as const, label: 'All Appointments' },
    { key: 'scheduled' as const, label: 'Scheduled' },
    { key: 'completed' as const, label: 'Completed' },
    { key: 'cancelled' as const, label: 'Cancelled' },
];

export const USER_TABS = [
    { key: 'scheduled' as const, label: 'Scheduled' },
    { key: 'completed' as const, label: 'Completed' },
    { key: 'cancelled' as const, label: 'Cancelled' },
];

// Timing Constants
export const REFUND_HOURS_THRESHOLD = 12;
export const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
export const PENDING_PAYMENT_EXPIRY = 15 * 60 * 1000; // 15 minutes
export const DEBOUNCE_DELAY = 500; // 500ms for search debouncing

// Sort Options
export const SORT_OPTIONS = [
    { value: 'ratings', label: 'Sort by Rating' },
    { value: 'experience', label: 'Sort by Experience' },
    { value: 'price', label: 'Sort by Price' },
];