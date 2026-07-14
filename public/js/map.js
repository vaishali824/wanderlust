document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

function initMap() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    let lat = 28.6139; // Default latitude (Delhi)
    let lng = 77.2090; // Default longitude (Delhi)

    if (typeof listing !== "undefined" && listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2) {
        lng = listing.geometry.coordinates[0];
        lat = listing.geometry.coordinates[1];
    } else {
        const latInput = document.getElementById('lat');
        const lngInput = document.getElementById('lng');
        if (latInput && lngInput) {
            lat = parseFloat(latInput.value);
            lng = parseFloat(lngInput.value);
        }
    }

    if (typeof google === "undefined" || !google.maps) {
        console.warn("Google Maps is not loaded. Map cannot load.");
        mapContainer.style.background = "#f8f9fa";
        mapContainer.style.display = "flex";
        mapContainer.style.alignItems = "center";
        mapContainer.style.justifyContent = "center";
        mapContainer.style.borderRadius = "1rem";
        mapContainer.style.border = "1px dashed #ccc";
        mapContainer.style.height = "300px";
        mapContainer.innerHTML = "<div class='text-center p-3'><i class='fa-solid fa-map-location-dot fa-2x mb-2 text-muted'></i><p class='text-muted mb-0'>Google Maps API Key is missing or invalid. Map cannot load.</p></div>";
        return;
    }

    const map = new google.maps.Map(mapContainer, {
        center: { lat, lng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
    });

    const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: typeof listing !== "undefined" ? listing.title : 'Listing location',
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `<h6>${typeof listing !== "undefined" ? listing.title : 'Listing Location'}</h6><p class='mb-0'>Exact location provided after booking.</p>`
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}