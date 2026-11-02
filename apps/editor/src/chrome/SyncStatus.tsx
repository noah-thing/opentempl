import { Icon } from '../ui/icons';
import { useSyncStatus } from '../collab/collab';
import type { RelayStatus } from '../collab/relayProvider';

export function syncLabel(s: RelayStatus) {
  switch (s) {
    case 'synced':
      return 'Synced';
    case 'connecting':
    case 'syncing':
      return 'Syncing';
    case 'offline':
      return 'Offline, will sync when back';
    case 'full':
      return 'Too big to sync';
    case 'gone':
      return 'Sharing ended';
  }
}

// Sits beside "On this device" and only shows while a design is shared.
export function SyncStatus() {
  const status = useSyncStatus();
  if (!status) return null;
  return (
    <span className="saved" role="status" title="This design is shared. Changes sync through an encrypted relay.">
      <Icon name={status === 'synced' ? 'check' : 'share'} size={12} /> {syncLabel(status)}
    </span>
  );
}
