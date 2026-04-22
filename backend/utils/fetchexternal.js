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

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SECRET_API}`
    }
  })

  if (!response.ok) {
    throw new Error(`External API error: ${response.status}`)
  }

  return response.json()
}

module.exports = fetchExternal
