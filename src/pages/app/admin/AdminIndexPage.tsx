import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import {
  type UserRecord,
  setUserStatus,
  subscribeToPendingUsers,
} from '../../../firebase/repositories/usersRepository';

export function AdminIndexPage() {
  const [pending, setPending] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningUid, setActioningUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPendingUsers((records) => {
      setPending(records);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleDecision(uid: string, status: 'approved' | 'rejected') {
    setError(null);
    setActioningUid(uid);
    try {
      await setUserStatus(uid, status);
    } catch {
      setError("Couldn't update that account. Please try again.");
    } finally {
      setActioningUid(null);
    }
  }

  return (
    <div className="rounded-md border border-hairline p-xl">
      <h1 className="text-title-lg text-ink">Pending approvals</h1>
      <p className="mt-sm text-body-md text-body">
        A minimal approve/reject queue for new sign-ins. The full admin
        console — roles, batch moderators, dashboards — is built in Phase
        11 on top of this.
      </p>

      {error && <p className="mt-md text-body-md text-signature-coral">{error}</p>}

      {loading ? (
        <p className="mt-lg text-body-md text-muted">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="mt-lg text-body-md text-muted">No pending accounts right now.</p>
      ) : (
        <ul className="mt-lg space-y-md">
          {pending.map((person) => (
            <li
              key={person.uid}
              className="flex items-center justify-between gap-md rounded-sm border border-hairline p-md"
            >
              <div className="flex items-center gap-sm">
                {person.photoURL && (
                  <img
                    src={person.photoURL}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="text-label-md text-ink">
                    {person.displayName ?? 'Unnamed account'}
                  </p>
                  <p className="text-body-md text-muted">{person.email}</p>
                </div>
              </div>
              <div className="flex gap-sm">
                <Button
                  variant="secondary"
                  className="px-md py-xs"
                  disabled={actioningUid === person.uid}
                  onClick={() => void handleDecision(person.uid, 'rejected')}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  className="px-md py-xs"
                  disabled={actioningUid === person.uid}
                  onClick={() => void handleDecision(person.uid, 'approved')}
                >
                  Approve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
