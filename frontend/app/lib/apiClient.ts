export const apiClient = async (url: string) => {
    const token = localStorage.getItem("token")
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

    const res = await fetch(`${API_URL} + url`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return res.json()
}