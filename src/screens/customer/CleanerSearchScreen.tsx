import React from 'react';

import { EmptyState, Screen } from '../../components';

/** Next feature pass: searchable, paginated cleaner listing directory. */
export function CleanerSearchScreen(): React.JSX.Element {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="search-outline"
        title="Find Cleaners"
        message="Search and filters are coming in the next feature pass."
      />
    </Screen>
  );
}
