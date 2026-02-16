export type ApiAccountStatus = string; // backend "pending" etc.

export interface AllUsersApiItem {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountStatus?: ApiAccountStatus;
}

export interface GetAllUsersResponse {
  success: boolean;
  message: string;
  data: AllUsersApiItem[];
}

/** ✅ UI list model (NO id) */
export interface UsersListItem {
  name: string;          // first + last
  email: string;
  role: string;          // instructor/student/admin...
  accountStatus: string; // pending/active...
}

export interface StaffApiItem {
  _id: string;
  email: string;
  roleStatus: 'active' | 'inactive' | string;
  role?: string;
}

export interface GetAllStaffResponse {
  success: boolean;
  message: string;
  data: StaffApiItem[] | StaffApiItem[][];
}
