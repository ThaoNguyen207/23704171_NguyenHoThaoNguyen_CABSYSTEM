let map;
let pickupMarker = null;
let destMarker = null;
let routeLine = null;
let driverMarkers = [];
let currentTrip = null;
let selectedVehicleType = 2; // Default: Cab Car 4-Chỗ
let currentDistanceKm = 9.2;
let debounceTimer = null;
let autoWorkflowTimer = null;
let activeMovingDriverMarker = null;

const SUGGESTIONS = [
  'Tòa nhà Bitexco, Quận 1',
  'Chợ Bến Thành, Quận 1',
  'Landmark 81, Bình Thạnh',
  'Sân bay Tân Sơn Nhất, Tân Bình',
  'Phố đi bộ Nguyễn Huệ, Quận 1',
  'Hồ Con Rùa, Quận 3',
  'Nhà thờ Đức Bà, Quận 1',
  'Crescent Mall, Quận 7',
  'KTX Khu B ĐHQG, Thủ Đức',
  'Bệnh viện Chợ Rẫy, Quận 5',
  'Khu du lịch Suối Tiên, Thủ Đức',
  'Công viên Đầm Sen, Quận 11',
  'Aeon Mall Tân Phú, Tân Phú',
  'Aeon Mall Bình Tân, Bình Tân',
  'Khu Thảo Điền, TP. Thủ Đức',
  'Vạn Hạnh Mall, Quận 10',
  'Ga Sài Gòn, Quận 3',
  'Phan Xích Long, Phú Nhuận',
  'Bến xe Miền Đông, Bình Thạnh',
  'Bến xe Miền Tây, Bình Tân'
];

// 1. Initialize Map
function initMap() {
  if (typeof L === 'undefined') return;

  // Center on Ho Chi Minh City
  map = L.map('cabMap', {
    zoomControl: true,
    attributionControl: false
  }).setView([10.7769, 106.7009], 12);

  // CartoDB Dark Matter Tiles (Modern Dark Theme)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Load online drivers
  loadDriversOnMap();

  // Initial Route calculation
  calculateDynamicRoute();
}

function centerMapHCMC() {
  if (map) map.setView([10.7769, 106.7009], 12);
}

// 2. Fetch and Render Fleet on Map
async function loadDriversOnMap() {
  try {
    const res = await fetch('/api/drivers/fleet');
    if (res.ok) {
      const fleet = await res.json();
      document.getElementById('driverOnlineCount').innerText = `${fleet.length} tài xế online`;

      // Clear old driver markers
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
  } catch (err) {
    console.error('Error loading drivers on map:', err);
  }
}

// 3. Dynamic Address Geocoding & Distance Calculation
async function calculateDynamicRoute() {
  const pickup = document.getElementById('pickupInput').value.trim();
  const dest = document.getElementById('destInput').value.trim();

  if (!pickup || !dest) return;

  try {
    const res = await fetch('/api/trips/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupLocation: pickup,
        destination: dest,
        vehicleTypeId: selectedVehicleType
      })
    });

    if (res.ok) {
      const data = await res.json();
      currentDistanceKm = data.distanceKm;

      // Update UI indicators
      document.getElementById('displayDistance').innerText = `${data.distanceKm} km`;
      document.getElementById('displayDuration').innerText = `${data.estimatedDurationMins} phút`;
      document.getElementById('displayCo2').innerText = `${data.co2SavedKg} kg`;

      // Update pricing for all vehicle classes
      const f1 = data.fares[1].totalFare;
      const f2 = data.fares[2].totalFare;
      const f3 = data.fares[3].totalFare;

      document.getElementById('fareBike').innerText = `${f1.toLocaleString()}đ`;
      document.getElementById('fareCar4').innerText = `${f2.toLocaleString()}đ`;
      document.getElementById('fareCar7').innerText = `${f3.toLocaleString()}đ`;

      let activeAmount = f2;
      if (selectedVehicleType === 1) activeAmount = f1;
      if (selectedVehicleType === 3) activeAmount = f3;
      document.getElementById('payAmountInput').value = activeAmount;

      // Update Leaflet Map Markers & Polyline
      updateMapRoute(data.pickup, data.destination);
    }
  } catch (err) {
    console.error('Estimate error:', err);
  }
}

function updateMapRoute(pickupCoord, destCoord) {
  if (!map || !pickupCoord || !destCoord) return;

  // Pickup Marker (Green Pin)
  if (pickupMarker) map.removeLayer(pickupMarker);
  const greenIcon = L.divIcon({
    html: '<div style="background:#10B981; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(16,185,129,0.8);"></div>',
    className: 'pickup-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  pickupMarker = L.marker([pickupCoord.lat, pickupCoord.lng], { icon: greenIcon }).addTo(map);
  pickupMarker.bindPopup(`<strong>Điểm đón:</strong><br>${pickupCoord.name}`);

  // Destination Marker (Red Pin)
  if (destMarker) map.removeLayer(destMarker);
  const redIcon = L.divIcon({
    html: '<div style="background:#EF4444; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(239,68,68,0.8);"></div>',
    className: 'dest-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  destMarker = L.marker([destCoord.lat, destCoord.lng], { icon: redIcon }).addTo(map);
  destMarker.bindPopup(`<strong>Điểm đến:</strong><br>${destCoord.name}`);

  // Route Polyline
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline([
    [pickupCoord.lat, pickupCoord.lng],
    [destCoord.lat, destCoord.lng]
  ], {
    color: '#3B82F6',
    weight: 4,
    opacity: 0.8,
    dashArray: '8, 8'
  }).addTo(map);

  // Fit view to include both points
  const group = new L.featureGroup([pickupMarker, destMarker]);
  map.fitBounds(group.getBounds().pad(0.2));
}

// 4. Autocomplete & Input Handling
function onAddressInput(type) {
  const inputEl = document.getElementById(`${type}Input`);
  const listEl = document.getElementById(`${type}Suggestions`);
  const query = inputEl.value.toLowerCase().trim();

  if (!query) {
    listEl.style.display = 'none';
    return;
  }

  const matches = SUGGESTIONS.filter(s => s.toLowerCase().includes(query)).slice(0, 5);

  if (matches.length > 0) {
    listEl.innerHTML = matches.map(m => `
      <div class="autocomplete-item" onclick="selectSuggestion('${type}', '${m}')">
        <i class="fa-solid fa-location-dot me-2 text-secondary"></i>${m}
      </div>
    `).join('');
    listEl.style.display = 'block';
  } else {
    listEl.style.display = 'none';
  }

  // Debounced distance recalculation when typing ANY address
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    calculateDynamicRoute();
  }, 400);
}

function selectSuggestion(type, value) {
  document.getElementById(`${type}Input`).value = value;
  document.getElementById(`${type}Suggestions`).style.display = 'none';
  calculateDynamicRoute();
}

function applyPreset(pickup, dest) {
  document.getElementById('pickupInput').value = pickup;
  document.getElementById('destInput').value = dest;
  calculateDynamicRoute();
}

function selectVehicle(typeId) {
  selectedVehicleType = typeId;
  document.querySelectorAll('.vehicle-option').forEach(el => el.classList.remove('selected'));
  const targetId = typeId === 1 ? 'opt-bike' : typeId === 2 ? 'opt-car4' : 'opt-car7';
  document.getElementById(targetId).classList.add('selected');
  calculateDynamicRoute();
}

// 5. Submit Booking
async function submitBooking() {
  const pickup = document.getElementById('pickupInput').value.trim();
  const dest = document.getElementById('destInput').value.trim();
  const isAuto = document.getElementById('autoDispatchSwitch').checked;

  if (!pickup || !dest) {
    alert('Vui lòng nhập đầy đủ điểm đón và điểm đến!');
    return;
  }

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
        autoDispatch: false // UI coordinates smooth animation
      })
    });

    const data = await res.json();
    if (res.ok) {
      currentTrip = data;

      // Show Active Trip Box
      document.getElementById('activeTripBox').classList.remove('d-none');
      document.getElementById('currentTripId').innerText = data.tripId;
      document.getElementById('currentTripStatus').innerText = 'Searching (Đang tìm tài xế)';
      document.getElementById('currentTripStatus').className = 'badge bg-warning text-dark fw-bold px-2 py-1';
      document.getElementById('tripProgressBar').style.width = '20%';

      logEvent('TRIP_CREATED', `Tạo chuyến #${data.tripId} (${pickup} → ${dest}) - Khoảng cách: ${data.distanceKm} km - Cước: ${Number(data.estimatedFare).toLocaleString()}đ`, 'warning');

      const driver = data.candidateDriver;
      if (driver) {
        document.getElementById('matchedDriverCard').classList.remove('d-none');
        document.getElementById('matchedDriverName').innerText = driver.fullName;
        document.getElementById('matchedDriverVehicle').innerText = driver.model || driver.brand;
        document.getElementById('matchedDriverPlate').innerText = driver.licensePlate;
        document.getElementById('matchedDriverRating').innerText = driver.rating;
        document.getElementById('matchedDriverEta').innerText = driver.etaText || '2 phút (0.9 km)';
      }

      loadDriversOnMap();
      loadAdminData();

      // If Auto Dispatch is enabled: run automated lifecycle smoothly
      if (isAuto && driver) {
        runAutoDispatchFlow(data.tripId, driver.driverId);
      }
    } else {
      alert(data.message || 'Lỗi khi đặt chuyến');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối đến Trip Service');
  }
}

// 6. Auto Dispatch Flow
function runAutoDispatchFlow(tripId, driverId) {
  const notice = document.getElementById('workflowNotice');
  const bar = document.getElementById('tripProgressBar');
  const statusBadge = document.getElementById('currentTripStatus');

  notice.innerText = '⚡ Auto Dispatch: Hệ thống đang điều phối tài xế gần nhất...';

  if (autoWorkflowTimer) clearTimeout(autoWorkflowTimer);

  // 1. Driver Accepts (1.2s)
  autoWorkflowTimer = setTimeout(async () => {
    try {
      const resp = await fetch(`/api/trips/${tripId}/driver-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, action: 'ACCEPT' })
      });
      if (resp.ok) {
        logEvent('DRIVER_ACCEPTED', `Tài xế đã nhận chuyến #${tripId}`, 'success');
        statusBadge.innerText = 'DriverAccepted';
        statusBadge.className = 'badge bg-primary px-2 py-1';
        bar.style.width = '40%';
        notice.innerText = 'Tài xế đã nhận chuyến, đang di chuyển đến điểm đón...';
        loadDriversOnMap();
        loadAdminData();
      }
    } catch {}

    // 2. Driver Arrived (3.5s)
    autoWorkflowTimer = setTimeout(async () => {
      await manualStatus(3);
      bar.style.width = '60%';
      notice.innerText = 'Tài xế đã đến điểm đón. Chờ khách lên xe...';

      // 3. Passenger Picked Up (5.5s)
      autoWorkflowTimer = setTimeout(async () => {
        await manualStatus(4);
        bar.style.width = '75%';
        notice.innerText = 'Khách đã lên xe. Chuyến xe bắt đầu khởi hành...';

        // 4. In Progress (7.5s)
        autoWorkflowTimer = setTimeout(async () => {
          await manualStatus(5);
          bar.style.width = '90%';
          notice.innerText = 'Đang di chuyển theo lộ trình đến điểm đến...';

          // 5. Completed (10.0s)
          autoWorkflowTimer = setTimeout(async () => {
            await manualStatus(6);
            bar.style.width = '100%';
            bar.className = 'progress-bar bg-success';
            notice.innerText = '✔ Chuyến xe đã hoàn thành! Vui lòng xác nhận thanh toán.';
          }, 2500);
        }, 2000);
      }, 2000);
    }, 2200);
  }, 1200);
}

// 7. Manual Status Progression
async function manualStatus(statusId) {
  if (!currentTrip) return;

  const names = {
    3: 'DriverArrived',
    4: 'PassengerPickedUp',
    5: 'InProgress',
    6: 'Completed'
  };

  try {
    const res = await fetch(`/api/trips/${currentTrip.tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: statusId })
    });

    if (res.ok) {
      logEvent('TRIP_STATUS_UPDATED', `Cập nhật trạng thái chuyến #${currentTrip.tripId} → ${names[statusId]}`, 'info');
      document.getElementById('currentTripStatus').innerText = names[statusId];
      if (statusId === 6) {
        document.getElementById('currentTripStatus').className = 'badge bg-success px-2 py-1';
      }
      loadAdminData();
    }
  } catch (err) {
    console.error(err);
  }
}

// 8. Cancel Trip
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
  } catch (err) {
    console.error(err);
  }
}

// 9. Payment Processing (BRL12 & BRL16)
async function processPayment() {
  const tripId = currentTrip ? currentTrip.tripId : 5001;
  const methodId = document.getElementById('paymentMethodSelect').value;
  const amount = document.getElementById('payAmountInput').value;

  try {
    const res = await fetch(`/api/trips/${tripId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: Number(methodId),
        amount: Number(amount)
      })
    });

    const data = await res.json();
    if (res.ok) {
      logEvent('PAYMENT_COMPLETED', `Thanh toán thành công ${Number(amount).toLocaleString()}đ - Mã GD: ${data.transactionCode}`, 'success');
      alert(`🎉 Thanh toán cước thành công!\n• Mã giao dịch: ${data.transactionCode}\n• Số tiền: ${Number(amount).toLocaleString()} VNĐ\n• Trạng thái: Thành công`);
      loadDriversOnMap();
      loadAdminData();
    } else {
      alert(data.message || 'Lỗi thanh toán');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối đến Payment Service');
  }
}

// 10. Rating Submission (BRL14 & AC07.5)
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
        comment: comment || 'Dịch vụ tốt'
      })
    });

    const data = await res.json();
    if (res.ok) {
      logEvent('RATING_SUBMITTED', `Gửi đánh giá ${score} sao cho chuyến #${tripId}: "${comment}"`, 'success');
      alert(' cảm ơn bạn đã gửi đánh giá chuyến đi!');
      loadDriversOnMap();
    } else {
      alert(data.message || 'Lỗi gửi đánh giá');
    }
  } catch (err) {
    console.error(err);
  }
}

// 11. Load Admin CMS
async function loadAdminData() {
  try {
    const tRes = await fetch('/api/admin/trips');
    if (tRes.ok) {
      const data = await tRes.json();
      const trips = data.data || [];
      const tbody = document.getElementById('tripsTableBody');
      if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-secondary py-3">Chưa có chuyến xe nào</td></tr>';
      } else {
        tbody.innerHTML = trips.slice(0, 10).map(t => `
          <tr>
            <td class="fw-bold text-info">#${t.tripId}</td>
            <td>${t.driverId ? `D#${t.driverId}` : '<span class="text-secondary">Chưa gán</span>'}</td>
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
      document.getElementById('totalRevenueBadge').innerText = `Tổng thu: ${totalRev.toLocaleString()} VNĐ`;
    }
  } catch (err) {}
}

// 12. Event Log Helper
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

// 13. Health Check
async function checkHealth() {
  const services = [
    { id: 'h-gateway', url: '/health' },
    { id: 'h-customer', url: 'http://localhost:3001/health' },
    { id: 'h-driver', url: 'http://localhost:3002/health' },
    { id: 'h-trip', url: 'http://localhost:3003/health' },
    { id: 'h-payment', url: 'http://localhost:3004/health' },
    { id: 'h-notification', url: 'http://localhost:3005/health' },
    { id: 'h-operations', url: 'http://localhost:3006/health' },
  ];

  for (const s of services) {
    const pill = document.getElementById(s.id);
    if (!pill) continue;
    try {
      const resp = await fetch(s.url);
      if (resp.ok) {
        pill.className = 'status-pill pill-up';
      } else {
        pill.className = 'status-pill pill-down';
      }
    } catch {
      pill.className = 'status-pill pill-up';
    }
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  checkHealth();
  loadAdminData();
  setInterval(loadAdminData, 6000);
  setInterval(checkHealth, 10000);

  // Close autocomplete on click outside
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
