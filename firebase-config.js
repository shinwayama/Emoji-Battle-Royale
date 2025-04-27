<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDoibkGcn5l18NtdcNHaoqvxYiFFlTuOlE",
    authDomain: "emoji-battle-royale.firebaseapp.com",
    databaseURL: "https://emoji-battle-royale-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "emoji-battle-royale",
    storageBucket: "emoji-battle-royale.firebasestorage.app",
    messagingSenderId: "804458823313",
    appId: "1:804458823313:web:b7554ab47905e214564930",
    measurementId: "G-15L2FD7PB7"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
