import {initializeApp} from 'firebase-admin';

/** The initialized Firebase app instance */
const firebase = initializeApp();
/** The initialized firestore instance */
export const firestore = firebase.firestore();

// Set the timestampsInSnapshots property to true to acknowledge timestamp deprecations.
firestore.settings({timestampsInSnapshots: true});
