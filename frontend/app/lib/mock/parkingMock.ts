export const PARKING_MOCK: Record<string, any[]> = {
  "Sikhio-Outbound": Array.from({ length: 20 }, (_, i) => ({
    deviceId: "Sikhio-Outbound:parking-001",
    capacity: 50,
    available: Math.floor(Math.random() * 50),
    timestamp: new Date(Date.now() - i * 5 * 60000).toISOString().replace("T", " ").slice(0, 19),
  })),
  "Sikhio-Inbound": Array.from({ length: 20 }, (_, i) => ({
    deviceId: "Sikhio-Inbound:parking-002",
    capacity: 40,
    available: Math.floor(Math.random() * 40),
    timestamp: new Date(Date.now() - i * 5 * 60000).toISOString().replace("T", " ").slice(0, 19),
  })),
  "bangkok_01": Array.from({ length: 20 }, (_, i) => ({
    deviceId: "bangkok_01:parking-003",
    capacity: 100,
    available: Math.floor(Math.random() * 100),
    timestamp: new Date(Date.now() - i * 5 * 60000).toISOString().replace("T", " ").slice(0, 19),
  })),
  "Rest Area KM 120": Array.from({ length: 20 }, (_, i) => ({
    deviceId: "Rest Area KM 120:parking-004",
    capacity: 60,
    available: Math.floor(Math.random() * 60),
    timestamp: new Date(Date.now() - i * 5 * 60000).toISOString().replace("T", " ").slice(0, 19),
  })),
}