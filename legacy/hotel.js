const params = new URLSearchParams(window.location.search);
const hotelName = params.get("name");

const hotel = hotels.find(function(h) {
    return h.name === hotelName;
});

const detail = document.getElementById("hotelDetail");

detail.innerHTML = `
    <img src="${hotel.image}" alt="${hotel.name}" class="detail-image">
    <h1>${hotel.name}</h1>
    <p class="location">📍 ${hotel.city}</p>
    <p class="rating">${hotel.rating}</p>
    
    <h2>ژوورەکان</h2>
    <div class="rooms-list">
        ${hotel.rooms.map(function(room) {
            return `<div class="room-item">${room.type} - $${room.price}</div>`;
        }).join("")}
    </div>
`;