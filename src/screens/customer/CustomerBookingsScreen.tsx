import React from 'react';

import { EmptyState, Screen } from '../../components';

/** Next feature pass: full booking history (jobs + listing requests) with filters. */
export function CustomerBookingsScreen(): React.JSX.Element {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="calendar-outline"
        title="Your Bookings"
        message="Booking history and management are coming in the next feature pass."
      />
    </Screen>
  );
}
