import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useUserRecord } from '../onboarding/useUserRecord';
import {
  approveApplication,
  fetchPendingApplications,
  fetchProfile,
  rejectApplication,
} from '../../services/firebase/firestore';
import type {
  ProfileApplication,
  UserRecord,
} from '../../domain/onboarding/types';
import { findBatchOption } from '../../config/batches';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function ReviewQueuePage() {
  const { user } = useAuth();
  const { record: reviewerRecord, loading: reviewerLoading } = useUserRecord();

  const [pending, setPending] = useState<UserRecord[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileApplication | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    if (!reviewerRecord) return;
    try {
      const list = await fetchPendingApplications(reviewerRecord);
      setPending(list);
    } catch (err) {
      setListError(errorMessage(err, 'Could not load pending applications.'));
    }
  }, [reviewerRecord]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  async function openApplicant(applicant: UserRecord) {
    setSelected(applicant);
    setSelectedProfile(null);
    setDetailError(null);
    setRejectReason('');
    try {
      const profile = await fetchProfile(applicant.uid);
      setSelectedProfile(profile);
    } catch (err) {
      setDetailError(errorMessage(err, 'Could not load this application.'));
    }
  }

  async function handleApprove() {
    if (!selected || !user) return;
    setBusy(true);
    setDetailError(null);
    try {
      await approveApplication(user.uid, selected.uid);
      setFeedback(`Approved ${selected.displayName}.`);
      setSelected(null);
      await loadQueue();
    } catch (err) {
      setDetailError(errorMessage(err, 'Could not approve this application.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!selected || !user) return;
    setBusy(true);
    setDetailError(null);
    try {
      await rejectApplication(user.uid, selected.uid, rejectReason);
      setFeedback(`Declined ${selected.displayName}.`);
      setSelected(null);
      await loadQueue();
    } catch (err) {
      setDetailError(errorMessage(err, 'Could not decline this application.'));
    } finally {
      setBusy(false);
    }
  }

  if (reviewerLoading || pending === null) {
    return (
      <div className="page-status" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  return (
    <section aria-labelledby="review-heading">
      <h1 id="review-heading">Review applications</h1>

      {feedback && <p role="status">{feedback}</p>}
      {listError && (
        <p role="alert" className="form-error">
          {listError}
        </p>
      )}

      {pending.length === 0 ? (
        <p>No pending applications right now.</p>
      ) : (
        <ul className="review-queue-list">
          {pending.map((applicant) => (
            <li key={applicant.uid}>
              <button
                type="button"
                className="review-queue-item"
                onClick={() => void openApplicant(applicant)}
              >
                <span className="review-queue-name">
                  {applicant.displayName}
                </span>
                <span className="review-queue-batch">
                  {findBatchOption(applicant.batchId)?.label ??
                    applicant.batchId}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="review-detail"
          role="dialog"
          aria-labelledby="review-detail-heading"
        >
          <h2 id="review-detail-heading">{selected.displayName}</h2>

          {detailError && (
            <p role="alert" className="form-error">
              {detailError}
            </p>
          )}

          {selectedProfile ? (
            <dl className="review-detail-fields">
              <div>
                <dt>Photo</dt>
                <dd>
                  <img
                    src={selectedProfile.photoDataUrl}
                    alt={`${selected.displayName}'s profile`}
                    width={96}
                    height={96}
                  />
                </dd>
              </div>
              <div>
                <dt>Batch</dt>
                <dd>
                  {findBatchOption(selectedProfile.batchId)?.label ??
                    selectedProfile.batchId}
                </dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {[
                    selectedProfile.location.city,
                    selectedProfile.location.region,
                    selectedProfile.location.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </dd>
              </div>
              <div>
                <dt>Education</dt>
                <dd>
                  {selectedProfile.education.institution}
                  {selectedProfile.education.degree
                    ? ` — ${selectedProfile.education.degree}`
                    : ''}
                </dd>
              </div>
              <div>
                <dt>Current organization</dt>
                <dd>
                  {selectedProfile.currentOrganization.name} —{' '}
                  {selectedProfile.currentOrganization.role}
                  {selectedProfile.currentOrganization.isStartup
                    ? ' (startup)'
                    : ''}
                </dd>
              </div>
              {selectedProfile.previousOrganizations.length > 0 && (
                <div>
                  <dt>Previous organizations</dt>
                  <dd>
                    <ul>
                      {selectedProfile.previousOrganizations.map((org, i) => (
                        <li key={i}>
                          {org.name} — {org.role}
                          {org.isStartup ? ' (startup)' : ''}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {selectedProfile.skills.length > 0 && (
                <div>
                  <dt>Skills</dt>
                  <dd>{selectedProfile.skills.join(', ')}</dd>
                </div>
              )}
              {selectedProfile.interests.length > 0 && (
                <div>
                  <dt>Interests</dt>
                  <dd>{selectedProfile.interests.join(', ')}</dd>
                </div>
              )}
              {selectedProfile.networkingGoals && (
                <div>
                  <dt>Networking goals</dt>
                  <dd>{selectedProfile.networkingGoals}</dd>
                </div>
              )}
            </dl>
          ) : (
            !detailError && <p role="status">Loading application…</p>
          )}

          <label htmlFor="reject-reason">
            Reason (only shown if you decline)
          </label>
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
          />

          <div className="review-detail-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => void handleApprove()}
              disabled={busy}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void handleReject()}
              disabled={busy}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSelected(null)}
              disabled={busy}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
