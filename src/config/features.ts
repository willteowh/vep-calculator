// The exported (production) build sets VITE_INCLUDE_TESTS=false to hide dev tooling.
export const INCLUDE_TESTS = import.meta.env.VITE_INCLUDE_TESTS !== "false";
