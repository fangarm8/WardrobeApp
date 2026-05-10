import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
  getAuth,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import type { WardrobeItem } from "./types";

export type RemoteWardrobeItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl?: string;
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

const app = isConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export function firebaseReady() {
  return Boolean(auth && db);
}

function requireAuth() {
  if (!auth) throw new Error("Firebase auth is not configured.");
  return auth;
}

function requireDb() {
  if (!db) throw new Error("Firebase firestore is not configured.");
  return db;
}

function requireStorage() {
  if (!storage) throw new Error("Firebase storage is not configured.");
  return storage;
}

export async function register(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(requireAuth(), email, password);
}

export async function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireAuth(), email, password);
}

export function subscribeFirebaseAuth(listener: (user: User | null) => void): () => void {
  if (!app || !auth) {
    queueMicrotask(() => listener(null));
    return () => {};
  }
  return onAuthStateChanged(auth, listener);
}

export async function firebaseSignOut(): Promise<void> {
  if (!app || !auth) return;
  await signOut(auth);
}

/** Uploads a local image URI to Firebase Storage and returns the public download URL. */
export async function uploadWardrobeImage(localUri: string, userId: string): Promise<string> {
  const st = requireStorage();
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(st, `wardrobe/${userId}/${Date.now()}.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

/** Saves a wardrobe item to Firestore under users/{userId}/wardrobe. */
export async function addWardrobeItemRemote(
  item: Omit<WardrobeItem, "id">,
  userId: string,
  imageUrl?: string,
): Promise<void> {
  await addDoc(collection(requireDb(), `users/${userId}/wardrobe`), {
    title: item.title,
    description: item.description,
    category: item.category,
    date: item.date,
    imageUrl: imageUrl ?? "",
    createdAt: serverTimestamp(),
  });
}

export async function removeWardrobeItemRemote(itemId: string, userId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), `users/${userId}/wardrobe`, itemId));
}

export function subscribeWardrobeItems(
  userId: string,
  onData: (items: RemoteWardrobeItem[]) => void,
): () => void {
  const q = query(collection(requireDb(), `users/${userId}/wardrobe`));
  return onSnapshot(q, (snapshot) => {
    const items: RemoteWardrobeItem[] = snapshot.docs.map((entry) => ({
      id: entry.id,
      title: (entry.data().title as string) ?? "",
      description: (entry.data().description as string) ?? "",
      category: (entry.data().category as string) ?? "",
      date: (entry.data().date as string) ?? "",
      imageUrl: (entry.data().imageUrl as string) || undefined,
    }));
    onData(items);
  });
}
