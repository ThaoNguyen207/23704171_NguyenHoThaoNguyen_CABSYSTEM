// Dynamic Fare Calculator for CAB SYSTEM
// Strictly calculates fares based on vehicle class and actual road distance

function calculateFare(vehicleTypeId, distanceKm = 5.0) {
  const dist = Math.max(1.0, Number(distanceKm) || 5.0);
  const typeId = Number(vehicleTypeId) || 2;

  let baseFare = 20000; // First 2.0 km
  let perKmRate = 12000;
  let typeName = 'Cab Car 4-Chỗ';
  let description = 'Ô tô 4 chỗ tiêu chuẩn';

  switch (typeId) {
    case 1:
      baseFare = 12000;
      perKmRate = 5000;
      typeName = 'Cab Bike';
      description = 'Xe 2 bánh công nghệ (Nhanh & Tiết kiệm)';
      break;
    case 2:
      baseFare = 20000;
      perKmRate = 12000;
      typeName = 'Cab Car 4-Chỗ';
      description = 'Ô tô 4 chỗ tiêu chuẩn (Êm ái, mát mẻ)';
      break;
    case 3:
      baseFare = 28000;
      perKmRate = 16000;
      typeName = 'Cab Car 7-Chỗ';
      description = 'Ô tô 7 chỗ rộng rãi (Gia đình & Hành lý lớn)';
      break;
  }

  // Business formula: base fare covers first 2.0 km
  const billableExtraKm = Math.max(0, dist - 2.0);
  const totalFare = Math.round(baseFare + (billableExtraKm * perKmRate));

  // Environmental emission reduction metric
  const co2SavedKg = Number((dist * 0.14).toFixed(2));

  // Estimated driving duration in city traffic (~2.5 minutes per km + 3 mins buffer)
  const estimatedDurationMins = Math.max(3, Math.round(dist * 2.4 + 2));

  return {
    vehicleTypeId: typeId,
    typeName,
    description,
    baseFare,
    perKmRate,
    distanceKm: Number(dist.toFixed(1)),
    totalFare,
    estimatedDurationMins,
    co2SavedKg
  };
}

module.exports = { calculateFare };
