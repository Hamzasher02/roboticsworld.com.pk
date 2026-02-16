// ✅ src/app/core/interfaces/admin/role.ts

export type RoleType = 'default' | 'custom' | string;
export type RoutePermissionAction = 'create' | 'read' | 'update' | 'delete' | string;

export interface RoutePermission {
  route: string;
  permissions: RoutePermissionAction[];
}

export interface Role {
  _id: string;
  name: string;
  type: RoleType;
  description: string;
  routePermission: RoutePermission[];
}

export interface GetAllRolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}

/** UI table row (Role Name | Description | Type | Permission) */
export interface RoleTableRow {
  id: string;
  roleName: string;
  description: string;
  type: string;
  permissionText: string; // e.g. "user management: read, update | course management: read, update, delete"
}
