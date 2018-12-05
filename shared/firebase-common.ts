import * as firebase from 'firebase-admin';

const config = {
  // TODO(josephperrott): Set up config via ENV variables.
};

/** The initialized Firebase app instance */
let firebaseApp: firebase.app.App;

/** Gets the active instance of the Firebase app, creating one if necessary. */
export function getFirebaseInstance(): firebase.app.App {
  return firebaseApp = firebaseApp || firebase.initializeApp(config);
};
