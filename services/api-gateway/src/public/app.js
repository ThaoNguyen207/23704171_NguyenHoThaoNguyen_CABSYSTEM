let currentTrip = null;
let activeDriverStatus = 'READY';

// Append log to Event Stream box
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

// Check health of microservices
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
      // If direct cross-origin blocked, proxy through gateway
      pill.className = 'status-pill pill-up';
    }
  }
}

// 1. Customer Book Trip
async function bookTrip() {
  const pickup = document.getElementById('pickupInput').value.trim();
  const dest = document.getElementById('destInput').value.trim();
  const vehicleTypeId = document.getElementById('vehicleTypeSelect').value;
  const distanceKm = document.getElementById('distanceInput').value;

  if (!pickup || !dest) {
    alert('Vui lòng nhập điểm đón và điểm đến!');
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
        vehicleTypeId: Number(vehicleTypeId),
        distanceKm: Number(distanceKm)
      })
    });

    const data = await res.json();
    if (res.ok) {
      currentTrip = data;
      document.getElementById('activeTripBox').classList.remove('d-none');
      document.getElementById('currentTripId').innerText = data.tripId;
      document.getElementById('currentTripStatus').innerText = data.status;
      document.getElementById('currentTripFare').innerText = Number(data.estimatedFare).toLocaleString();
      document.getElementById('payAmountInput').value = data.estimatedFare;

      logEvent('TRIP_CREATED', `Khách đặt chuyến #${data.tripId} (${pickup} → ${dest}) - Cước: ${Number(data.estimatedFare).toLocaleString()} VNĐ`, 'warning');

      // Show incoming trip notice to driver
      document.getElementById('driverIncomingTripNotice').innerHTML = `
        <span class="text-warning fw-bold">Chuyến mới #${data.tripId}:</span> ${pickup} → ${dest} (Cước: ${Number(data.estimatedFare).toLocaleString()}đ)
      `;
      document.getElementById('driverActionButtons').classList.remove('d-none');

      loadAdminData();
    } else {
      alert(data.message || 'Lỗi khi đặt chuyến');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối đến Trip Service');
  }
}

// 2. Driver Response (Accept / Reject)
async function driverResponse(action) {
  if (!currentTrip) {
    alert('Chưa có chuyến xe nào để phản hồi!');
    return;
  }

  try {
    const res = await fetch(`/api/trips/${currentTrip.tripId}/driver-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: 88,
        action: action,
        rejectReason: action === 'REJECT' ? 'Tài xế đang bận sửa xe' : undefined
      })
    });

    const data = await res.json();
    if (res.ok) {
      if (action === 'ACCEPT') {
        logEvent('DRIVER_ACCEPTED', `Tài xế #88 đã CHẤP NHẬN chuyến #${currentTrip.tripId}`, 'success');
        document.getElementById('currentTripStatus').innerText = 'DriverAccepted';
        document.getElementById('currentTripStatus').className = 'badge badge-trip-accepted';
        document.getElementById('driverIncomingTripNotice').innerText = `Đã nhận chuyến #${currentTrip.tripId}. Hãy di chuyển đến điểm đón!`;
        document.getElementById('driverActionButtons').classList.add('d-none');
      } else {
        logEvent('DRIVER_REJECTED', `Tài xế #88 đã TỪ CHỐI chuyến #${currentTrip.tripId}`, 'error');
        document.getElementById('driverIncomingTripNotice').innerText = 'Đã từ chối chuyến. Đang chờ chuyến tiếp theo...';
        document.getElementById('driverActionButtons').classList.add('d-none');
      }
      loadAdminData();
    } else {
      alert(data.message || 'Lỗi xử lý phản hồi tài xế');
    }
  } catch (err) {
    console.error(err);
    alert('Lỗi kết nối');
  }
}

// Advance Trip Status
async function advanceTripStatus(statusId) {
  if (!currentTrip) {
    alert('Vui lòng đặt chuyến trước!');
    return;
  }

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

    const data = await res.json();
    if (res.ok) {
      logEvent('TRIP_STATUS_UPDATED', `Chuyển trạng thái chuyến #${currentTrip.tripId} → ${names[statusId]}`, 'info');
      document.getElementById('currentTripStatus').innerText = names[statusId];

      if (statusId === 6) {
        document.getElementById('currentTripStatus').className = 'badge badge-trip-completed';
        document.getElementById('driverIncomingTripNotice').innerText = `Chuyến #${currentTrip.tripId} đã hoàn tất. Đang chờ khách thanh toán.`;
      } else {
        document.getElementById('currentTripStatus').className = 'badge badge-trip-progress';
      }

      loadAdminData();
    } else {
      alert(data.message || 'Lỗi khi cập nhật trạng thái');
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
      body: JSON.stringify({ cancelledBy: 'CUSTOMER', reason: 'Thay đổi lịch trình' })
    });
    if (res.ok) {
      logEvent('TRIP_CANCELLED', `Chuyến #${currentTrip.tripId} đã bị hủy`, 'error');
      document.getElementById('currentTripStatus').innerText = 'Cancelled';
      document.getElementById('currentTripStatus').className = 'badge badge-trip-cancelled';
      loadAdminData();
    }
  } catch (err) {
    console.error(err);
  }
}

// Toggle Driver Availability Status
async function toggleDriverStatus() {
  const newStatus = activeDriverStatus === 'READY' ? 'OFFLINE' : 'READY';
  try {
    const res = await fetch('/api/drivers/88/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: newStatus })
    });

    if (res.ok) {
      activeDriverStatus = newStatus;
      const btn = document.getElementById('btnToggleDriverStatus');
      btn.innerText = newStatus;
      btn.className = newStatus === 'READY' ? 'btn btn-sm btn-success' : 'btn btn-sm btn-secondary';
      logEvent('DRIVER_STATUS_CHANGED', `Tài xế #88 đổi trạng thái → ${newStatus}`, newStatus === 'READY' ? 'success' : 'warning');
    }
  } catch (err) {
    console.error(err);
  }
}

// 3. Process Payment
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
      alert(`Thanh toán thành công!\nMã giao dịch: ${data.transactionCode}\nSố tiền: ${Number(amount).toLocaleString()} VNĐ`);
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
        comment: comment || 'Dịch vụ tốt'
      })
    });

    const data = await res.json();
    if (res.ok) {
      logEvent('RATING_SUBMITTED', `Đã đánh giá chuyến #${tripId}: ${score} sao - "${comment || 'Tốt'}"`, 'success');
      alert(data.message || 'Đã gửi đánh giá thành công!');
    } else {
      alert(data.message || 'Lỗi khi gửi đánh giá');
    }
  } catch (err) {
    console.error(err);
  }
}

// Load Admin CMS data
async function loadAdminData() {
  try {
    // Trips
    const tRes = await fetch('/api/admin/trips');
    if (tRes.ok) {
      const data = await tRes.json();
      const trips = data.data || [];
      const tbody = document.getElementById('tripsTableBody');
      if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-3">Chưa có chuyến xe nào</td></tr>';
      } else {
        tbody.innerHTML = trips.map(t => `
          <tr>
            <td class="fw-bold text-info">#${t.tripId}</td>
            <td>C#${t.customerId}</td>
            <td>${t.driverId ? `D#${t.driverId}` : '<span class="text-secondary">Chưa gán</span>'}</td>
            <td class="text-warning">${Number(t.fareAmount || 0).toLocaleString()}đ</td>
            <td><span class="badge ${t.status === 'Completed' ? 'badge-trip-completed' : t.status === 'Searching' ? 'badge-trip-searching' : 'badge-trip-progress'}">${t.status}</span></td>
          </tr>
        `).join('');
      }
    }

    // Transactions
    const txRes = await fetch('/api/admin/transactions');
    if (txRes.ok) {
      const txs = await txRes.json();
      const tbody = document.getElementById('transactionsTableBody');
      let totalRev = 0;
      if (!Array.isArray(txs) || txs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-secondary py-3">Chưa có giao dịch</td></tr>';
      } else {
        tbody.innerHTML = txs.map(tx => {
          totalRev += (tx.amount || 0);
          return `
            <tr>
              <td class="small text-secondary">${tx.transactionCode || tx.transactionId}</td>
              <td class="text-info">#${tx.tripId}</td>
              <td class="text-success fw-bold">${Number(tx.amount || 0).toLocaleString()}đ</td>
              <td><span class="badge bg-success">${tx.status || 'Success'}</span></td>
            </tr>
          `;
        }).join('');
      }
      document.getElementById('totalRevenueBadge').innerText = `Tổng thu: ${totalRev.toLocaleString()} VNĐ`;
    }
  } catch (err) {
    console.error('Error loading admin data:', err);
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  loadAdminData();
  setInterval(loadAdminData, 5000);
  setInterval(checkHealth, 10000);
});
