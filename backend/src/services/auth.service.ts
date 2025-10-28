import { addToCollection, getCollection } from "../database/database.utils";

// ✅ Register admin
export const signupService = (userData: any) => {
  const newUser = {
    id: `admin-${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString(),
  };

  addToCollection("admins", newUser);

  return { message: "Admin registered successfully", user: newUser };
};

// ✅ Get all admins
export const getAllAdminsService = () => {
  const admins = getCollection("admins");
  return { message: "All admins fetched successfully", admins };
};

// ✅ Verify OTP
export const verifyOtpService = (otpData: any) => ({
  message: "OTP verified successfully",
  data: otpData,
});

// ✅ Login
export const loginService = (credentials: any) => ({
  message: "Login successful",
  token: "sample-jwt-token",
});

// ✅ Logout
export const logoutService = () => ({
  message: "Logout successful",
});

// ✅ Get all users (fetch from admins collection for now)
export const getAllUsersService = () => {
  const users = getCollection("admins");
  return { message: "Fetched all users", users };
};

// ✅ Get user by ID
export const getUserByIdService = (id: string) => {
  const users = getCollection("admins");
  const user = users.find((u: any) => u.id === id) || { id, name: "Demo User" };
  return { message: `Fetched user ${id}`, user };
};

export const updateUserService = (id: string, updates: any) => {
  return {
    message: `User ${id} updated successfully`,
    updates,
  };
};

export const deleteUserService = (id: string) => {
  return { message: `User ${id} deleted successfully` };
};
