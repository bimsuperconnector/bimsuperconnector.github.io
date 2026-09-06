import { useState } from 'react';
import { requestAnotherReview } from '../../services/firebase/firestore';
import type { UserRecord } from '../../domain/onboarding/types';

export function PendingStatus() {
  return (
    <section aria-labelledby="pending-heading" className="status-card">
      <h1 id="pending-heading">Application submitted</h1>
      <p>
        Thanks for applying. A batch moderator or admin will review your
        application soon — you don&apos;t need to do anything else right now.
      </p>
    </section>
  );
}

interface RejectedStatusProps {
  record: UserRecord;
}

export function RejectedStatus({ record }: RejectedStatusProps) {
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  async function handleRequestReview() {
    setRequesting(true);
    setError(null);
    try {
      await requestAnotherReview(record.uid);
      setRequested(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not request another review.',
      );
    } finally {
      setRequesting(false);
    }
  }

  return (
    <section aria-labelledby="rejected-heading" className="status-card">
      <h1 id="rejected-heading">Application not approved</h1>
      {record.rejectionReason ? (
        <p>{record.rejectionReason}</p>
      ) : (
        <p>Your application wasn&apos;t approved this time.</p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {requested ? (
        <p role="status">
          Your application has been re-submitted for another look.
        </p>
      ) : (
        <button
          type="button"
          className="btn-secondary"
          onClick={handleRequestReview}
          disabled={requesting}
        >
          {requesting ? 'Requesting…' : 'Request another review'}
        </button>
      )}
    </section>
  );
}
