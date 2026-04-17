import { apiClient } from "@/app/lib/apiClient"

export const getUsers = () => apiClient("/users")

export const createUser = (data: any) =>
  apiClient("/users", {
    method: "POST",
    body: JSON.stringify(data)
  })

export const updateUser = (id: string, data: any) =>
  apiClient(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })

export const deleteUser = (id: string) =>
  apiClient(`/users/${id}`, {
    method: "DELETE"
  })