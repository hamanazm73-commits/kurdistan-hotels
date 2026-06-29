import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
const auth = getAuth();
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(function() {
            loginError.textContent = "";
        })
        .catch(function(error) {
            loginError.textContent = "ئیمەیڵ یان وشەی نهێنی هەڵەیە";
        });
});

const list = document.getElementById("reservationsList");

async function showReservations() {
    const querySnapshot = await getDocs(collection(db, "reservations"));

    list.innerHTML = "";

    querySnapshot.forEach(function(docItem) {
        const data = docItem.data();

        const card = document.createElement("div");
        card.className = "reservation-card";

        card.innerHTML = `
            <h3>${data.hotel}</h3>
            <p>ناو: ${data.name}</p>
            <p>تەلەفۆن: ${data.phone}</p>
            <p>بەرواری چوونەژوورەوە: ${data.checkIn}</p>
            <p>ژمارەی شەو: ${data.nights}</p>
        `;

        list.appendChild(card);
    });
}

logoutBtn.addEventListener("click", function() {
    signOut(auth);
});

onAuthStateChanged(auth, function(user) {
    if (user) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("adminSection").style.display = "block";
        showReservations();
    } else {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("adminSection").style.display = "none";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    }
});