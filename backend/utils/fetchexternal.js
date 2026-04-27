// helper
const buildUrl = (path, params = {}) => {
  if (!process.env.EXTERNAL_API) {
    throw new Error("EXTERNAL_API is not defined")
  }

  const url = new URL(`${process.env.EXTERNAL_API}/${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v))
      } else {
        url.searchParams.append(key, value)
      }
    }
  })

  return url.toString()
}

const fetchExternal = async (path, params) => {
  const url = buildUrl(path, params)

  // ✅ timeout 10 วินาที
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.SECRET_API}` },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`)
    }

    return response.json()
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("External API timeout")  // ✅ error message ชัดเจน
    }
    throw err
  } finally {
    clearTimeout(timer)  // ✅ clear timer เสมอ
  }
}

module.exports = fetchExternal
