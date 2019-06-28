import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = require("./credentials");

export const provider = new firebase.auth.GoogleAuthProvider();
export default firebase.initializeApp(firebaseConfig);
