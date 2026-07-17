import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logout = () => signOut(auth);

import {
  signInWithPopup,
  signOut
} from 'firebase/auth';

import {
  auth,
  googleProvider
} from './firebase';

const ALLOWED_EMAILS = [
  'raoraneatharava@gmail.com',
  'atharvaraorane3010@gmail.com',
  'teammember2@gmail.com',
];

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(
    auth,
    googleProvider
  );

  const email = result.user.email;

  if (!email || !ALLOWED_EMAILS.includes(email)) {
    await signOut(auth);
    throw new Error(
      'You are not authorized to access this dashboard.'
    );
  }

  return result.user;
};

export const logout = () => signOut(auth);
