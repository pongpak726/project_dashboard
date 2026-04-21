"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../lib/services/user";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { getUser } from "@/app/lib/auth";
import { getRoleBadge, getStatusBadge } from "@/app/lib/badge";

export default function UsersPage() {
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
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [isActive, setIsActive] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  useEffect(() => { setCurrentUser(getUser()) }, []);
  useEffect(() => { loadUsers() }, []);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setIsOpen(true);
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      if (err.message === "Forbidden") router.push("/dashboard");
      else alert("Failed to load users");
    }
  };

  const handleAddUser = async () => {
    if (!email || !password) return alert("Email and password required");
    try {
      await createUser({ email, name, password, role, isActive });
      setEmail(""); setName(""); setPassword(""); setRole("USER"); setIsActive(true);
      await loadUsers();
      await Swal.fire({ title: "User created!", icon: "success", timer: 1200, showConfirmButton: false });
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const updated = await updateUser(selectedUser.id, { email: editEmail, name: editName, role: editRole, isActive: editIsActive });
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      await Swal.fire({ title: "Updated!", icon: "success", timer: 1200, showConfirmButton: false, backdrop: false });
      setIsOpen(false); setSelectedUser(null);
    } catch { Swal.fire({ title: "Error", text: "Update failed", icon: "error" }); }
  };

  const handleDeleteUser = async (id: string) => {
    const result = await Swal.fire({ title: "Delete user?", text: "This action cannot be undone", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#ef4444", backdrop: false });
    if (!result.isConfirmed) return;
    setLoadingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await Swal.fire({ title: "Deleted!", icon: "success", timer: 1200, showConfirmButton: false, backdrop: false });
      loadUsers();
    } catch { Swal.fire({ title: "Error", text: "Delete failed", icon: "error" }); }
    finally { setLoadingId(null); }
  };

  const inputClass = "w-full bg-white border border-[#334155] text-black placeholder:text-gray-500 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors";
  const selectClass = "w-full bg-white border border-[#334155] text-black p-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200
          ${checked ? "bg-blue-600" : "bg-gray-600"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
          ${checked ? "left-6" : "left-1"}`}
        />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  )
}

  return (
    <>
      <div className="bg-gray-100 min-h-screen p-6 text-white">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">User Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage system users and permissions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            {/* ===== Add User ===== */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-[#334155] p-5 space-y-4">
                <h2 className="text-lg font-semibold text-black border-b border-[#334155] pb-3">
                  Add User
                </h2>

                <input className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={inputClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

                {(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
                  <>
                    <select className={selectClass} value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      {currentUser?.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                    </select>
                    <Toggle checked={isActive} onChange={setIsActive} label="Active" />
                  </>
                )}

                <button onClick={handleAddUser} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                  Add User
                </button>
              </div>
            </div>

            {/* ===== User List ===== */}
            <div className="lg:col-span-3">
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
                <h2 className="text-lg font-semibold text-white border-b border-[#334155] pb-3 mb-4">
                  User List
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{users.length}</span>
                </h2>

                {users.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No users found</p>
                )}

                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 flex justify-between items-center hover:border-blue-500 transition-colors">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-white">{user.email}</p>
                        <p className="text-sm text-gray-400">{user.name}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadge(user.role)}`}>{user.role}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadge(user.isActive)}`}>{user.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(user)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium rounded-lg transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} disabled={loadingId === user.id} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                          {loadingId === user.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== Modal ===== */}
      {isOpen && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"} bg-black/60`}>
          <div className={`bg-[#1e293b] border border-[#334155] text-white p-6 rounded-xl shadow-2xl w-96 space-y-4 transition-all duration-200 ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}>

            <h2 className="text-xl font-bold border-b border-[#334155] pb-3">Edit User</h2>

            <input className={inputClass} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
            <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />

            {(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
              <>
                <select className={selectClass} value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  {currentUser?.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                </select>
                <Toggle checked={isActive} onChange={setIsActive} label="Active" />
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsClosing(true); setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 200); }}
                className="px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}