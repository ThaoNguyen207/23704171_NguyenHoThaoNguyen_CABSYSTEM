const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { initNotificationDb } = require('./db');
const { setupNotificationRoutes } = require('./routes');
const { sharedBus } = require('../../../shared/event-bus');

const logger = createLogger('NotificationService', 'magenta');
const PORT = process.env.PORT || 3005;

function startServer(isMemory = false, customPort = PORT) {
  const db = initNotificationDb(isMemory);
  const app = createApp();

  function saveNotification(tripId, recipientType, recipientId, type, message) {
    try {
      db.run(
        `INSERT INTO notifications (tripId, recipientType, recipientId, notificationType, message)
         VALUES (?, ?, ?, ?, ?)`,
        [tripId || null, recipientType, recipientId || null, type, message]
      );
      logger.info(`Notification queued for [${recipientType} #${recipientId}]: "${message}"`);
    } catch (err) {
      logger.error('Failed to save notification:', err.message);
    }
  }

  // Event bus listeners to auto-generate notifications per SRS FR37-FR42
  sharedBus.subscribe('CUSTOMER_REGISTERED', (data) => {
    saveNotification(null, 'CUSTOMER', data.customerId, 'SYSTEM', `Chào mừng ${data.fullName} đến với CAB System!`);
  });

  sharedBus.subscribe('TRIP_CREATED', (data) => {
    saveNotification(data.tripId, 'CUSTOMER', data.customerId, 'TRIP_UPDATE', `Yêu cầu đặt chuyến #${data.tripId} từ ${data.pickupLocation} đến ${data.destination} đang tìm tài xế.`);
    if (data.candidateDriver) {
      saveNotification(data.tripId, 'DRIVER', data.candidateDriver.driverId, 'TRIP_UPDATE', `Bạn có chuyến xe mới #${data.tripId} cần xác nhận! Điểm đón: ${data.pickupLocation}`);
    }
  });

  sharedBus.subscribe('DRIVER_ACCEPTED', (data) => {
    saveNotification(data.tripId, 'CUSTOMER', data.customerId, 'TRIP_UPDATE', `Tài xế #${data.driverId} đã nhận chuyến #${data.tripId} và đang di chuyển tới điểm đón.`);
  });

  sharedBus.subscribe('TRIP_STATUS_UPDATED', (data) => {
    const statusMsg = {
      DriverArrived: 'Tài xế đã đến điểm đón. Vui lòng chuẩn bị lên xe.',
      PassengerPickedUp: 'Chuyến xe đã bắt đầu.',
      InProgress: 'Đang trên hành trình tới điểm đến.'
    }[data.status];

    if (statusMsg) {
      saveNotification(data.tripId, 'CUSTOMER', data.customerId, 'TRIP_UPDATE', statusMsg);
    }
  });

  sharedBus.subscribe('TRIP_COMPLETED', (data) => {
    saveNotification(data.tripId, 'CUSTOMER', data.customerId, 'TRIP_UPDATE', `Chuyến xe của bạn đã hoàn thành. Cước phí: ${Number(data.fareAmount).toLocaleString()} VNĐ.`);
    saveNotification(data.tripId, 'DRIVER', data.driverId, 'TRIP_UPDATE', `Chuyến xe #${data.tripId} hoàn thành. Đang chờ khách hàng thanh toán.`);
  });

  sharedBus.subscribe('PAYMENT_COMPLETED', (data) => {
    saveNotification(data.tripId, 'CUSTOMER', data.customerId, 'PAYMENT', `Thanh toán thành công ${Number(data.amount).toLocaleString()} VNĐ qua mã giao dịch ${data.transactionCode}.`);
    if (data.driverId) {
      saveNotification(data.tripId, 'DRIVER', data.driverId, 'PAYMENT', `Bạn đã nhận được ${Number(data.amount).toLocaleString()} VNĐ từ chuyến xe #${data.tripId}.`);
    }
  });

  sharedBus.subscribe('TRIP_CANCELLED', (data) => {
    saveNotification(data.tripId, 'CUSTOMER', data.customerId, 'TRIP_UPDATE', `Chuyến xe #${data.tripId} đã được hủy.`);
    if (data.driverId) {
      saveNotification(data.tripId, 'DRIVER', data.driverId, 'TRIP_UPDATE', `Chuyến xe #${data.tripId} đã bị hủy.`);
    }
  });

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  setupNotificationRoutes(app, db);

  const server = app.listen(customPort, () => {
    logger.info(`Notification Service running on http://localhost:${customPort}`);
  });

  return { server, db, app };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
