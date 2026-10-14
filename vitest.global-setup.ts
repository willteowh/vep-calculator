// Dates in tests are local; pin Singapore time so results don't depend on the developer's machine.
export function setup() {
  process.env.TZ = "Asia/Singapore";
}
