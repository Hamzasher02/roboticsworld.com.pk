export type BackendPermission = 'create' | 'read' | 'update' | 'delete';

export interface CreateRoleRoutePermission {
  route: string;
  permissions: BackendPermission[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  routePermission: CreateRoleRoutePermission[];
}

/* ✅ Response (sirf message) */
export interface CreateRoleResponse {
  success: boolean;
  message: string;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  roleId: string;
  id?: string;
  _id?: string;
}

export interface UpdateRoleResponse {
  success: boolean;
  message: string;
  data: RoleApiItem;
}

export interface RoleApiItem {
  _id: string;
  name: string;
  description: string;
  type: string;
  routePermission: CreateRoleRoutePermission[];
}

export interface GetAllRolesResponse {
  success: boolean;
  message: string;
  data: RoleApiItem[];
}

export interface DeleteRoleRequest {
  roleId: string;
}

export interface DeleteRoleResponse {
  success: boolean;
  message: string;
}
