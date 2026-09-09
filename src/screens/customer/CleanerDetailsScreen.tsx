import React from 'react';

import { EmptyState, Screen } from '../../components';

/** Next feature pass: cleaner profile, reviews, and direct booking. */
export function CleanerDetailsScreen(): React.JSX.Element {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="person-outline"
        title="Cleaner Details"
        message="Profile, reviews, and direct booking land in the next feature pass."
      />
    </Screen>
  );
}
