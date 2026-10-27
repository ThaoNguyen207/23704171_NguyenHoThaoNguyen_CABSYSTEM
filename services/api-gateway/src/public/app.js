// ============================================================================
// CAB SYSTEM – Modern Intelligent Microservices Frontend
// Dynamic Distance, Fair Pricing, Leaflet GPS Interactive Map & Fleet Tracking
// ============================================================================

// 1. Comprehensive Ho Chi Minh City Geocoding & Knowledge Engine (Client-Side)
const KNOWN_LOCATIONS = [
  // Landmark icons & GPS coordinates
  { keywords: ['bến thành', 'ben thanh', 'chợ bến thành'], name: 'Chợ Bến Thành, Quận 1', lat: 10.7721, lng: 106.6983 },
  { keywords: ['bitexco', 'hải triều'], name: 'Tòa nhà Bitexco, Quận 1', lat: 10.7716, lng: 106.7044 },
  { keywords: ['landmark 81', 'vinhomes central park'], name: 'Landmark 81, Bình Thạnh', lat: 10.7951, lng: 106.7218 },
  { keywords: ['tân sơn nhất', 'tan son nhat', 'sân bay', 'tsn'], name: 'Sân bay Tân Sơn Nhất, Tân Bình', lat: 10.8184, lng: 106.6588 },
  { keywords: ['nguyễn huệ', 'nguyen hue', 'phố đi bộ'], name: 'Phố đi bộ Nguyễn Huệ, Quận 1', lat: 10.7743, lng: 106.7037 },
  { keywords: ['nhà thờ đức bà', 'đức bà', 'bưu điện trung tâm'], name: 'Nhà thờ Đức Bà, Quận 1', lat: 10.7798, lng: 106.6990 },
  { keywords: ['hồ con rùa', 'con rùa'], name: 'Hồ Con Rùa, Quận 3', lat: 10.7828, lng: 106.6961 },
  { keywords: ['crescent mall', 'phú mỹ hưng', 'hồ bán nguyệt'], name: 'Crescent Mall, Quận 7', lat: 10.7294, lng: 106.7190 },
  { keywords: ['vivo', 'sc vivocity'], name: 'SC VivoCity, Quận 7', lat: 10.7308, lng: 106.7058 },
  { keywords: ['đhqg', 'đại học quốc gia', 'ktx khu b', 'làng đại học'], name: 'KTX Khu B ĐHQG, Thủ Đức', lat: 10.8804, lng: 106.7820 },
  { keywords: ['suối tiên', 'suoi tien'], name: 'Khu du lịch Suối Tiên, Thủ Đức', lat: 10.8656, lng: 106.8028 },
  { keywords: ['đầm sen', 'dam sen'], name: 'Công viên văn hóa Đầm Sen, Quận 11', lat: 10.7681, lng: 106.6372 },
  { keywords: ['chợ lớn', 'bình tây'], name: 'Chợ Bình Tây (Chợ Lớn), Quận 6', lat: 10.7512, lng: 106.6534 },
  { keywords: ['chợ rẫy', 'bệnh viện chợ rẫy'], name: 'Bệnh viện Chợ Rẫy, Quận 5', lat: 10.7558, lng: 106.6596 },
  { keywords: ['aeon mall tân phú', 'aeon tân phú'], name: 'Aeon Mall Tân Phú, Tân Phú', lat: 10.8005, lng: 106.6183 },
  { keywords: ['aeon mall bình tân', 'aeon bình tân'], name: 'Aeon Mall Bình Tân, Bình Tân', lat: 10.7432, lng: 106.6125 },
  { keywords: ['thảo điền', 'thao dien'], name: 'Khu dân cư Thảo Điền, TP. Thủ Đức', lat: 10.8038, lng: 106.7327 },
  { keywords: ['vạn hạnh mall', 'van hanh mall'], name: 'Vạn Hạnh Mall, Quận 10', lat: 10.7713, lng: 106.6698 },
  { keywords: ['phan xích long'], name: 'Phố ẩm thực Phan Xích Long, Phú Nhuận', lat: 10.7988, lng: 106.6881 },
  { keywords: ['bến xe miền đông'], name: 'Bến xe Miền Đông, Bình Thạnh', lat: 10.8142, lng: 106.7118 },
  { keywords: ['bến xe miền tây'], name: 'Bến xe Miền Tây, Bình Tân', lat: 10.7518, lng: 106.6188 },
  { keywords: ['ga sài gòn', 'ga sai gon'], name: 'Ga Sài Gòn, Quận 3', lat: 10.7816, lng: 106.6784 },
  { keywords: ['vincom đồng khởi'], name: 'Vincom Center Đồng Khởi, Quận 1', lat: 10.7780, lng: 106.7020 },
  { keywords: ['bến bạch đằng', 'bạch đằng'], name: 'Bến Bạch Đằng, Quận 1', lat: 10.7719, lng: 106.7068 },
  { keywords: ['bách khoa', 'hcmut'], name: 'Đại học Bách Khoa, Quận 10', lat: 10.7725, lng: 106.6578 },
  { keywords: ['sư phạm kỹ thuật', 'spkt'], name: 'ĐH Sư Phạm Kỹ Thuật, TP. Thủ Đức', lat: 10.8509, lng: 106.7720 },
  { keywords: ['bến xe an sương', 'an sương'], name: 'Bến xe An Sương, Quận 12', lat: 10.8496, lng: 106.6174 }
];

// District centroids
const DISTRICTS = [
  { keywords: ['quận 1', 'q.1', 'q1', 'district 1'], name: 'Quận 1', lat: 10.7769, lng: 106.7009 },
  { keywords: ['quận 2', 'q.2', 'q2', 'district 2'], name: 'Quận 2 (TP. Thủ Đức)', lat: 10.7872, lng: 106.7498 },
  { keywords: ['quận 3', 'q.3', 'q3', 'district 3'], name: 'Quận 3', lat: 10.7844, lng: 106.6844 },
  { keywords: ['quận 4', 'q.4', 'q4', 'district 4'], name: 'Quận 4', lat: 10.7578, lng: 106.7013 },
  { keywords: ['quận 5', 'q.5', 'q5', 'district 5'], name: 'Quận 5', lat: 10.7540, lng: 106.6634 },
  { keywords: ['quận 6', 'q.6', 'q6', 'district 6'], name: 'Quận 6', lat: 10.7481, lng: 106.6352 },
  { keywords: ['quận 7', 'q.7', 'q7', 'district 7'], name: 'Quận 7', lat: 10.7340, lng: 106.7218 },
  { keywords: ['quận 8', 'q.8', 'q8', 'district 8'], name: 'Quận 8', lat: 10.7241, lng: 106.6286 },
  { keywords: ['quận 9', 'q.9', 'q9', 'district 9'], name: 'Quận 9 (TP. Thủ Đức)', lat: 10.8306, lng: 106.7915 },
  { keywords: ['quận 10', 'q.10', 'q10', 'district 10'], name: 'Quận 10', lat: 10.7716, lng: 106.6672 },
  { keywords: ['quận 11', 'q.11', 'q11', 'district 11'], name: 'Quận 11', lat: 10.7629, lng: 106.6503 },
  { keywords: ['quận 12', 'q.12', 'q12', 'district 12'], name: 'Quận 12', lat: 10.8672, lng: 106.6413 },
  { keywords: ['bình thạnh', 'binh thanh'], name: 'Bình Thạnh', lat: 10.8106, lng: 106.7091 },
  { keywords: ['gò vấp', 'go vap'], name: 'Gò Vấp', lat: 10.8387, lng: 106.6653 },
  { keywords: ['phú nhuận', 'phu nhuan'], name: 'Phú Nhuận', lat: 10.7992, lng: 106.6803 },
  { keywords: ['tân bình', 'tan binh'], name: 'Tân Bình', lat: 10.8015, lng: 106.6526 },
  { keywords: ['tân phú', 'tan phu'], name: 'Tân Phú', lat: 10.7901, lng: 106.6282 },
  { keywords: ['thủ đức', 'thu duc', 'tp thủ đức', 'tp. thủ đức'], name: 'TP. Thủ Đức', lat: 10.8494, lng: 106.7537 },
  { keywords: ['bình tân', 'binh tan'], name: 'Bình Tân', lat: 10.7654, lng: 106.6039 },
  { keywords: ['nhà bè', 'nha be'], name: 'Nhà Bè', lat: 10.6953, lng: 106.7289 },
  { keywords: ['bình chánh', 'binh chanh'], name: 'Bình Chánh', lat: 10.6874, lng: 106.5939 },
  { keywords: ['hóc môn', 'hoc mon'], name: 'Hóc Môn', lat: 10.8839, lng: 106.5898 },
  { keywords: ['củ chi', 'cu chi'], name: 'Củ Chi', lat: 10.9733, lng: 106.4936 },
  { keywords: ['cần giờ', 'can gio'], name: 'Cần Giờ', lat: 10.4114, lng: 106.9546 }
];

const SUGGESTIONS = [
  'Tòa nhà Bitexco, Quận 1',
  'Chợ Bến Thành, Quận 1',
  'Landmark 81, Bình Thạnh',
  'Sân bay Tân Sơn Nhất, Tân Bình',
  'Phố đi bộ Nguyễn Huệ, Quận 1',
  'Hồ Con Rùa, Quận 3',
  'Nhà thờ Đức Bà, Quận 1',
  'Crescent Mall, Quận 7',
  'SC VivoCity, Quận 7',
  'KTX Khu B ĐHQG, Thủ Đức',
  'Khu du lịch Suối Tiên, Thủ Đức',
  'Công viên Đầm Sen, Quận 11',
  'Bệnh viện Chợ Rẫy, Quận 5',
  'Aeon Mall Tân Phú, Tân Phú',
  'Aeon Mall Bình Tân, Bình Tân',
  'Khu Thảo Điền, TP. Thủ Đức',
  'Vạn Hạnh Mall, Quận 10',
  'Ga Sài Gòn, Quận 3',
  'Phan Xích Long, Phú Nhuận',
  'Bến xe Miền Đông, Bình Thạnh',
  'Bến xe Miền Tây, Bình Tân',
  'Bến xe An Sương, Quận 12',
  'Đại học Bách Khoa, Quận 10',
  'ĐH Sư Phạm Kỹ Thuật, TP. Thủ Đức'
];

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function geocodeAddress(addressStr) {
  if (!addressStr || typeof addressStr !== 'string') {
    return { lat: 10.7716, lng: 106.7044, name: 'Quận 1' };
  }

  const rawLower = addressStr.toLowerCase();
  const normalized = normalizeText(addressStr);

  // 1. Match Known Landmark
  for (const loc of KNOWN_LOCATIONS) {
    for (const kw of loc.keywords) {
      if (rawLower.includes(kw) || normalized.includes(normalizeText(kw))) {
        return { lat: loc.lat, lng: loc.lng, name: loc.name };
      }
    }
  }

  // 2. Match District
  for (const d of DISTRICTS) {
    for (const kw of d.keywords) {
      if (rawLower.includes(kw) || normalized.includes(normalizeText(kw))) {
        const hashVal = simpleHash(addressStr);
        const latOffset = ((hashVal % 100) - 50) / 10000;
        const lngOffset = (((hashVal >> 3) % 100) - 50) / 10000;
        return {
          lat: Number((d.lat + latOffset).toFixed(4)),
          lng: Number((d.lng + lngOffset).toFixed(4)),
          name: `${addressStr.trim()} (${d.name})`
        };
      }
    }
  }

  // 3. Fallback: Hash-based coordinates within central Ho Chi Minh City bounds
  const hash = simpleHash(addressStr);
  const lat = 10.7400 + (hash % 1000) / 10000;
  const lng = 106.6300 + ((hash >> 4) % 1000) / 10000;

  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    name: addressStr.trim()
  };
}

function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return 'Địa điểm đã chọn';

  let closestName = null;
  let minDist = Infinity;

  for (const loc of KNOWN_LOCATIONS) {
    const d = calculateDrivingDistanceKm({ lat, lng }, { lat: loc.lat, lng: loc.lng });
    if (d < minDist) {
      minDist = d;
      closestName = loc.name;
    }
  }

  for (const dist of DISTRICTS) {
    const d = calculateDrivingDistanceKm({ lat, lng }, { lat: dist.lat, lng: dist.lng });
    if (d < minDist) {
      minDist = d;
      closestName = dist.name;
    }
  }

  if (minDist <= 1.8 && closestName) {
    return closestName;
  }
  return `Tọa độ (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

function calculateDrivingDistanceKm(coord1, coord2) {
  const lat1 = typeof coord1 === 'object' ? coord1.lat : arguments[0];
  const lon1 = typeof coord1 === 'object' ? coord1.lng : arguments[1];
  const lat2 = typeof coord2 === 'object' ? coord2.lat : arguments[2];
  const lon2 = typeof coord2 === 'object' ? coord2.lng : arguments[3];

  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const straightLineDistance = R * c;

  // Average city road circuity factor
  const roadFactor = straightLineDistance < 3 ? 1.35 : straightLineDistance < 10 ? 1.28 : 1.22;
  const estimatedDrivingKm = straightLineDistance * roadFactor;

  return Math.max(1.2, Number(estimatedDrivingKm.toFixed(1)));
}

function calculateFare(vehicleTypeId, distanceKm = 5.0) {
  const dist = Math.max(1.0, Number(distanceKm) || 5.0);
  const typeId = Number(vehicleTypeId) || 2;

  let baseFare = 20000;
  let perKmRate = 12000;
  let typeName = 'Cab Car 4-Chỗ';

  switch (typeId) {
    case 1:
      baseFare = 12000;
      perKmRate = 5000;
      typeName = 'Cab Bike';
      break;
    case 2:
      baseFare = 20000;
      perKmRate = 12000;
      typeName = 'Cab Car 4-Chỗ';
      break;
    case 3:
      baseFare = 28000;
      perKmRate = 16000;
      typeName = 'Cab Car 7-Chỗ';
      break;
  }

  const billableExtraKm = Math.max(0, dist - 2.0);
  const totalFare = Math.round(baseFare + (billableExtraKm * perKmRate));
  const co2SavedKg = Number((dist * 0.14).toFixed(2));
  const estimatedDurationMins = Math.max(3, Math.round(dist * 2.4 + 2));

  return {
    vehicleTypeId: typeId,
    typeName,
    baseFare,
    perKmRate,
    distanceKm: Number(dist.toFixed(1)),
    totalFare,
    estimatedDurationMins,
    co2SavedKg
  };
}

// ============================================================================
// 2. Global Application State
// ============================================================================
let map = null;
let pickupMarker = null;
let destMarker = null;
let routeLine = null;
let driverMarkers = [];
let currentTrip = null;
let selectedVehicleType = 2; // Default: Cab Car 4-Chỗ
let currentDistanceKm = 9.2;
let currentPickupCoord = null;
let currentDestCoord = null;
let mapPickMode = null; // 'pickup' | 'dest' | null
let debounceTimer = null;
let autoWorkflowTimer = null;

// ============================================================================
// 3. Leaflet Map Initialization & Interactive Handlers
// ============================================================================
function initMap() {
  if (typeof L === 'undefined') return;

  map = L.map('cabMap', {
    zoomControl: true,
    attributionControl: false
  }).setView([10.7769, 106.7009], 12);

  // Clean, high-performance Voyager map tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Map Click Listener for instant location setting
  map.on('click', (e) => {
    handleMapClick(e.latlng.lat, e.latlng.lng);
  });

  // Load online drivers
  loadDriversOnMap();

  // Initial Route & Pricing calculation
  calculateDynamicRoute(false);
}

function centerMapHCMC() {
  if (map) map.setView([10.7769, 106.7009], 12);
}

function setMapPickMode(mode) {
  if (mapPickMode === mode) {
    mapPickMode = null;
  } else {
    mapPickMode = mode;
  }

  const btnP = document.getElementById('btnPickPickup');
  const btnD = document.getElementById('btnPickDest');
  if (btnP) btnP.classList.toggle('active', mapPickMode === 'pickup');
  if (btnD) btnD.classList.toggle('active', mapPickMode === 'dest');

  if (mapPickMode) {
    logEvent('MAP_MODE', `Đang ở chế độ chọn: ${mapPickMode === 'pickup' ? 'Điểm Đón' : 'Điểm Đến'}. Hãy click vào bản đồ.`, 'info');
  }
}

function handleMapClick(lat, lng) {
  const chosenName = reverseGeocode(lat, lng);

  if (mapPickMode === 'pickup') {
    document.getElementById('pickupInput').value = chosenName;
    currentPickupCoord = { lat, lng, name: chosenName };
    setMapPickMode(null);
    logEvent('LOCATION_SET', `Đã chọn điểm đón: ${chosenName}`, 'success');
    calculateDynamicRoute(false);
    return;
  }

  if (mapPickMode === 'dest') {
    document.getElementById('destInput').value = chosenName;
    currentDestCoord = { lat, lng, name: chosenName };
    setMapPickMode(null);
    logEvent('LOCATION_SET', `Đã chọn điểm đến: ${chosenName}`, 'success');
    calculateDynamicRoute(false);
    return;
  }

  // Default behavior when clicking directly on map without explicit mode:
  // Move destination pin to clicked point
  document.getElementById('destInput').value = chosenName;
  currentDestCoord = { lat, lng, name: chosenName };
  calculateDynamicRoute(false);
}

// ============================================================================
// 4. Instant Route & Fare Calculation (0ms Client-Side + Background Sync)
// ============================================================================
function calculateDynamicRoute(isTyping = false) {
  const pickupText = document.getElementById('pickupInput').value.trim();
  const destText = document.getElementById('destInput').value.trim();

  if (!pickupText || !destText) return;

  // 1. Resolve coordinates
  let pCoord = currentPickupCoord;
  if (!pCoord || pCoord.name !== pickupText) {
    pCoord = geocodeAddress(pickupText);
    currentPickupCoord = pCoord;
  }

  let dCoord = currentDestCoord;
  if (!dCoord || dCoord.name !== destText) {
    dCoord = geocodeAddress(destText);
    currentDestCoord = dCoord;
  }

  // 2. Instant Haversine driving distance
  const distKm = calculateDrivingDistanceKm(pCoord, dCoord);
  currentDistanceKm = distKm;

  // 3. Instant Fare calculation for all vehicle classes
  const f1 = calculateFare(1, distKm);
  const f2 = calculateFare(2, distKm);
  const f3 = calculateFare(3, distKm);

  // 4. Update UI Elements Instantly
  const distEl = document.getElementById('displayDistance');
  const durEl = document.getElementById('displayDuration');
  const co2El = document.getElementById('displayCo2');
  const fareBikeEl = document.getElementById('fareBike');
  const fareCar4El = document.getElementById('fareCar4');
  const fareCar7El = document.getElementById('fareCar7');

  distEl.innerText = `${distKm} km`;
  durEl.innerText = `${f2.estimatedDurationMins} phút`;
  co2El.innerText = `${f2.co2SavedKg} kg`;

  fareBikeEl.innerText = `${f1.totalFare.toLocaleString()}đ`;
  fareCar4El.innerText = `${f2.totalFare.toLocaleString()}đ`;
  fareCar7El.innerText = `${f3.totalFare.toLocaleString()}đ`;

  let activeAmount = f2.totalFare;
  if (selectedVehicleType === 1) activeAmount = f1.totalFare;
  if (selectedVehicleType === 3) activeAmount = f3.totalFare;
  const payInput = document.getElementById('payAmountInput');
  if (payInput) payInput.value = activeAmount;

  // Sync VietQR details with currently calculated fare
  updateVietQRInfo(currentTrip ? currentTrip.tripId : 5001, activeAmount);

  // Flash animation to visibly signify the update
  distEl.classList.remove('flash-update');
  void distEl.offsetWidth; // trigger reflow
  distEl.classList.add('flash-update');

  // 5. Update Leaflet Map Markers & Polyline
  updateMapRoute(pCoord, dCoord);

  // 6. Background synchronization with Backend Microservice
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/trips/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation: pickupText,
          destination: destText,
          vehicleTypeId: selectedVehicleType,
          pickupLat: pCoord.lat,
          pickupLng: pCoord.lng,
          destLat: dCoord.lat,
          destLng: dCoord.lng
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Keep synced with backend
        if (data.distanceKm && data.distanceKm !== currentDistanceKm) {
          currentDistanceKm = data.distanceKm;
          distEl.innerText = `${data.distanceKm} km`;
        }
      }
    } catch (err) {
      // Client-side calculations already guarantee functionality even if backend is offline
    }
  }, isTyping ? 350 : 50);
}

function updateMapRoute(pickupCoord, destCoord) {
  if (!map || !pickupCoord || !destCoord) return;

  // Pickup Marker (Green Pin - Draggable)
  if (pickupMarker) {
    pickupMarker.setLatLng([pickupCoord.lat, pickupCoord.lng]);
    pickupMarker.setPopupContent(`<strong>Điểm đón:</strong><br>${pickupCoord.name}<br><small class="text-success">Kéo thả để đổi điểm đón</small>`);
  } else {
    const greenIcon = L.divIcon({
      html: '<div style="background:#10B981; width:18px; height:18px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(16,185,129,0.9); cursor:grab;"></div>',
      className: 'pickup-icon',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    pickupMarker = L.marker([pickupCoord.lat, pickupCoord.lng], { icon: greenIcon, draggable: true }).addTo(map);
    pickupMarker.bindPopup(`<strong>Điểm đón:</strong><br>${pickupCoord.name}<br><small class="text-success">Kéo thả để đổi điểm đón</small>`);

    pickupMarker.on('dragend', () => {
      const pos = pickupMarker.getLatLng();
      const name = reverseGeocode(pos.lat, pos.lng);
      document.getElementById('pickupInput').value = name;
      currentPickupCoord = { lat: pos.lat, lng: pos.lng, name };
      logEvent('PIN_MOVED', `Đã dời điểm đón đến: ${name}`, 'info');
      calculateDynamicRoute(false);
    });
  }

  // Destination Marker (Red Pin - Draggable)
  if (destMarker) {
    destMarker.setLatLng([destCoord.lat, destCoord.lng]);
    destMarker.setPopupContent(`<strong>Điểm đến:</strong><br>${destCoord.name}<br><small class="text-danger">Kéo thả để đổi điểm đến</small>`);
  } else {
    const redIcon = L.divIcon({
      html: '<div style="background:#EF4444; width:18px; height:18px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(239,68,68,0.9); cursor:grab;"></div>',
      className: 'dest-icon',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    destMarker = L.marker([destCoord.lat, destCoord.lng], { icon: redIcon, draggable: true }).addTo(map);
    destMarker.bindPopup(`<strong>Điểm đến:</strong><br>${destCoord.name}<br><small class="text-danger">Kéo thả để đổi điểm đến</small>`);

    destMarker.on('dragend', () => {
      const pos = destMarker.getLatLng();
      const name = reverseGeocode(pos.lat, pos.lng);
      document.getElementById('destInput').value = name;
      currentDestCoord = { lat: pos.lat, lng: pos.lng, name };
      logEvent('PIN_MOVED', `Đã dời điểm đến đến: ${name}`, 'info');
      calculateDynamicRoute(false);
    });
  }

  // Route Polyline
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline([
    [pickupCoord.lat, pickupCoord.lng],
    [destCoord.lat, destCoord.lng]
  ], {
    color: '#3B82F6',
    weight: 4,
    opacity: 0.85,
    dashArray: '8, 8'
  }).addTo(map);

  // Fit bounds cleanly
  try {
    const group = new L.featureGroup([pickupMarker, destMarker]);
    map.fitBounds(group.getBounds().pad(0.25));
  } catch (err) {}
}

// ============================================================================
// 5. Input Events & Helper Functions
// ============================================================================
function onAddressChanged(type) {
  const inputEl = document.getElementById(`${type}Input`);
  const listEl = document.getElementById(`${type}Suggestions`);
  const query = inputEl.value.toLowerCase().trim();

  // Reset coordinate cache so it resolves new address
  if (type === 'pickup') currentPickupCoord = null;
  if (type === 'dest') currentDestCoord = null;

  // Immediate Client-Side calculation on every keystroke
  calculateDynamicRoute(true);

  if (!query) {
    if (listEl) listEl.style.display = 'none';
    return;
  }

  // Autocomplete suggestion dropdown
  const matches = SUGGESTIONS.filter(s => s.toLowerCase().includes(query)).slice(0, 5);
  if (matches.length > 0 && listEl) {
    listEl.innerHTML = matches.map(m => `
      <div class="autocomplete-item" onclick="selectSuggestion('${type}', '${m.replace(/'/g, "\\'")}')">
        <i class="fa-solid fa-location-dot me-2 text-secondary"></i>${m}
      </div>
    `).join('');
    listEl.style.display = 'block';
  } else if (listEl) {
    listEl.style.display = 'none';
  }
}

function selectSuggestion(type, value) {
  document.getElementById(`${type}Input`).value = value;
  const listEl = document.getElementById(`${type}Suggestions`);
  if (listEl) listEl.style.display = 'none';
  if (type === 'pickup') currentPickupCoord = geocodeAddress(value);
  if (type === 'dest') currentDestCoord = geocodeAddress(value);
  calculateDynamicRoute(false);
}

function swapLocations() {
  const pInput = document.getElementById('pickupInput');
  const dInput = document.getElementById('destInput');
  const temp = pInput.value;
  pInput.value = dInput.value;
  dInput.value = temp;

  const tempCoord = currentPickupCoord;
  currentPickupCoord = currentDestCoord;
  currentDestCoord = tempCoord;

  logEvent('ROUTE_SWAPPED', `Đã đảo chiều lộ trình: ${pInput.value} ⇄ ${dInput.value}`, 'info');
  calculateDynamicRoute(false);
}

function recalculateFares() {
  calculateDynamicRoute(false);
  logEvent('RECALCULATE', `Đã tính lại cước lộ trình: ${currentDistanceKm} km`, 'success');
}

function applyPreset(pickup, dest) {
  document.getElementById('pickupInput').value = pickup;
  document.getElementById('destInput').value = dest;
  currentPickupCoord = geocodeAddress(pickup);
  currentDestCoord = geocodeAddress(dest);
  calculateDynamicRoute(false);
}

function selectVehicle(typeId) {
  selectedVehicleType = typeId;
  document.querySelectorAll('.vehicle-option').forEach(el => el.classList.remove('selected'));
  const targetId = typeId === 1 ? 'opt-bike' : typeId === 2 ? 'opt-car4' : 'opt-car7';
  const targetEl = document.getElementById(targetId);
  if (targetEl) targetEl.classList.add('selected');
  calculateDynamicRoute(false);
}

// ============================================================================
// 6. Fleet Map Rendering
// ============================================================================
async function loadDriversOnMap() {
  try {
    const res = await fetch('/api/drivers/fleet');
    if (res.ok) {
      const fleet = await res.json();
      const countEl = document.getElementById('driverOnlineCount');
      if (countEl) countEl.innerText = `${fleet.length} tài xế online`;

      driverMarkers.forEach(m => map.removeLayer(m));
      driverMarkers = [];

      fleet.forEach(d => {
        if (!d.latitude || !d.longitude) return;
        const iconHtml = d.vehicleTypeId === 1
          ? '<div style="font-size: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🛵</div>'
          : '<div style="font-size: 18px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🚗</div>';

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'driver-map-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([d.latitude, d.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <strong>${d.fullName}</strong><br>
          <small>${d.model || d.brand}</small><br>
          <span style="color: #2563eb;">${d.licensePlate}</span> • ★ ${d.rating}
        `);
        marker.driverId = d.driverId;
        driverMarkers.push(marker);
      });
    }
  } catch (err) {}
}

// ============================================================================
// 7. Booking Submission & User-Controlled Stepper Lifecycle
// ============================================================================
async function submitBooking() {
  const pickup = document.getElementById('pickupInput').value.trim();
  const dest = document.getElementById('destInput').value.trim();

  if (!pickup || !dest) {
    alert('Vui lòng nhập đầy đủ điểm đón và điểm đến!');
    return;
  }

  const pCoord = currentPickupCoord || geocodeAddress(pickup);

  try {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1,
        pickupLocation: pickup,
        destination: dest,
        vehicleTypeId: selectedVehicleType,
        distanceKm: currentDistanceKm,
        pickupLat: pCoord.lat,
        pickupLng: pCoord.lng,
        autoDispatch: false
      })
    });

    const data = await res.json();
    if (res.ok) {
      currentTrip = data;

      // 1. Show Active Trip Box & Searching Radar
      document.getElementById('activeTripBox').classList.remove('d-none');
      document.getElementById('currentTripId').innerText = data.tripId;
      document.getElementById('currentTripStatus').innerText = 'Searching (Đang tìm tài xế...)';
      document.getElementById('currentTripStatus').className = 'badge bg-warning text-dark fw-bold px-2 py-1';
      document.getElementById('tripProgressBar').style.width = '20%';

      // Reset Radar & Driver Card
      const radarBox = document.getElementById('radarSearchingBox');
      const driverCard = document.getElementById('matchedDriverCard');
      if (radarBox) radarBox.classList.remove('d-none');
      if (driverCard) driverCard.classList.add('d-none');

      // Reset lifecycle step buttons
      resetStepperButtons();
      document.getElementById('workflowNotice').innerText = 'Hệ thống đang phát tín hiệu tìm tài xế gần bạn nhất...';

      // Update VietQR with this trip ID & fare
      updateVietQRInfo(data.tripId, Number(data.estimatedFare || payAmountInput.value));

      logEvent('TRIP_CREATED', `Tạo chuyến #${data.tripId} (${pickup} → ${dest}) - Cước: ${Number(data.estimatedFare).toLocaleString()}đ`, 'warning');

      loadDriversOnMap();
      loadAdminData();

      // 2. Realistic Search Delay: After 2.2s, driver receives and accepts the trip
      const candidateDriver = data.candidateDriver || {
        driverId: 88,
        fullName: 'Lê Văn Tài',
        model: 'Toyota Vios 2024',
        licensePlate: '59A-888.66',
        rating: 4.95,
        etaText: '2 phút (650m)'
      };

      setTimeout(async () => {
        try {
          const resp = await fetch(`/api/trips/${data.tripId}/driver-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId: candidateDriver.driverId, action: 'ACCEPT' })
          });

          if (resp.ok) {
            // Hide Radar, Display Matched Driver Profile
            if (radarBox) radarBox.classList.add('d-none');
            if (driverCard) {
              driverCard.classList.remove('d-none');
              document.getElementById('matchedDriverName').innerText = candidateDriver.fullName;
              document.getElementById('matchedDriverVehicle').innerText = candidateDriver.model || candidateDriver.brand || 'Ô tô tiêu chuẩn';
              document.getElementById('matchedDriverPlate').innerText = candidateDriver.licensePlate || '59A-888.66';
              document.getElementById('matchedDriverRating').innerText = candidateDriver.rating || '4.95';
              document.getElementById('matchedDriverEta').innerText = candidateDriver.etaText || '2 phút (650m)';
            }

            document.getElementById('currentTripStatus').innerText = 'DriverAccepted';
            document.getElementById('currentTripStatus').className = 'badge bg-primary px-2 py-1';
            document.getElementById('tripProgressBar').style.width = '40%';
            document.getElementById('workflowNotice').innerText = 'Tài xế đã nhận chuyến! Hãy bấm nút [1. Đã tới đón] dưới đây khi tài xế tới:';

            // Highlight Step 1 button so user can advance when ready
            const b3 = document.getElementById('btnStep3');
            if (b3) b3.classList.add('btn-active-step');

            logEvent('DRIVER_ACCEPTED', `Tài xế ${candidateDriver.fullName} (${candidateDriver.licensePlate}) đã nhận chuyến #${data.tripId}`, 'success');

            loadDriversOnMap();
            loadAdminData();
          }
        } catch (e) {
          console.error(e);
        }
      }, 2200);

    } else {
      alert(data.message || 'Lỗi khi đặt chuyến');
    }
  } catch (err) {
    alert('Không thể kết nối đến Trip Service. Vui lòng kiểm tra microservices.');
  }
}

function resetStepperButtons() {
  const stepIds = ['btnStep3', 'btnStep4', 'btnStep5', 'btnStep6'];
  stepIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'lifecycle-step-btn';
    }
  });
  const b3 = document.getElementById('btnStep3');
  const b4 = document.getElementById('btnStep4');
  const b5 = document.getElementById('btnStep5');
  const b6 = document.getElementById('btnStep6');
  if (b3) b3.innerHTML = '<i class="fa-solid fa-location-dot text-info"></i><span>1. Đã tới đón</span>';
  if (b4) b4.innerHTML = '<i class="fa-solid fa-person-walking text-primary"></i><span>2. Khách lên xe</span>';
  if (b5) b5.innerHTML = '<i class="fa-solid fa-car-side text-warning"></i><span>3. Đang di chuyển</span>';
  if (b6) b6.innerHTML = '<i class="fa-solid fa-flag-checkered text-success"></i><span>4. Hoàn thành</span>';
}

// User-Controlled Manual Status Transitions
async function manualStatus(statusId) {
  const tripId = currentTrip ? currentTrip.tripId : 5001;

  const names = {
    3: 'DriverArrived',
    4: 'PassengerPickedUp',
    5: 'InProgress',
    6: 'Completed'
  };

  try {
    const res = await fetch(`/api/trips/${tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: statusId })
    });

    if (res.ok) {
      const statusBadge = document.getElementById('currentTripStatus');
      const notice = document.getElementById('workflowNotice');
      const bar = document.getElementById('tripProgressBar');

      logEvent('TRIP_STATUS_UPDATED', `Chuyển trạng thái chuyến #${tripId} → ${names[statusId]}`, 'info');
      if (statusBadge) statusBadge.innerText = names[statusId];

      const b3 = document.getElementById('btnStep3');
      const b4 = document.getElementById('btnStep4');
      const b5 = document.getElementById('btnStep5');
      const b6 = document.getElementById('btnStep6');

      if (statusId === 3) {
        // Step 1 done -> Step 2 active
        if (b3) {
          b3.className = 'lifecycle-step-btn btn-done-step';
          b3.innerHTML = '<i class="fa-solid fa-check text-success"></i><span>✔ 1. Đã tới đón</span>';
        }
        if (b4) b4.classList.add('btn-active-step');
        if (bar) bar.style.width = '60%';
        if (notice) notice.innerText = 'Tài xế đã có mặt tại điểm đón! Hãy bấm [2. Khách lên xe] khi bạn vào xe:';
        if (statusBadge) statusBadge.className = 'badge bg-info text-dark px-2 py-1';

        // Move driver marker on map next to pickup
        if (pickupMarker && driverMarkers.length > 0) {
          const pLat = pickupMarker.getLatLng();
          driverMarkers[0].setLatLng([pLat.lat + 0.0003, pLat.lng + 0.0003]);
        }
      } else if (statusId === 4) {
        // Step 2 done -> Step 3 active
        if (b4) {
          b4.className = 'lifecycle-step-btn btn-done-step';
          b4.innerHTML = '<i class="fa-solid fa-check text-success"></i><span>✔ 2. Khách lên xe</span>';
        }
        if (b5) b5.classList.add('btn-active-step');
        if (bar) bar.style.width = '75%';
        if (notice) notice.innerText = 'Khách đã lên xe an toàn! Hãy bấm [3. Đang di chuyển] để bắt đầu hành trình:';
        if (statusBadge) statusBadge.className = 'badge bg-primary px-2 py-1';
      } else if (statusId === 5) {
        // Step 3 done -> Step 4 active
        if (b5) {
          b5.className = 'lifecycle-step-btn btn-done-step';
          b5.innerHTML = '<i class="fa-solid fa-check text-success"></i><span>✔ 3. Đang di chuyển</span>';
        }
        if (b6) b6.classList.add('btn-active-step');
        if (bar) bar.style.width = '90%';
        if (notice) notice.innerText = 'Xe đang di chuyển trên đường theo lộ trình. Hãy bấm [4. Hoàn thành] khi tới điểm đến:';
        if (statusBadge) statusBadge.className = 'badge bg-warning text-dark px-2 py-1';
      } else if (statusId === 6) {
        // Step 4 done -> Completed!
        if (b6) {
          b6.className = 'lifecycle-step-btn btn-done-step';
          b6.innerHTML = '<i class="fa-solid fa-check text-success"></i><span>✔ 4. Hoàn thành</span>';
        }
        if (bar) {
          bar.style.width = '100%';
          bar.className = 'progress-bar bg-success';
        }
        if (statusBadge) {
          statusBadge.innerText = 'Completed (Hoàn thành)';
          statusBadge.className = 'badge bg-success px-2 py-1';
        }
        if (notice) notice.innerText = '✔ Chuyến xe đã kết thúc an toàn! Vui lòng tiến hành thanh toán bên dưới.';

        // Unlock Payment Section (BRL12 satisfied)
        const lockNotice = document.getElementById('paymentLockNotice');
        if (lockNotice) lockNotice.classList.add('d-none');

        const payBadge = document.getElementById('paymentStatusBadge');
        if (payBadge) {
          payBadge.innerText = 'Chờ thanh toán cước';
          payBadge.className = 'badge bg-warning text-dark';
        }

        const payCard = document.getElementById('paymentSectionCard');
        if (payCard) {
          payCard.classList.remove('flash-update');
          void payCard.offsetWidth;
          payCard.classList.add('flash-update');
          payCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      loadAdminData();
    }
  } catch (err) {
    console.error(err);
  }
}

async function cancelTrip() {
  if (!currentTrip) return;
  if (!confirm('Bạn có chắc muốn hủy chuyến đi này?')) return;

  try {
    const res = await fetch(`/api/trips/${currentTrip.tripId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelledBy: 'CUSTOMER', reason: 'Thay đổi kế hoạch' })
    });

    if (res.ok) {
      if (autoWorkflowTimer) clearTimeout(autoWorkflowTimer);
      logEvent('TRIP_CANCELLED', `Chuyến #${currentTrip.tripId} đã bị hủy`, 'error');
      document.getElementById('currentTripStatus').innerText = 'Cancelled';
      document.getElementById('currentTripStatus').className = 'badge bg-danger px-2 py-1';
      loadDriversOnMap();
      loadAdminData();
    }
  } catch (err) {}
}

// ============================================================================
// 8. VietQR & Realistic Virtual Payment Simulator (BRL12, BRL16, AC06.3)
// ============================================================================
function updateVietQRInfo(tripId, amount) {
  const formattedAmount = Number(amount || 106400).toLocaleString();
  const memo = `CAB${tripId || 5001} THANH TOAN`;

  const amountDisplay = document.getElementById('qrPayAmountDisplay');
  const memoDisplay = document.getElementById('qrPayMemoDisplay');
  const simAmount = document.getElementById('simModalAmount');
  const simMemo = document.getElementById('simModalMemo');
  const qrImg = document.getElementById('vietqrImage');

  if (amountDisplay) amountDisplay.innerText = `${formattedAmount} VNĐ`;
  if (memoDisplay) memoDisplay.innerText = memo;
  if (simAmount) simAmount.innerText = `${formattedAmount} đ`;
  if (simMemo) simMemo.innerText = memo;

  if (qrImg) {
    qrImg.src = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${amount || 106400}&addInfo=CAB${tripId || 5001}&accountName=CAB%20SYSTEM%20VIETNAM`;
  }
}

function copyText(text, label) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  logEvent('CLIPBOARD', `Đã sao chép ${label || 'nội dung'}: ${text}`, 'info');
  alert(`📋 Đã sao chép ${label || ''}: ${text}`);
}

// Open Virtual Smartphone Simulator Modal
async function openVirtualPayModal() {
  const tripId = currentTrip ? currentTrip.tripId : 5001;
  const statusBadge = document.getElementById('currentTripStatus');
  const currentStatus = statusBadge ? statusBadge.innerText : '';

  // If trip is not completed yet, ask to complete it first (satisfying BRL12)
  if (!currentStatus.includes('Completed')) {
    const ok = confirm('Chuyến xe chưa ở trạng thái "Hoàn thành". Bạn có muốn hệ thống đánh dấu hoàn thành chuyến đi và mở thanh toán ảo ngay không?');
    if (!ok) return;
    await manualStatus(6);
  }

  // Update clock on simulated phone
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const phoneClock = document.getElementById('phoneClock');
  if (phoneClock) phoneClock.innerText = timeStr;

  // Reset phone screens
  document.getElementById('phoneModalContent').classList.remove('d-none');
  document.getElementById('phoneModalProcessing').classList.add('d-none');
  document.getElementById('phoneModalSuccess').classList.add('d-none');

  document.getElementById('virtualPayModal').classList.remove('d-none');
}

function closeVirtualPayModal() {
  document.getElementById('virtualPayModal').classList.add('d-none');
}

// Execute Transfer in Simulator
async function executeVirtualTransfer() {
  document.getElementById('phoneModalContent').classList.add('d-none');
  document.getElementById('phoneModalProcessing').classList.remove('d-none');

  const txnCode = `TXN-MB-${Math.floor(100000 + Math.random() * 900000)}`;

  setTimeout(async () => {
    document.getElementById('phoneModalProcessing').classList.add('d-none');
    document.getElementById('phoneModalSuccess').classList.remove('d-none');
    document.getElementById('simSuccessAmount').innerText = document.getElementById('simModalAmount').innerText;
    document.getElementById('simSuccessCode').innerText = txnCode;

    // Send payment request to backend
    await executePaymentRequest(2, txnCode);
  }, 1200);
}

function finishVirtualPayment() {
  closeVirtualPayModal();

  const successAlert = document.getElementById('paymentSuccessAlert');
  if (successAlert) {
    successAlert.classList.remove('d-none');
    successAlert.classList.add('d-flex');
  }

  const payBadge = document.getElementById('paymentStatusBadge');
  if (payBadge) {
    payBadge.innerText = 'ĐÃ THANH TOÁN (PAID)';
    payBadge.className = 'badge bg-success';
  }

  // Scroll to Rating Section
  const ratingBox = document.getElementById('ratingSectionBox');
  if (ratingBox) ratingBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Quick 1-Click Pay Confirmation
async function quickConfirmPayment() {
  const statusBadge = document.getElementById('currentTripStatus');
  const currentStatus = statusBadge ? statusBadge.innerText : '';
  if (!currentStatus.includes('Completed')) {
    await manualStatus(6);
  }

  const txnCode = `TXN-FAST-${Math.floor(100000 + Math.random() * 900000)}`;
  await executePaymentRequest(2, txnCode);
  finishVirtualPayment();
}

// Cash Payment
async function cashPayment() {
  const statusBadge = document.getElementById('currentTripStatus');
  const currentStatus = statusBadge ? statusBadge.innerText : '';
  if (!currentStatus.includes('Completed')) {
    await manualStatus(6);
  }

  const txnCode = `TXN-CASH-${Math.floor(100000 + Math.random() * 900000)}`;
  await executePaymentRequest(1, txnCode);
  finishVirtualPayment();
}

// Core Payment API caller
async function executePaymentRequest(methodId, txnCode) {
  const tripId = currentTrip ? currentTrip.tripId : 5001;
  const amount = document.getElementById('payAmountInput').value || 106400;

  try {
    const res = await fetch(`/api/trips/${tripId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: Number(methodId),
        amount: Number(amount),
        transactionCode: txnCode
      })
    });

    const data = await res.json();
    if (res.ok) {
      logEvent('PAYMENT_COMPLETED', `Thanh toán thành công ${Number(amount).toLocaleString()}đ - Mã GD: ${txnCode}`, 'success');
      const detailEl = document.getElementById('paymentSuccessDetail');
      if (detailEl) {
        detailEl.innerText = `Mã GD: ${txnCode} • Số tiền: ${Number(amount).toLocaleString()} VNĐ • Phương thức: ${methodId === 1 ? 'Tiền mặt' : 'VietQR / Điện tử'}`;
      }
      loadDriversOnMap();
      loadAdminData();
    } else {
      console.warn('Payment response warning:', data.message);
    }
  } catch (err) {
    console.error('Payment error:', err);
  }
}

// Driver Rating Submission (AC07.5)
async function submitRating() {
  const tripId = currentTrip ? currentTrip.tripId : 5001;
  const score = document.getElementById('ratingScoreSelect').value;
  const comment = document.getElementById('ratingCommentInput').value;

  try {
    const res = await fetch(`/api/trips/${tripId}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: Number(score),
        comment: comment || 'Tài xế rất lịch sự và chuyên nghiệp'
      })
    });

    const data = await res.json();
    if (res.ok) {
      logEvent('RATING_SUBMITTED', `Gửi đánh giá ${score}★ cho chuyến #${tripId}`, 'success');
      alert(`⭐ Cảm ơn bạn đã gửi đánh giá ${score} sao cho chuyến xe #${tripId}!`);
      loadDriversOnMap();
    } else {
      alert(data.message || 'Lỗi gửi đánh giá');
    }
  } catch (err) {
    alert('Lỗi kết nối tới Rating Service');
  }
}

// ============================================================================
// 9. Operations CMS (UC28 & UC30)
// ============================================================================
async function loadAdminData() {
  try {
    const tripRes = await fetch('/api/admin/trips');
    if (tripRes.ok) {
      const trips = await tripRes.json();
      const tbody = document.getElementById('tripsTableBody');
      if (tbody && Array.isArray(trips)) {
        tbody.innerHTML = trips.slice(-5).reverse().map(t => `
          <tr>
            <td>#${t.tripId}</td>
            <td>${t.driverName || 'Chưa gán'}</td>
            <td class="text-warning">${Number(t.fareAmount || 0).toLocaleString()}đ</td>
            <td><span class="badge ${t.status === 'Completed' ? 'bg-success' : t.status === 'Searching' ? 'bg-warning text-dark' : 'bg-primary'}">${t.status}</span></td>
          </tr>
        `).join('');
      }
    }

    const txRes = await fetch('/api/admin/transactions');
    if (txRes.ok) {
      const txs = await txRes.json();
      let totalRev = 0;
      if (Array.isArray(txs)) {
        txs.forEach(tx => totalRev += (tx.amount || 0));
      }
      const revBadge = document.getElementById('totalRevenueBadge');
      if (revBadge) revBadge.innerText = `Tổng thu: ${totalRev.toLocaleString()} VNĐ`;
    }
  } catch (err) {}
}

// ============================================================================
// 10. Event Stream Logging
// ============================================================================
function logEvent(title, detail, type = 'info') {
  const box = document.getElementById('eventLogBox');
  if (!box) return;
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = 'event-entry';

  let colorClass = 'text-info';
  if (type === 'success') colorClass = 'text-success';
  if (type === 'warning') colorClass = 'text-warning';
  if (type === 'error') colorClass = 'text-danger';

  entry.innerHTML = `<span class="text-secondary">[${time}]</span> <strong class="${colorClass}">${title}</strong> ${detail ? `<span class="text-light">${detail}</span>` : ''}`;
  box.prepend(entry);
}

function clearEventLogs() {
  const box = document.getElementById('eventLogBox');
  if (box) box.innerHTML = '';
}

// ============================================================================
// 11. Health Check for all Microservices
// ============================================================================
async function checkHealth() {
  try {
    const resp = await fetch('/health');
    if (resp.ok) {
      const report = await resp.json();
      const services = ['gateway', 'customer', 'driver', 'trip', 'payment', 'notification', 'operations'];
      services.forEach(name => {
        const pill = document.getElementById(`h-${name}`);
        if (pill) {
          const isUp = name === 'gateway' ? (report.gateway === 'UP') : (report.services && report.services[name] === 'UP');
          pill.className = `status-pill ${isUp ? 'pill-up' : 'pill-down'}`;
        }
      });
    }
  } catch (err) {}
}

// ============================================================================
// 12. Initialization
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  checkHealth();
  loadAdminData();
  setInterval(loadAdminData, 6000);
  setInterval(checkHealth, 10000);

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#pickupInput') && !e.target.closest('#pickupSuggestions')) {
      const p = document.getElementById('pickupSuggestions');
      if (p) p.style.display = 'none';
    }
    if (!e.target.closest('#destInput') && !e.target.closest('#destSuggestions')) {
      const d = document.getElementById('destSuggestions');
      if (d) d.style.display = 'none';
    }
  });
});
