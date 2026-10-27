// Fare & Green Impact calculation logic for Xanh SM (VinFast EV Fleet)
// Rates:
// Type 1: Xanh SM Bike (VinFast Feliz S / Evo 200): Base 12,000 VND (2km), 5,000 VND/km
// Type 2: Xanh SM Taxi (VinFast VF 5 / VF e34): Base 20,000 VND (2km), 12,500 VND/km
// Type 3: Xanh SM Luxury (VinFast VF 8 / VF 9): Base 30,000 VND (2km), 18,000 VND/km

function calculateFare(vehicleTypeId, distanceKm = 5.0) {
  let baseFare = 20000;
  let perKmRate = 12500;
  let typeName = 'Xanh SM Taxi';

  switch (Number(vehicleTypeId)) {
    case 1:
      baseFare = 12000;
      perKmRate = 5000;
      typeName = 'Xanh SM Bike';
      break;
    case 2:
      baseFare = 20000;
      perKmRate = 12500;
      typeName = 'Xanh SM Taxi';
      break;
    case 3:
      baseFare = 30000;
      perKmRate = 18000;
      typeName = 'Xanh SM Luxury';
      break;
  }

  const extraDistance = Math.max(0, distanceKm - 2);
  const totalFare = Math.round(baseFare + (extraDistance * perKmRate));

  // Environmental impact: Average gas car emits ~160g CO2/km
  const co2SavedKg = Number((distanceKm * 0.16).toFixed(2));

  return {
    vehicleTypeId,
    typeName,
    baseFare,
    distanceKm,
    perKmRate,
    totalFare,
    co2SavedKg
  };
}

module.exports = { calculateFare };
