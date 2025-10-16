import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function init() {
  if (getApps().length === 0) {
    const credentials = process.env.FIREBASE_SERVICE_ACCOUNT
      ? (JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount)
      : null;

    if (credentials) {
      initializeApp({
        credential: cert(credentials),
      });
    } else {
      initializeApp({
        credential: applicationDefault(),
      });
    }
  }
}

export async function verifyFirebaseToken(token: string) {
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }
  init();
  const auth = getAuth();
  return auth.verifyIdToken(token);
}
