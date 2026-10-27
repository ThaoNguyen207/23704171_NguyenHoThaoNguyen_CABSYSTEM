let currentTrip = null;
let selectedVehicleType = 2; // Default: Xanh SM Taxi
let fullFleet = [];
let autoPilotTimer = null;

// Preset routes in HCMC
const presetRoutes = {
  'Bitexco, Q.1': { lat: 10.7716, lng: 106.7044 },
  'Sân bay Tân Sơn Nhất, Tân Bình': { lat: 10.8184, lng: 106.6588 },
  'Chợ Bến Thành, Q.1': { lat: 10.7721, lng: 106.6983 },
  'Landmark 81, Bình Thạnh': { lat: 10.7951, lng: 106.7218 },
  'KTX Khu B ĐHQG, Thủ Đức': { lat: 10.8804, lng: 106.7820 },
  'Phố đi bộ Nguyễn Huệ, Q.1': { lat: 10.7743, lng: 106.7037 },
  'Crescent Mall, Q.7': { lat: 10.7294, lng: 106.7190 },
  'Vincom Đồng Khởi, Q.1': { lat: 10.7780, lng: 106.7020 }
};

function setPresetRoute(pickup, dest, distance) {
  document.getElementById('pickupInput').value = pickup;
  document.getElementById('destInput').value = dest;
  document.getElementById('distanceInput').value = distance;
  updateEstimatedFareUI();
}

function selectVehicleType(typeId) {
  selectedVehicleType = typeId;
  document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`vcard-${typeId}`);
  if (card) card.classList.add('active');
  updateEstimatedFareUI();
}

function updateEstimatedFareUI() {
  const dist = parseFloat(document.getElementById('distanceInput').value) || 5.0;

  // Type 1: Bike (12k base 2km, 5k/km)
  const bikeFare = Math.round(12000 + Math.max(0, dist - 2) * 5000);
  // Type 2: Taxi (20k base 2km, 12.5k/km)
  const taxiFare = Math.round(20000 + Math.max(0, dist - 2) * 12500);
  // Type 3: Luxury (30k base 2km, 18k/km)
  const luxFare = Math.round(30000 + Math.max(0, dist - 2) * 18000);

  document.getElementById('priceBike').innerText = bikeFare.toLocaleString();
  document.getElementById('priceTaxi').innerText = taxiFare.toLocaleString();
  document.getElementById('priceLuxury').innerText = luxFare.toLocaleString();

  let activeFare = taxiFare;
  if (selectedVehicleType === 1) activeFare = bikeFare;
  if (selectedVehicleType === 3) activeFare = luxFare;

  document.getElementById('payAmountInput').value = activeFare;

  // CO2 Saved
  const co2 = (dist * 0.16).toFixed(2);
  document.getElementById('co2Pill').innerHTML = `<i class="fa-solid fa-leaf"></i> Giảm phát thải: <strong>${co2} kg CO2</strong>`;
}

function logEvent(title, detail, type = 'info') {
  const box = document.getElementById('eventLogBox');
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
  document.getElementById('eventLogBox').innerHTML = '';
}

// Check Microservices Health
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

// Load Full VinFast Fleet (20+ drivers)
async function loadFleet() {
  try {
    const res = await fetch('/api/drivers/fleet');
    if (res.ok) {
      fullFleet = await res.json();
      renderFleet(fullFleet);
      document.getElementById('fleetCount').innerText = fullFleet.length;
    }
  } catch (err) {
    console.error('Error loading fleet:', err);
  }
}

function filterFleet(vtype) {
  if (vtype === 0) {
    renderFleet(fullFleet);
  } else {
    const filtered = fullFleet.filter(d => d.vehicleTypeId === vtype);
    renderFleet(filtered);
  }
}

function renderFleet(drivers) {
  const container = document.getElementById('fleetContainer');
  if (!drivers || drivers.length === 0) {
    container.innerHTML = '<div class="text-center py-3 text-secondary">Không có tài xế nào</div>';
    return;
  }

  container.innerHTML = drivers.map(d => {
    let badgeClass = 'badge-xanh-taxi';
    if (d.vehicleTypeId === 1) badgeClass = 'badge-xanh-bike';
    if (d.vehicleTypeId === 3) badgeClass = 'badge-xanh-luxury';

    const isReady = d.availabilityStatus === 'READY';

    return `
      <div class="fleet-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-bold text-light d-flex align-items-center gap-2">
            <span>${d.fullName}</span>
            <span class="badge ${badgeClass}" style="font-size: 10px;">${d.model || 'VinFast'}</span>
            <span class="badge-battery"><i class="fa-solid fa-battery-three-quarters me-1"></i>${d.batteryLevel || 90}%</span>
          </div>
          <div class="small text-secondary mt-1">
            <span class="text-info">${d.licensePlate}</span> • ${d.currentLocationName || 'Hồ Chí Minh'} • <span class="text-warning">★ ${d.rating}</span>
          </div>
        </div>
        <div>
          <span class="badge ${isReady ? 'bg-success' : 'bg-warning text-dark'}" style="font-size: 11px;">
            ${isReady ? 'SẴN SÀNG' : 'ĐANG CHẠY'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// Book Trip with Smart AI Dispatch
async function bookXanhTrip() {
  const pickup = document.getElementById('pickupInput').value.trim();
  const dest = document.getElementById('destInput').value.trim();
  const dist = parseFloat(document.getElementById('distanceInput').value) || 5.0;
  const isAutoPilot = document.getElementById('autoPilotSwitch').checked;

  if (!pickup || !dest) {
    alert('Vui lòng nhập điểm đón và điểm đến!');
    return;
  }

  const pickupCoords = presetRoutes[pickup] || { lat: 10.7716, lng: 106.7044 };

  try {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1,
        pickupLocation: pickup,
        destination: dest,
        vehicleTypeId: selectedVehicleType,
        distanceKm: dist,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        autoDispatch: false // we handle smooth animation in UI
      })
    });

    const data = await res.json();
    if (res.ok) {
      currentTrip = data;

      // Show Active Trip UI
      const tripBox = document.getElementById('activeTripBox');
      tripBox.classList.remove('d-none');
      document.getElementById('currentTripId').innerText = data.tripId;
      document.getElementById('currentTripStatus').innerText = 'Searching (Đang tìm xe)';
      document.getElementById('currentTripStatus').className = 'badge bg-warning text-dark fw-bold px-2 py-1';
      document.getElementById('tripProgressBar').style.width = '15%';

      logEvent('TRIP_CREATED', `Khách đặt chuyến #${data.tripId} (${pickup} → ${dest}) - Cước: ${Number(data.estimatedFare).toLocaleString()} VNĐ`, 'warning');

      const candidate = data.candidateDriver;
      if (candidate) {
        // Matched driver card
        document.getElementById('matchedDriverCard').classList.remove('d-none');
        document.getElementById('matchedDriverName').innerText = candidate.fullName;
        document.getElementById('matchedDriverModel').innerText = candidate.model || 'VinFast EV';
        document.getElementById('matchedDriverPlate').innerText = candidate.licensePlate;
        document.getElementById('matchedDriverRating').innerText = candidate.rating;
        document.getElementById('matchedDriverBattery').innerText = (candidate.batteryLevel || 90) + '%';
        document.getElementById('matchedDriverEta').innerText = candidate.etaText || '2 phút (0.8 km)';
      }

      loadFleet();
      loadAdminData();

      // If Auto-Pilot is enabled: run automated smooth transition simulation!
      if (isAutoPilot && candidate) {
        runAutoPilotWorkflow(data.tripId, candidate.driverId);
      }
    } else {
      alert(data.message || 'Lỗi khi đặt chuyến');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối đến Trip Service');
  }
}

// Auto-Pilot Workflow Simulation (Real Xanh SM Automation)
function runAutoPilotWorkflow(tripId, driverId) {
  const notice = document.getElementById('autoPilotNotice');
  const bar = document.getElementById('tripProgressBar');
  const statusBadge = document.getElementById('currentTripStatus');

  notice.innerText = '⚡ Auto-Pilot: Tài xế Xanh SM đang phản hồi nhận chuyến...';

  if (autoPilotTimer) clearTimeout(autoPilotTimer);

  // Step 1: Driver Accepts (1.2s)
  autoPilotTimer = setTimeout(async () => {
    try {
      const resp = await fetch(`/api/trips/${tripId}/driver-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, action: 'ACCEPT' })
      });
      if (resp.ok) {
        logEvent('DRIVER_ACCEPTED', `Tài xế đã NHẬN chuyến #${tripId}`, 'success');
        statusBadge.innerText = 'DriverAccepted';
        statusBadge.className = 'badge bg-primary px-2 py-1';
        bar.style.width = '35%';
        notice.innerText = '⚡ Auto-Pilot: Tài xế đang di chuyển tới điểm đón...';
        loadFleet();
        loadAdminData();
      }
    } catch {}

    // Step 2: Driver Arrived (3.0s)
    autoPilotTimer = setTimeout(async () => {
      await advanceTripStatus(3);
      bar.style.width = '55%';
      notice.innerText = '⚡ Auto-Pilot: Tài xế đã tới điểm đón. Đang đón khách...';

      // Step 3: Passenger Picked Up (5.0s)
      autoPilotTimer = setTimeout(async () => {
        await advanceTripStatus(4);
        bar.style.width = '75%';
        notice.innerText = '⚡ Auto-Pilot: Khách đã lên xe. Bắt đầu hành trình di chuyển...';

        // Step 4: In Progress (7.0s)
        autoPilotTimer = setTimeout(async () => {
          await advanceTripStatus(5);
          bar.style.width = '90%';
          notice.innerText = '⚡ Auto-Pilot: Đang trên đường tới điểm đến...';

          // Step 5: Completed (9.5s)
          autoPilotTimer = setTimeout(async () => {
            await advanceTripStatus(6);
            bar.style.width = '100%';
            bar.className = 'progress-bar bg-success';
            notice.innerText = '✔ Auto-Pilot: Chuyến xe hoàn thành! Vui lòng xác nhận thanh toán.';
          }, 2500);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 1200);
}

// Advance Status
async function advanceTripStatus(statusId) {
  if (!currentTrip) return;

  const names = {
    3: 'DriverArrived (Đã đến)',
    4: 'PassengerPickedUp (Đã đón khách)',
    5: 'InProgress (Đang di chuyển)',
    6: 'Completed (Hoàn thành)'
  };

  try {
    const res = await fetch(`/api/trips/${currentTrip.tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: statusId })
    });

    if (res.ok) {
      logEvent('TRIP_STATUS_UPDATED', `Chuyển trạng thái #${currentTrip.tripId} → ${names[statusId]}`, 'info');
      document.getElementById('currentTripStatus').innerText = names[statusId];
      loadAdminData();
    }
  } catch (err) {
    console.error(err);
  }
}

// Cancel Trip
async function cancelTrip() {
  if (!currentTrip) return;
  if (!confirm('Bạn có chắc muốn hủy chuyến này?')) return;

  try {
    const res = await fetch(`/api/trips/${currentTrip.tripId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelledBy: 'CUSTOMER', reason: 'Thay đổi kế hoạch' })
    });
    if (res.ok) {
      if (autoPilotTimer) clearTimeout(autoPilotTimer);
      logEvent('TRIP_CANCELLED', `Chuyến #${currentTrip.tripId} đã bị hủy`, 'error');
      document.getElementById('currentTripStatus').innerText = 'Cancelled (Đã hủy)';
      document.getElementById('currentTripStatus').className = 'badge bg-danger px-2 py-1';
      document.getElementById('tripProgressBar').style.width = '100%';
      document.getElementById('tripProgressBar').className = 'progress-bar bg-danger';
      loadFleet();
      loadAdminData();
    }
  } catch (err) {
    console.error(err);
  }
}

// Process Payment
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
      logEvent('PAYMENT_COMPLETED', `Thanh toán thành công ${Number(amount).toLocaleString()} VNĐ qua mã GD ${data.transactionCode}`, 'success');
      alert(`🎉 Thanh toán Xanh SM thành công!\nMã giao dịch: ${data.transactionCode}\nSố tiền: ${Number(amount).toLocaleString()} VNĐ`);
      loadFleet();
      loadAdminData();
    } else {
      alert(data.message || 'Lỗi thanh toán');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối đến Payment Service');
  }
}

// Submit Rating
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
        comment: comment || 'Dịch vụ xe điện rất tốt'
      })
    });

    const data = await res.json();
    if (res.ok) {
      logEvent('RATING_SUBMITTED', `Đã đánh giá chuyến #${tripId}: ${score} sao - "${comment}"`, 'success');
      alert(' cảm ơn bạn đã đồng hành và đánh giá dịch vụ xe điện Xanh SM!');
      loadFleet();
    } else {
      alert(data.message || 'Lỗi khi gửi đánh giá');
    }
  } catch (err) {
    console.error(err);
  }
}

// Load Admin CMS
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

// On Page Load
window.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  updateEstimatedFareUI();
  loadFleet();
  loadAdminData();
  setInterval(loadAdminData, 6000);
  setInterval(checkHealth, 10000);
});
