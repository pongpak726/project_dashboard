export const getRoleBadge = (role: string) => {
    switch(role) {
        case "SUPER_ADMIN":
            return "bg-red-500 text-white"
        case "ADMIN":
            return "bg-blue-500 text-white"
        default:
            return "bg-gray-400 text-white"   
    }
}

export const getStatusBadge = (isActive:boolean) => {
    return isActive ? "bg-green-500 text-white" : "bg-gray-300 text-black"
}