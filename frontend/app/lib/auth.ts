export const decodeToken = (token: string) => {
  try {
    if (!token || token.split(".").length !== 3) return null

    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")

    const payload = JSON.parse(atob(base64))

    // 🔥 check expire
    if (payload.exp * 1000 < Date.now()) return null

    return payload
  } catch {
    return null
  }
}

export const getUser = () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  const payload = decodeToken(token)
  if (!payload) {
    localStorage.removeItem("token")
    return null
  }

  return payload
}