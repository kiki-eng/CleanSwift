import React from 'react';

import { EmptyState, Screen } from '../../components';

/** Next feature pass: full create-cleaning-request form (type, address, date, notes). */
export function CreateRequestScreen(): React.JSX.Element {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="construct-outline"
        title="Create Request"
        message="The booking form is the next feature we're building."
      />
    </Screen>
  );
}
