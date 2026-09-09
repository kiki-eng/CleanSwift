import React from 'react';

import { EmptyState, Screen } from '../../components';

/** Next feature pass: booking status timeline, actions (cancel/start/complete), review. */
export function BookingDetailsScreen(): React.JSX.Element {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="calendar-outline"
        title="Booking Details"
        message="Status tracking and actions are coming in the next feature pass."
      />
    </Screen>
  );
}
