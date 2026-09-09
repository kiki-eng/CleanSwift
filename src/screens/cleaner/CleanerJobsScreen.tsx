import React from 'react';

import { EmptyState, Screen } from '../../components';

/** Next feature pass: open jobs list + my jobs with accept/apply/start/complete. */
export function CleanerJobsScreen(): React.JSX.Element {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="briefcase-outline"
        title="Jobs"
        message="The full jobs board is coming in the next feature pass."
      />
    </Screen>
  );
}
