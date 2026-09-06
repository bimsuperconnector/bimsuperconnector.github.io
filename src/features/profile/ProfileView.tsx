import { findBatchOption } from '../../config/batches';
import type { ProfileApplication } from '../../domain/onboarding/types';

interface ProfileViewProps {
  profile: ProfileApplication;
  onEdit: () => void;
}

function formatLocation(profile: ProfileApplication): string {
  const { city, region, country } = profile.location;
  return [city, region, country].filter(Boolean).join(', ');
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const batch = findBatchOption(profile.batchId);

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <img
          src={profile.photoDataUrl}
          alt={`${profile.name}'s profile photo`}
          className="profile-photo"
          width={96}
          height={96}
        />
        <div>
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-meta">
            <span className="chip">{batch?.label ?? profile.batchId}</span>
            {formatLocation(profile) && (
              <span className="profile-location">
                {formatLocation(profile)}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary profile-edit-btn"
          onClick={onEdit}
        >
          Edit profile
        </button>
      </div>

      <dl className="profile-detail-fields">
        <div>
          <dt>Education</dt>
          <dd>
            {profile.education.institution}
            {profile.education.degree ? ` — ${profile.education.degree}` : ''}
          </dd>
        </div>

        <div>
          <dt>Current organization</dt>
          <dd>
            {profile.currentOrganization.name} —{' '}
            {profile.currentOrganization.role}
            {profile.currentOrganization.isStartup && (
              <span className="chip chip-accent">Startup</span>
            )}
          </dd>
        </div>

        {profile.previousOrganizations.length > 0 && (
          <div>
            <dt>Previous organizations</dt>
            <dd>
              <ul className="profile-org-list">
                {profile.previousOrganizations.map((org, i) => (
                  <li key={i}>
                    {org.name} — {org.role}
                    {org.isStartup && (
                      <span className="chip chip-accent">Startup</span>
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {profile.skills.length > 0 && (
          <div>
            <dt>Skills</dt>
            <dd className="chip-list">
              {profile.skills.map((skill) => (
                <span className="chip" key={skill}>
                  {skill}
                </span>
              ))}
            </dd>
          </div>
        )}

        {profile.interests.length > 0 && (
          <div>
            <dt>Interests</dt>
            <dd className="chip-list">
              {profile.interests.map((interest) => (
                <span className="chip" key={interest}>
                  {interest}
                </span>
              ))}
            </dd>
          </div>
        )}

        {profile.networkingGoals && (
          <div>
            <dt>Networking goals</dt>
            <dd>{profile.networkingGoals}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
