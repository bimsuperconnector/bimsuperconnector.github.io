import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const PROJECT_ID = 'demo-superconnector-rules-test';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firebase/firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// --- Seed helpers (bypass rules) -----------------------------------

interface SeedUser {
  uid: string;
  displayName?: string;
  batchId?: string;
  role: string;
  assignedBatches?: string[];
  rejectionReason?: string;
}

async function seedUser(user: SeedUser) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: `${user.uid}@example.com`,
      displayName: user.displayName ?? 'Test Person',
      batchId: user.batchId ?? 'BIM35',
      role: user.role,
      ...(user.assignedBatches
        ? { assignedBatches: user.assignedBatches }
        : {}),
      ...(user.rejectionReason
        ? { rejectionReason: user.rejectionReason }
        : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

async function seedProfile(uid: string, batchId = 'BIM35') {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'profiles', uid), validProfile(uid, batchId));
  });
}

function validProfile(uid: string, batchId = 'BIM35') {
  return {
    uid,
    name: 'Test Person',
    photoDataUrl: 'data:image/jpeg;base64,AAAA',
    batchId,
    location: {
      city: 'Bengaluru',
      region: '',
      country: 'India',
      normalized: 'bengaluru||india',
    },
    education: { institution: 'Test University' },
    currentOrganization: { name: 'Acme', role: 'Engineer', isStartup: false },
    previousOrganizations: [],
    skills: ['Revit'],
    interests: ['Design'],
    networkingGoals: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function validUserCreate(uid: string, batchId = 'BIM35') {
  return {
    uid,
    email: `${uid}@example.com`,
    displayName: 'Test Person',
    batchId,
    role: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

// --- Tests -----------------------------------------------------------

describe('unauthenticated access', () => {
  it('denies reading a user record', async () => {
    await seedUser({ uid: 'alice', role: 'pending' });
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users', 'alice')));
  });

  it('denies reading a profile', async () => {
    await seedUser({ uid: 'alice', role: 'pending' });
    await seedProfile('alice');
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'profiles', 'alice')));
  });

  it('denies creating a user record', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'alice'), validUserCreate('alice')),
    );
  });
});

describe('self-service application submission', () => {
  it('allows a signed-in person to create their own pending user + profile doc', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users', 'alice'), validUserCreate('alice')),
    );
    await assertSucceeds(
      setDoc(doc(db, 'profiles', 'alice'), validProfile('alice')),
    );
  });

  it('denies creating a doc for someone else', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'users', 'bob'), validUserCreate('bob')));
  });

  it('denies self-declaring any role other than pending', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'alice'), {
        ...validUserCreate('alice'),
        role: 'member',
      }),
    );
  });

  it('denies a profile with an oversized photo', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(db, 'profiles', 'alice'), {
        ...validProfile('alice'),
        photoDataUrl: 'x'.repeat(200_001),
      }),
    );
  });

  it('denies a user doc with an unexpected extra field', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'alice'), {
        ...validUserCreate('alice'),
        role2: 'member',
      }),
    );
  });
});

describe('pending-user denial', () => {
  it("cannot read another person's user record", async () => {
    await seedUser({ uid: 'alice', role: 'pending' });
    await seedUser({ uid: 'bob', role: 'pending' });
    const db = testEnv.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(db, 'users', 'alice')));
  });

  it('cannot self-approve (escalate pending -> member)', async () => {
    await seedUser({ uid: 'alice', role: 'pending' });
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(updateDoc(doc(db, 'users', 'alice'), { role: 'member' }));
  });
});

describe('approved access', () => {
  it('an approved member can read their own docs', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(getDoc(doc(db, 'users', 'alice')));
    await assertSucceeds(getDoc(doc(db, 'profiles', 'alice')));
  });

  it("a plain member cannot read another member's profile (not a reviewer)", async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    await seedUser({ uid: 'bob', role: 'member' });
    const db = testEnv.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(db, 'profiles', 'alice')));
  });
});

describe('rejected-user resubmission', () => {
  it('can move rejected -> pending, changing only role/rejectionReason/updatedAt', async () => {
    await seedUser({
      uid: 'alice',
      role: 'rejected',
      rejectionReason: 'Missing info',
    });
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'alice'), {
        role: 'pending',
        rejectionReason: null,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('cannot change batchId while resubmitting', async () => {
    await seedUser({ uid: 'alice', role: 'rejected' });
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      updateDoc(doc(db, 'users', 'alice'), {
        role: 'pending',
        batchId: 'BIM43',
      }),
    );
  });
});

describe('admin permissions', () => {
  it('applicationAdmin can read and approve any pending application', async () => {
    await seedUser({ uid: 'admin1', role: 'applicationAdmin' });
    await seedUser({ uid: 'alice', role: 'pending', batchId: 'BIM43' });
    await seedProfile('alice', 'BIM43');

    const db = testEnv.authenticatedContext('admin1').firestore();
    await assertSucceeds(getDoc(doc(db, 'users', 'alice')));
    await assertSucceeds(getDoc(doc(db, 'profiles', 'alice')));
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'alice'), {
        role: 'member',
        reviewedBy: 'admin1',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('rejects if the reviewer stamps someone else as reviewedBy', async () => {
    await seedUser({ uid: 'admin1', role: 'applicationAdmin' });
    await seedUser({ uid: 'alice', role: 'pending' });

    const db = testEnv.authenticatedContext('admin1').firestore();
    await assertFails(
      updateDoc(doc(db, 'users', 'alice'), {
        role: 'member',
        reviewedBy: 'someone-else',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('cannot grant an admin/moderator role from the review action', async () => {
    await seedUser({ uid: 'admin1', role: 'applicationAdmin' });
    await seedUser({ uid: 'alice', role: 'pending' });

    const db = testEnv.authenticatedContext('admin1').firestore();
    await assertFails(
      updateDoc(doc(db, 'users', 'alice'), {
        role: 'applicationAdmin',
        reviewedBy: 'admin1',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe('batch-moderator scope', () => {
  it('can review a pending application in their assigned batch', async () => {
    await seedUser({
      uid: 'mod1',
      role: 'batchModerator',
      assignedBatches: ['BIM35'],
    });
    await seedUser({ uid: 'alice', role: 'pending', batchId: 'BIM35' });
    await seedProfile('alice', 'BIM35');

    const db = testEnv.authenticatedContext('mod1').firestore();
    await assertSucceeds(getDoc(doc(db, 'users', 'alice')));
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'alice'), {
        role: 'member',
        reviewedBy: 'mod1',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('cannot review a pending application outside their assigned batch', async () => {
    await seedUser({
      uid: 'mod1',
      role: 'batchModerator',
      assignedBatches: ['BIM35'],
    });
    await seedUser({ uid: 'bob', role: 'pending', batchId: 'BIM43' });
    await seedProfile('bob', 'BIM43');

    const db = testEnv.authenticatedContext('mod1').firestore();
    await assertFails(getDoc(doc(db, 'users', 'bob')));
    await assertFails(
      updateDoc(doc(db, 'users', 'bob'), {
        role: 'member',
        reviewedBy: 'mod1',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('a scoped query only returning in-batch pending docs succeeds', async () => {
    await seedUser({
      uid: 'mod1',
      role: 'batchModerator',
      assignedBatches: ['BIM35'],
    });
    await seedUser({ uid: 'alice', role: 'pending', batchId: 'BIM35' });
    await seedUser({ uid: 'bob', role: 'pending', batchId: 'BIM43' });

    const db = testEnv.authenticatedContext('mod1').firestore();
    const scoped = query(
      collection(db, 'users'),
      where('role', '==', 'pending'),
      where('batchId', 'in', ['BIM35']),
    );
    const snapshot = await assertSucceeds(getDocs(scoped));
    expect(snapshot.docs.map((d) => d.id)).toEqual(['alice']);
  });
});

// Phase 2 — Profiles & batch management: controlled self-editing on
// /profiles/{uid}. See firebase/firestore.rules' `allow update` block
// above the catch-all, and SECURITY_AND_TESTING.md's Firestore test
// list ("owned-profile editing; protected-field denial").
describe('owned-profile editing', () => {
  it('the owner can update their own editable profile content', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertSucceeds(
      updateDoc(doc(db, 'profiles', 'alice'), {
        name: 'Alice A. Alumni',
        skills: ['Revit', 'BIM Coordination'],
        currentOrganization: {
          name: 'New Co',
          role: 'Senior Engineer',
          isStartup: true,
        },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('cannot change batchId while editing their own profile', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice', 'BIM35');
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        batchId: 'BIM43',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('cannot change uid while editing their own profile', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        uid: 'someone-else',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('cannot change createdAt while editing their own profile', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        createdAt: new Date('2020-01-01'),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('rejects an oversized photo on update', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        photoDataUrl: 'x'.repeat(200_001),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('rejects an unexpected extra field on update', async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        connectionScore: 1200,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("cannot update another person's profile", async () => {
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    await seedUser({ uid: 'bob', role: 'member' });
    const db = testEnv.authenticatedContext('bob').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        name: 'Hijacked Name',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('an admin cannot edit profile content through this rule (review only touches /users)', async () => {
    await seedUser({ uid: 'admin1', role: 'applicationAdmin' });
    await seedUser({ uid: 'alice', role: 'member' });
    await seedProfile('alice');
    const db = testEnv.authenticatedContext('admin1').firestore();

    await assertFails(
      updateDoc(doc(db, 'profiles', 'alice'), {
        name: 'Reviewer Edited This',
        updatedAt: serverTimestamp(),
      }),
    );
  });
});
