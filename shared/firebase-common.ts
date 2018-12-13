import * as firebase from 'firebase-admin';

/** The initialized Firebase app instance */
export const firebaseInstance = firebase.initializeApp();
/** The initialized firestore instance */
export const firestoreInstance = firebaseInstance.firestore();

// Set the timestampsInSnapshots property to true to acknowledge timestamp deprecations.
firestoreInstance.settings({timestampsInSnapshots: true});