// `npm run export` builds with --mode export to hide dev tooling (works on Windows and macOS).
export const INCLUDE_TESTS = import.meta.env.MODE !== "export";
