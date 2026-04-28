import { apiClient } from "../apiClient"

// vms.ts — เพิ่ม log ชั่วคราว
export const getVMSList = async (site?: string) => {
  const res = await apiClient(`/vms/latesvms${site ? `?site=${encodeURIComponent(site)}` : ""}`)
  console.log("VMS RES:", res)  // ดูว่า structure เป็นอะไร
  return res
}

export const getVMSLogs = (id: string, limit = 50) =>
  apiClient(`/vms/logs?id=${encodeURIComponent(id)}&limit=${limit}`)