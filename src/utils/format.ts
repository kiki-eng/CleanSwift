import type { User } from '../types/models';

export function formatMoney(amount: number, currency = 'NGN'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currency === 'NGN' ? '₦' : `${currency} `}${formatted}`;
}

/** Unix seconds → "Mon, Jan 5 · 2:30 PM" */
export function formatUnixDate(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const day = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${day} · ${time}`;
}

/** ISO string → same display format, falling back to the raw string. */
export function formatIsoDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return formatUnixDate(date.getTime() / 1000);
}

export function displayName(user: User | null | undefined): string {
  if (!user) {
    return '';
  }
  return user.full_name ?? `${user.first_name} ${user.last_name}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function capitalize(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
