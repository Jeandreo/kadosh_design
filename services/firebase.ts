import firebase from "firebase/compat/app";
import { getStorage } from "firebase/storage";
import { CONFIG } from "../config";

// Configuração do Firebase
// Mantemos apenas para STORAGE de imagens se necessário, 
// pois o banco de dados e auth agora são MySQL.
const firebaseConfig = {
  apiKey: CONFIG.FIREBASE.API_KEY,
  authDomain: CONFIG.FIREBASE.AUTH_DOMAIN,
  projectId: CONFIG.FIREBASE.PROJECT_ID,
  storageBucket: CONFIG.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: CONFIG.FIREBASE.MESSAGING_SENDER_ID,
  appId: CONFIG.FIREBASE.APP_ID
};

const app = CONFIG.FIREBASE.API_KEY ? firebase.initializeApp(firebaseConfig) : undefined;

// Exportamos apenas storage. 
// Auth e DB agora são undefined para forçar o uso da API MySQL.
export const auth = undefined;
export const db = undefined;
export const storage = app ? getStorage(app) : undefined;
export const googleProvider = undefined;

export const isFirebaseInitialized = () => !!app;