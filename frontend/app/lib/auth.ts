export const decodeToken = (token: string) => {
  try {
    if (!token || token.split(".").length !== 3) {
      return null
    }

    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    
    return JSON.parse(atob(base64))
  } catch (err) {
    return null
  }
}