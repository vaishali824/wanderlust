let indexMap = null;
let currentMarkers = [];

function initIndexMap() {
    const mapContainer = document.getElementById("index-map");
    if (!mapContainer) return;

    if (typeof google === "undefined" || !google.maps) {
        console.warn("Google Maps is not loaded. Index map cannot load.");
        mapContainer.style.height = "250px";
        mapContainer.style.background = "#f8f9fa";
        mapContainer.style.display = "flex";
        mapContainer.style.alignItems = "center";
        mapContainer.style.justifyContent = "center";
        mapContainer.style.borderRadius = "1rem";
        mapContainer.style.border = "1px dashed #ccc";
        mapContainer.innerHTML = "<div class='text-center p-3'><i class='fa-solid fa-map-location-dot fa-2x mb-2 text-muted'></i><p class='text-muted mb-0'>Google Maps API Key is missing or invalid. Map cannot load.<br><small>Add your GOOGLE_MAPS_API_KEY in the <code>.env</code> file.</small></p></div>";
        return;
    }

    try {
        let center = { lat: 28.6139, lng: 77.2090 }; 
        let validCoords = [];

        if (typeof allListings !== "undefined" && Array.isArray(allListings)) {
            allListings.forEach(listing => {
                if (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2 && (listing.geometry.coordinates[0] !== 0 || listing.geometry.coordinates[1] !== 0)) {
                    validCoords.push({
                        lng: listing.geometry.coordinates[0],
                        lat: listing.geometry.coordinates[1]
                    });
                }
            });
        }

        if (validCoords.length > 0) {
            let sumLng = 0, sumLat = 0;
            validCoords.forEach(coord => {
                sumLng += coord.lng;
                sumLat += coord.lat;
            });
            center = { lat: sumLat / validCoords.length, lng: sumLng / validCoords.length };
        }

        indexMap = new google.maps.Map(mapContainer, {
            center: center,
            zoom: validCoords.length > 1 ? 3 : 8,
            mapTypeControl: false,
            streetViewControl: false,
        });

        updateMapMarkers(allListings);

        if (validCoords.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            validCoords.forEach(coord => bounds.extend(coord));
            indexMap.fitBounds(bounds);
        }
    } catch (err) {
        console.error("Failed to initialize Google Maps:", err);
        mapContainer.innerHTML = "<div class='alert alert-warning text-center'>Failed to load Google Maps.</div>";
    }
}

function updateMapMarkers(filteredListings) {
    if (!indexMap) return;

    currentMarkers.forEach(marker => marker.setMap(null));
    currentMarkers = [];

    if (!Array.isArray(filteredListings)) return;

    filteredListings.forEach(listing => {
        if (!listing.geometry || !listing.geometry.coordinates || listing.geometry.coordinates.length !== 2 || (listing.geometry.coordinates[0] === 0 && listing.geometry.coordinates[1] === 0)) {
            return;
        }

        const lat = listing.geometry.coordinates[1];
        const lng = listing.geometry.coordinates[0];

        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: indexMap,
            title: listing.title,
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }
        });

        const popupHTML = `
            <div class="map-popup-card" style="font-family: 'Poppins', sans-serif;">
                <a href="/listings/${listing._id}" class="text-decoration-none text-dark">
                    <img src="${listing.image.url || 'https://images.unsplash.com/photo-default'}" alt="${listing.title}" class="map-popup-img" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;">
                    <div class="p-1">
                        <strong class="d-block text-truncate" style="max-width: 160px; font-size: 0.85rem; margin-top: 4px;">${listing.title}</strong>
                        <span class="text-muted d-block" style="font-size: 0.75rem;">${listing.location}</span>
                        <span class="d-block mt-1 font-weight-bold" style="color: #fe424d; font-size: 0.8rem;">&#8377; ${listing.price.toLocaleString("en-IN")} / night</span>
                    </div>
                </a>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: popupHTML
        });

        marker.addListener("click", () => {
            infoWindow.open(indexMap, marker);
        });

        currentMarkers.push(marker);
    });
}
