"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../lib/services/user";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { getUser } from "@/app/lib/auth";
import { getRoleBadge,getStatusBadge } from "@/app/lib/badge";

export default function UsersPage() {
  // ====Declare====
  type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("")//==create==
  const [role, setRole] = useState("USER")
  const [isActive, setIsActive] = useState(true)
  const [editPassword, setEditPassword] = useState("")//==update==
  
  

  //====Role Check====
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
  setCurrentUser(getUser())
}, [])
 
//==== modal ===== 
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setIsOpen(true);
  };
// ========



// ====Edit User====
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const payload: any = {
        email: editEmail,
        name: editName,
        role: editRole,
        isActive: editIsActive
      };


      if (editPassword) {
        payload.password = editPassword;
      }

      const updated = await updateUser(selectedUser.id, payload);

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updated : u))
      );
      // ====sweet alert success======
      await Swal.fire({
        title: "Updated!",
        text: "User has been updated.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        backdrop: false,
      });
      // ========

      setIsOpen(false);
      setSelectedUser(null);
      
      
    } catch (error) {
      console.error(error);

      // ====sweet alert Error======
      Swal.fire({
        title: "Error",
        text: "Update failed",
        icon: "error",
      });
    // ========
    }
  };
// ========

const router = useRouter()
  
// ====Get User====
  const loadUsers = async () => {
    
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err: any) {
      console.error(err)

      //====handle auth error====
      if (err.message === "Forbidden") {
        router.push("/dashboard")
      } else {
        alert("Failed to load users")
      }
    }
  }


  // ====Add User====
  const handleAddUser = async () => {
      if (!email || !password ) return alert("Email and password required");

      try{
      await createUser({ email,name,password,role,isActive});

      setEmail("");
      setName("");
      setPassword("")
      setRole("USER")
      setIsActive(true)

      await loadUsers();

      await Swal.fire({
        title: "User created!",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      })
    } catch (err:any){
      alert(err.message)
    }
  }
  // ========

  // ====Delete User====
  const handleDeleteUser = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete user?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      backdrop: false,
    });

    if (!result.isConfirmed) return;

    setLoadingId(id);

    try {
      await deleteUser(id);

      setUsers((prev) => prev.filter((user) => user.id !== id));

      await Swal.fire({
        title: "Deleted!",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        backdrop: false,
      });

      loadUsers()

    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error",
        text: "Delete failed",
        icon: "error",
      });

    } finally {
      setLoadingId(null);
    }
  };
  // ========
    
  useEffect(() => {
    loadUsers()
  }, [])


  return (
    <>
    <div className="bg-gray-100 p-6 text-black min-h-full">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Add User</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
            <>
              <select
                className="w-full border p-2 rounded"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                {currentUser?.role === "SUPER_ADMIN" && (
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                )}
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
            </>
          )}

          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white py-2 rounded w-full"
          >
            Add User
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">User List</h1>

        {users.length === 0 && <p>No users</p>}

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div className="flex flex-col">
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-500">{user.name}</p>

                <div className="flex gap-2 mt-2">
                  {/* ROLE */}
                  <span
                    className={`px-2 py-1 text-xs rounded ${getRoleBadge(user.role)}`}
                  >
                    {user.role}
                  </span>

                  {/* STATUS */}
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusBadge(user.isActive)}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={()=>openEditModal(user)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded h-10">
                  Edit
                </button>
                <button 
                onClick={() => handleDeleteUser(user.id)}
                disabled={loadingId === user.id}
                className="bg-red-500 text-white py-2 px-4 rounded h-10">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  
          {/* ==================Modal session==================== */}
  {isOpen && (
  <div className={`fixed inset-0 flex items-center justify-center z-50 text-black
    transition-opacity duration-200
    ${isClosing ? "opacity-0" : "opacity-100"}
    bg-black/40`}
  >
    <div className={`bg-white p-6 rounded-lg shadow-lg w-96 space-y-4
    transition-all duration-200 ease-out
    ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
  `}>
      
      <h2 className="text-xl font-bold">Edit User</h2>

      <input
        className="w-full border p-2 rounded"
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        className="w-full border p-2 rounded"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Name"
      />

      {(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
        <>
          <select
            className="w-full border p-2 rounded"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            {currentUser?.role === "SUPER_ADMIN" && (
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            )}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
            />
            Active
          </label>
        </>
      )}

      <div className="flex justify-end gap-2">

        
        <button
          onClick={() => {
            setIsClosing(true);

            setTimeout(() => {
              setIsOpen(false);
              setIsClosing(false);
            }, 200); 
          }}
          className="px-4 py-2 bg-gray-300 rounded text-white transition-all duration-200 ease-out"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateUser}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}
</>
);
}