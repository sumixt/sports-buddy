const auth = firebase.auth();
const db = firebase.firestore();

// collections
const COL_EVENTS = "events";
const COL_SPORTS = "sports";
const COL_LOCATIONS = "locations";
const COL_LOGS = "logs";

// UI elements
const tabUser = document.getElementById("tab-user");
const tabAdmin = document.getElementById("tab-admin");
const userSection = document.getElementById("user-section");
const adminSection = document.getElementById("admin-section");

// Auth
const emailInput = document.getElementById("user-email");
const passInput = document.getElementById("user-pass");
const btnRegister = document.getElementById("btn-register");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");

// Filters
const filterCity = document.getElementById("filter-city");
const filterArea = document.getElementById("filter-area");
const filterSport = document.getElementById("filter-sport");
const btnFilter = document.getElementById("btn-filter");
const eventsList = document.getElementById("events-list");

// Admin
const sportName = document.getElementById("sport-name");
const btnAddSport = document.getElementById("btn-add-sport");
const cityName = document.getElementById("city-name");
const areaName = document.getElementById("area-name");
const btnAddCityArea = document.getElementById("btn-add-city-area");

const eventName = document.getElementById("event-name");
const eventSport = document.getElementById("event-sport");
const eventCity = document.getElementById("event-city");
const eventArea = document.getElementById("event-area");
const eventDate = document.getElementById("event-date");
const eventTime = document.getElementById("event-time");
const eventLevel = document.getElementById("event-level");
const btnAddEvent = document.getElementById("btn-add-event");
const adminEvents = document.getElementById("admin-events");

function logAction(userId, action, meta = {}) {
  db.collection(COL_LOGS).add({
    userId: userId || "anon",
    action,
    meta,
    ts: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// tab switch
tabUser.addEventListener("click", () => {
  tabUser.classList.add("active");
  tabAdmin.classList.remove("active");
  userSection.style.display = "block";
  adminSection.style.display = "none";
});
tabAdmin.addEventListener("click", () => {
  tabAdmin.classList.add("active");
  tabUser.classList.remove("active");
  adminSection.style.display = "block";
  userSection.style.display = "none";
});

// auth actions
btnRegister.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();
  if (!email || !pass) return alert("Enter details");
  try {
    const u = await auth.createUserWithEmailAndPassword(email, pass);
    alert("Registered!");
    logAction(u.user.uid, "register", { email });
  } catch (e) {
    alert(e.message);
  }
});

btnLogin.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();
  if (!email || !pass) return alert("Enter details");
  try {
    const u = await auth.signInWithEmailAndPassword(email, pass);
    alert("Logged in!");
    btnLogout.style.display = "inline-block";
    logAction(u.user.uid, "login", { email });
    loadOptions();
  } catch (e) {
    alert(e.message);
  }
});

btnLogout.addEventListener("click", async () => {
  await auth.signOut();
  btnLogout.style.display = "none";
  alert("Logged out!");
});

// add sport
btnAddSport.addEventListener("click", async () => {
  const name = sportName.value.trim();
  if (!name) return alert("Enter sport name");
  await db.collection(COL_SPORTS).add({ name });
  alert("Sport added!");
  sportName.value = "";
  loadOptions();
});

// add city+area
btnAddCityArea.addEventListener("click", async () => {
  const city = cityName.value.trim();
  const area = areaName.value.trim();
  if (!city || !area) return alert("Enter both fields");
  await db.collection(COL_LOCATIONS).add({ city, area });
  alert("Location added!");
  cityName.value = areaName.value = "";
  loadOptions();
});

// add event
btnAddEvent.addEventListener("click", async () => {
  const data = {
    name: eventName.value,
    sport: eventSport.value,
    city: eventCity.value,
    area: eventArea.value,
    date: eventDate.value,
    time: eventTime.value,
    level: eventLevel.value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (!data.name || !data.sport || !data.city) return alert("Fill all fields");
  await db.collection(COL_EVENTS).add(data);
  alert("Event added!");
  eventName.value = eventSport.value = eventCity.value = eventArea.value = eventLevel.value = "";
  renderAdminEvents();
});

// show events
async function renderEvents() {
  eventsList.innerHTML = "Loading...";
  let q = db.collection(COL_EVENTS).orderBy("createdAt", "desc");
  if (filterCity.value) q = q.where("city", "==", filterCity.value);
  if (filterArea.value) q = q.where("area", "==", filterArea.value);
  if (filterSport.value) q = q.where("sport", "==", filterSport.value);
  const snap = await q.get();
  eventsList.innerHTML = "";
  if (snap.empty) return (eventsList.innerHTML = "<p>No events found</p>");
  snap.forEach((doc) => {
    const d = doc.data();
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `<b>${d.name}</b><br>${d.sport} — ${d.city}, ${d.area}<br>${d.date} ${d.time}<br>Level: ${d.level || "-"}`;
    eventsList.appendChild(div);
  });
}
btnFilter.addEventListener("click", renderEvents);

// admin render events
async function renderAdminEvents() {
  adminEvents.innerHTML = "Loading...";
  const snap = await db.collection(COL_EVENTS).get();
  adminEvents.innerHTML = "";
  snap.forEach((doc) => {
    const d = doc.data();
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `<b>${d.name}</b> - ${d.city} (${d.sport}) <br> 
    <button data-id="${doc.id}" class="delete-btn">Delete</button>`;
    adminEvents.appendChild(div);
  });
}

adminEvents.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    await db.collection(COL_EVENTS).doc(id).delete();
    alert("Deleted!");
    renderAdminEvents();
  }
});

async function loadOptions() {
  filterCity.innerHTML = '<option value="">-- Select City --</option>';
  filterArea.innerHTML = '<option value="">-- Select Area --</option>';
  filterSport.innerHTML = '<option value="">-- Select Sport --</option>';

  const sports = await db.collection(COL_SPORTS).get();
  sports.forEach((s) => {
    const o = document.createElement("option");
    o.value = s.data().name;
    o.textContent = s.data().name;
    filterSport.appendChild(o);
  });

  const locs = await db.collection(COL_LOCATIONS).get();
  const cities = new Set();
  const areas = new Set();
  locs.forEach((d) => {
    cities.add(d.data().city);
    areas.add(d.data().area);
  });
  cities.forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    filterCity.appendChild(o);
  });
  areas.forEach((a) => {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a;
    filterArea.appendChild(o);
  });
}

renderEvents();
renderAdminEvents();
loadOptions();
