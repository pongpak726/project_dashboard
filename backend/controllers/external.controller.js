exports.getExternal = async (req, res, next) => {
  try {
    const response = await fetch(process.env.EXTERNAL_API, {
      headers: {
        Authorization: `Bearer ${process.env.SECRET_API}`,
        "Content-Type": "application/json"
      },
    })

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`)
    }

    const data = await response.json()

    res.json(data)
  } catch (err) {
    next(err)
  }
}