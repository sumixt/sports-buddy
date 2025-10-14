// ✅ Sports Buddy Firebase Config (compat SDK)
const firebaseConfig = {
  apiKey: "AIzaSyDDuy2bA3THiZuZEgofllqjHvjrDsVwSDE",
  authDomain: "sports-buddy-18ec6.firebaseapp.com",
  projectId: "sports-buddy-18ec6",
  storageBucket: "sports-buddy-18ec6.firebasestorage.app",
  messagingSenderId: "745066566439",
  appId: "1:745066566439:web:da35a30b2b079b33344f02",
  measurementId: "G-549VCVCPVG"
};

// ✅ Initialize Firebase (using compat SDK)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
