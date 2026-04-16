const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export const getUsers = async () => {
  const token = localStorage.getItem("token")
  
  const res = await fetch(API_URL , {
  headers: {
    Authorization: `Bearer ${token}`
  }})

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
};

export const createUser = async (data: any) => {
  const token = localStorage.getItem("token")

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) throw new Error("Failed to add user")

  return res.json()
}

export const updateUser = async (id: string, data: any) => {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Update failed");
  }

  return res.json();
};

export const deleteUser = async (id: string) => {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers:{
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  
  if (!res.ok){
    throw new Error("Delete failed");
  }
  return data;
}