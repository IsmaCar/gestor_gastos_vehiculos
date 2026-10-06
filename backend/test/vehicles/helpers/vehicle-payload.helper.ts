
/**
 * Builds a valid vehicle creation payload.
 */
export const buildValidVehiclePayload = () => ({
  licenPlate: `plate_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
  brand: `Seat`,
  model: `leon`,
  kmAct: 340000,
});
