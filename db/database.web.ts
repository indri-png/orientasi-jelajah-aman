// src/db/database.web.ts
// Stub database untuk platform web agar Metro tidak memuat worker expo-sqlite di browser
export function ambilDatabase(): Promise<any> {
  return Promise.resolve({
    runAsync: async () => {},
    getFirstAsync: async () => null,
    getAllAsync: async () => [],
    execAsync: async () => {},
  });
}
