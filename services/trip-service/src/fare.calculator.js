// Fare calculation logic per vehicle type and distance
// Base rates according to market standards in VN:
// Type 1 (Motorbike): Base 15,000 VND (first 2km), 6,000 VND / km after
// Type 2 (Car 4-seat): Base 25,000 VND (first 2km), 11,000 VND / km after
// Type 3 (Car 7-seat): Base 32,000 VND (first 2km), 14,000 VND / km after

function calculateFare(vehicleTypeId, distanceKm = 5.0) {
  let baseFare = 20000;
  let perKmRate = 10000;

  switch (Number(vehicleTypeId)) {
    case 1: // Motorbike
      baseFare = 15000;
      perKmRate = 6000;
      break;
    case 2: // Car 4-seat
      baseFare = 25000;
      perKmRate = 11000;
      break;
    case 3: // Car 7-seat
      baseFare = 32000;
      perKmRate = 14000;
      break;
  }

  const extraDistance = Math.max(0, distanceKm - 2);
  const totalFare = Math.round(baseFare + (extraDistance * perKmRate));

  return {
    vehicleTypeId,
    baseFare,
    distanceKm,
    perKmRate,
    totalFare
  };
}

module.exports = { calculateFare };
