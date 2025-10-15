import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("eventForm");
const eventsList = document.getElementById("eventsList");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = document.getElementById("city").value;
  const area = document.getElementById("area").value;
  const sport = document.getElementById("sport").value;
  const time = document.getElementById("time").value;

  const newEvent = { city, area, sport, time };

  const eventsRef = ref(db, "events");
  push(eventsRef, newEvent);

  form.reset();
  alert("✅ Event added successfully!");
});

// Load events from Firebase
const eventsRef = ref(db, "events");
onValue(eventsRef, (snapshot) => {
  eventsList.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    Object.values(data).forEach((event) => {
      const li = document.createElement("li");
      li.textContent = `${event.sport} at ${event.area}, ${event.city} — ${event.time}`;
      eventsList.appendChild(li);
    });
  } else {
    eventsList.innerHTML = "<li>No events found</li>";
  }
});
