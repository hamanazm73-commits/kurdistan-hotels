
const grid = document.querySelector(".hotels-grid");
let roomData = {};
function displayHotels() {
    grid.innerHTML = "";
hotels.forEach(function(hotel) {
    const card = document.createElement("div");
    card.className = "hotel-card";
    
    card.innerHTML = `
        <div class="image-container">
            <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image">
            <span class="rating">${hotel.rating}</span>
            <span class="favorite">🤍</span>
        </div>
        <h3>${hotel.name}</h3>
        <p class="location">📍 ${hotel.city}</p>
        <p class="price">$${hotel.price} / ${t("per_night")}</p>
   <p class="available-rooms">${t("available_rooms")}: ${roomData[hotel.name] !== undefined ? roomData[hotel.name] : hotel.available}</p>
        <div class="features">
    ${hotel.features.map(function(tag) {
    return `<span class="tag">${tag}</span>`;
    }).join("")}
 <button class="book-button" onclick="bookRoom('${hotel.name}')">${t("book")}</button>
</div>
<a href="hotel.html?name=${encodeURIComponent(hotel.name)}" class="info-button">${t("more_info")}</a> `;
    grid.appendChild(card);
});
const favorites = document.querySelectorAll(".favorite");
    favorites.forEach(function(heart) {
        const hotelName = heart.closest(".hotel-card").querySelector("h3").innerText;
        if (localStorage.getItem(hotelName) === "favorite") {
            heart.innerText = "❤️";
        }
    });
}
window.addEventListener("load", function() {
    if (window.listenToRooms) {
        window.listenToRooms(function(rooms) {
            roomData = rooms;
            displayHotels();
            filterHotels();
        });
    }
});
grid.addEventListener("click", function(event) {
    const heart = event.target.closest(".favorite");
    if (!heart) return;

    const hotelName = heart.closest(".hotel-card").querySelector("h3").innerText;

    if (heart.innerText.trim() === "🤍") {
        heart.innerText = "❤️";
        localStorage.setItem(hotelName, "favorite");
    } else {
        heart.innerText = "🤍";
        localStorage.removeItem(hotelName);
    }
});
const cityButtons = document.querySelectorAll(".city-button");
const searchInput = document.querySelector(".search-bar input");
const darkModeToggle = document.getElementById("darkModeToggle");
const sortButton = document.getElementById("sortPrice");
const priceSlider = document.getElementById("priceSlider");
const priceValue = document.getElementById("priceValue");
/* ناوی شارەکان بە کوردی — چونکە داتای هۆتێلەکان (data.js) بە کوردییە،
   فلتەری شار بەپێی ئەم ناوانە کاردەکات، نەک بەپێی دەقی دوگمەی وەرگێڕدراو. */
const CITY_KU = {
    all: null,
    sulaymaniyah: "سلێمانی",
    erbil: "هەولێر",
    duhok: "دهۆک",
    halabja: "هەڵەبجە",
    kirkuk: "کەرکوک"
};
let selectedCity = "all";
let sortAscending = true;
    function filterHotels() {
        const hotelCards = document.querySelectorAll(".hotel-card");
        const searchText = searchInput.value.toLowerCase();
          const maxPrice = parseInt(priceSlider.value);
        let visibleCount = 0;

        hotelCards.forEach(function(card) {
            let hotelName = card.querySelector("h3").innerText.toLowerCase();
            let cardCity = card.querySelector(".location").innerText;

            let cityMatch = false;
            if (selectedCity === "all") {
                cityMatch = true;
            } else if (cardCity.includes(CITY_KU[selectedCity])) {
                cityMatch = true;
            }

            let searchMatch = hotelName.includes(searchText);
            const hotelPrice = parseInt(card.querySelector(".price").innerText.replace("$", ""));
        const priceMatch = hotelPrice <= maxPrice;

            if (cityMatch && searchMatch && priceMatch) {
                card.style.display = "block";
                visibleCount = visibleCount + 1;
            } else {
                card.style.display = "none";
            }
        });

        let hotelCount = document.getElementById("hotelCount");
        hotelCount.innerText = visibleCount + " " + t("hotels_found");
        
        let noResults = document.getElementById("noResults");
        if (noResults) {
            if (visibleCount === 0) {
                noResults.style.display = "block";
            } else {
                noResults.style.display = "none";
            }
        }
    }
    cityButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            cityButtons.forEach(function(btn) {
                btn.classList.remove("active");
            });
            button.classList.add("active");

            selectedCity = button.getAttribute("data-city");
            filterHotels();
        });
    });
    
    searchInput.addEventListener("input", function() {
        filterHotels();
    });

    priceSlider.addEventListener("input", function() {
    priceValue.innerText = priceSlider.value;
    filterHotels();
});
    darkModeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        darkModeToggle.innerText = t("darkmode_light");
        localStorage.setItem("darkMode", "on");
    } else {
        darkModeToggle.innerText = t("darkmode");
        localStorage.setItem("darkMode", "off");
    }
});
   sortButton.addEventListener("click", function() {
   const hotelCards = document.querySelectorAll(".hotel-card");
const cardsArray = Array.from(hotelCards);
    
    cardsArray.sort(function(a, b) {
        const priceA = parseInt(a.querySelector(".price").innerText.replace("$", ""));
        const priceB = parseInt(b.querySelector(".price").innerText.replace("$", ""));
        
        if (sortAscending) {
            return priceA - priceB;
        } else {
            return priceB - priceA;
        }
    });
    
    sortAscending = !sortAscending;
    
    const grid = document.querySelector(".hotels-grid");
    cardsArray.forEach(function(card) {
        grid.appendChild(card);
    });
});
    let flipButtons = document.querySelectorAll(".flip-button");

flipButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        let card = button.closest(".hotel-card");
        card.classList.toggle("flipped");
    });
});
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", function() {
    if (window.scrollY > 300) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }
});

backToTop.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

filterHotels();
if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark-mode");
    darkModeToggle.innerText = t("darkmode_light");
}

/* ===== گۆڕینی زمان: سەرلەنوێ دروستکردنی کارتەکان و دەقە داینامیکییەکان ===== */
window.addEventListener("languagechange", function() {
    displayHotels();
    filterHotels();
    darkModeToggle.innerText = document.body.classList.contains("dark-mode")
        ? t("darkmode_light")
        : t("darkmode");
});

/* ===== دڵۆپداونی زمان ===== */
const langBtn = document.getElementById("langBtn");
const langDropdown = document.getElementById("langDropdown");
if (langBtn) {
    langBtn.addEventListener("click", function() {
        langDropdown.classList.toggle("show");
    });
}

/* ===== چوونەدەرەوە ===== */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        sessionStorage.removeItem("hotelLoggedIn");
        window.location.href = "login.html";
    });
}
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name === "" || email === "" || message === "") {
        formMessage.textContent = t("contact_required");
        formMessage.style.color = "red";
        return;
    }

    const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        formMessage.textContent = t("contact_ok");
        formMessage.style.color = "green";
        contactForm.reset();
    } else {
        formMessage.textContent = t("contact_err");
        formMessage.style.color = "red";
    }
});
const weatherInfo = document.getElementById("weatherInfo");

async function getWeather() {
    const apiKey = "0e71b458d4b76cdb9d7888ff98b5cb8f";
    const city = document.getElementById("citySelect").value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();

    const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const feelsLike = Math.round(data.main.feels_like);
const main = data.weather[0].main;
        let icon = "🌤️";

        if (main === "Clear") {
            icon = "☀️";
        } else if (main === "Rain") {
            icon = "🌧️";
        } else if (main === "Clouds") {
            icon = "☁️";
        } else if (main === "Snow") {
            icon = "❄️";
        }
     weatherInfo.textContent = `${icon} ${temp}°C | ${description} | شێ: ${humidity}% | هەست: ${feelsLike}°C`;
    } catch (error) {
        weatherInfo.textContent = "نەتوانرا کەشوهەوا بهێنرێت";
    }
}

getWeather();
const citySelect = document.getElementById("citySelect");
citySelect.addEventListener("change", getWeather);
const weatherBtn = document.getElementById("weatherBtn");
const weatherDropdown = document.getElementById("weatherDropdown");

weatherBtn.addEventListener("click", function() {
    weatherDropdown.classList.toggle("show");
});
const mapBtn = document.getElementById("mapBtn");
const mapDropdown = document.getElementById("mapDropdown");

mapBtn.addEventListener("click", function() {
    mapDropdown.classList.toggle("show");
});