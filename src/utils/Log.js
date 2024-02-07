export const LogError = (path, error) => console.log(`❌  [${path}] 👉`, error);
export const LogSuccess = (path, message) =>
  console.log(`✅  [${path}] 👉`, message);
export const LogInfo = (path, message) =>
  console.log(`▶️  [${path}] 👉`, message);
export const LogWarning = (path, message) =>
  console.log(`⚠️  [${path}] 👉`, message);
