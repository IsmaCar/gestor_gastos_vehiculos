
/**
 * Builds a valid vehicle creation payload.
 *
 * `licenPlate` is unique per call (timestamp + random suffix) so parallel
 * tests don't clash, and its `plate_` prefix lets `cleanupTestVehicles`
 * identify and remove it afterwards.
 */
export const buildValidVehiclePayload = () => ({
  licenPlate: `plate_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
  brand: `Seat`,
  model: `leon`,
  kmAct: 340000,
  type: 'coche',
});
