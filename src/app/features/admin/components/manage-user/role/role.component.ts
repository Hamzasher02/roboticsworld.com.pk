import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AllUsersService } from '../../../../../core/services/admin/access-role/all-users.service';
import { UsersListItem, StaffApiItem } from '../../../../../core/interfaces/admin/role';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

import { CreateRoleService } from '../../../../../core/services/admin/role/create-role.service';
import {
  BackendPermission,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  RoleApiItem,
  CreateRoleRoutePermission,
} from '../../../../../core/interfaces/admin/creat-role';

type TabType = 'Added User' | 'Invited User' | 'Added Role';
type UserStatus = 'Active' | 'Inactive' | 'Pending';
type RoleStatus = 'Active' | 'Inactive';

interface AddedUserRow {
  kind: 'user';
  tab: 'Added User' | 'Invited User';
  _id: string; // Staff ID for API operations
  email: string;
  accessRole: string;
  status: UserStatus;
  selected?: boolean;
  name?: string;
}

interface AddedRoleRow {
  kind: 'role';
  tab: 'Added Role';
  _id: string;
  roleName: string;
  description: string;
  type: string;
  routePermission: CreateRoleRoutePermission[];
  permission: string; // summary (UI)
  status: RoleStatus;
  selected?: boolean;
}

type Row = AddedUserRow | AddedRoleRow;
type ModalMode = 'user' | 'role';

/* ---------------- Permissions UI Types ---------------- */
type PermissionLevel = 'Limited';
type PermissionAction = 'add' | 'update' | 'delete';

type PermissionModuleKey =
  | 'course'
  | 'user'
  | 'progress'
  | 'requests'
  | 'payments'
  | 'activity'
  | 'deletion'
  | 'plan';

interface PermissionModule {
  key: PermissionModuleKey;
  label: string;
}

type PermissionState = Record<PermissionModuleKey, Record<PermissionAction, boolean>>;

const EMPTY_PERMISSIONS: PermissionState = {
  course: { add: false, update: false, delete: false },
  user: { add: false, update: false, delete: false },
  progress: { add: false, update: false, delete: false },
  requests: { add: false, update: false, delete: false },
  payments: { add: false, update: false, delete: false },
  activity: { add: false, update: false, delete: false },
  deletion: { add: false, update: false, delete: false },
  plan: { add: false, update: false, delete: false },
};

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  tabs: TabType[] = ['Added User', 'Invited User', 'Added Role'];
  activeTab: TabType = 'Added User';

  roleFilter = 'All';
  statusFilter: 'All' | UserStatus | RoleStatus = 'All';

  page = 1;
  pageSize = 5;
  selectAll = false;

  openedRow: Row | null = null;
  addNewOpen = false;
  isDeleting = false;
  isEditMode = false;
  editingRoleId: string | null = null;
  isSubmittingRole = false;
  removingRowEmails = new Set<string>(); // Track which rows are being removed
  togglingStaffIds = new Set<string>(); // Track which staff statuses are being toggled

  // --- Modal State ---
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'Success' | 'Error' = 'Success';

  /* ---------------- Update Role Modal (User + Role) ---------------- */
  showUpdateRoleModal = false;
  modalMode: ModalMode = 'user';
  editingUserRow: AddedUserRow | null = null;
  editingRoleRow: (AddedRoleRow & { _id: string }) | null = null;
  editingUserId: string | null = null;
  assignmentRoleId: string | null = null;

  modalForm = {
    selectedRole: '',
    roleDescription: '',
    email: '',
    permissionLevel: 'Limited' as PermissionLevel,
    permissions: structuredClone(EMPTY_PERMISSIONS) as PermissionState,
  };

  /* ---------------- Permission modules ---------------- */
  permissionModules: PermissionModule[] = [
    { key: 'course', label: 'Course Management' },
    { key: 'user', label: 'User Management' },
    { key: 'progress', label: 'Student Progress' },
    { key: 'requests', label: 'Manage Requests' },
    { key: 'payments', label: 'Manage Payments' },
    { key: 'activity', label: 'Activity Log' },
    { key: 'deletion', label: 'Deletion History' },
    { key: 'plan', label: 'Manage Plan' },
  ];

  showPermissionsDDCreate = false;
  expandedModuleCreate: PermissionModuleKey | null = null;

  /* ---------------- Create User Modal ---------------- */
  showCreateUserModal = false;
  createUserError = '';
  isSubmittingUser = false;
  createUserForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null as File | null,
    profilePicturePreview: ''
  };

  /* ---------------- Create Role Modal ---------------- */
  showCreateRoleModal = false;
  createRoleError = '';
  createRoleForm = {
    roleName: '',
    description: '',
    permissionLevel: 'Limited' as PermissionLevel,
    permissions: structuredClone(EMPTY_PERMISSIONS) as PermissionState,
  };

  /* ---------------- Assign Role Modal ---------------- */
  showAssignRoleModal = false;
  isAssignMode = true;
  staffNoRoles: StaffApiItem[] = [];
  isEmailsLoading = false;
  isAssigning = false;
  isEmailDropdownOpen = false;
  assignRoleForm = {
    selectedRole: '',
    roleDescription: '',
    email: '',
    permissionLevel: 'Limited' as PermissionLevel,
    permissions: structuredClone(EMPTY_PERMISSIONS) as PermissionState,
  };

  /* ---------------- Data ---------------- */
  rows: Row[] = [];


  constructor(
    private allUsersService: AllUsersService,
    private createRoleService: CreateRoleService
  ) { }

  ngOnInit(): void {
    this.loadRoles(); // Fetch roles once for dropdowns and role tab
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetches roles separately for the "Added Role" tab and dropdowns.
   */
  private loadRoles() {
    this.createRoleService.getAllRoles().subscribe({
      next: (roles: RoleApiItem[]) => {
        const roleRows: AddedRoleRow[] = roles.map((r) => ({
          kind: 'role',
          tab: 'Added Role',
          _id: r._id,
          roleName: r.name,
          description: r.description,
          type: r.type,
          routePermission: r.routePermission ?? [],
          permission: 'Limited',
          status: 'Active',
          selected: false,
        }));

        // Filter out old role rows and add new ones
        this.rows = [...this.rows.filter((r) => r.kind !== 'role'), ...roleRows];
        this.resetSelection();
      },
      error: (err) => {
        const msg = err?.message || 'Failed to fetch roles';
        this.openModal('Error', msg);
      }
    });
  }

  /**
   * Fetches staff based on active tab and filters.
   */
  loadUsers() {
    let staffObs$: Observable<StaffApiItem[]>;

    const roleFull = this.roleFilter === 'All' ? '' : this.roleFilter;
    const statusFull = this.statusFilter === 'All' ? '' : this.statusFilter;

    if (this.activeTab === 'Invited User') {
      staffObs$ = this.allUsersService.getStaffWithPendingStatus(roleFull);
    } else if (this.activeTab === 'Added User') {
      // For Added Users, if status is 'All', we don't pass 'pending' to the backend
      staffObs$ = this.allUsersService.getStaffWithRoles(roleFull, statusFull);
    } else {
      // For 'Added Role' tab, we might still want to fetch all staff for dropdown populations
      staffObs$ = this.allUsersService.getAllStaff();
    }

    staffObs$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (staff: StaffApiItem[]) => {
        const staffArray = Array.isArray(staff) ? staff : [];
        const staffRows: AddedUserRow[] = staffArray.map((s) => {
          const rawStatus = (s.roleStatus ?? '').toLowerCase();
          const uiStatus = this.mapAccountStatusToUi(s.roleStatus);

          const isAdded = rawStatus === 'active' || rawStatus === 'inactive';
          const tab: AddedUserRow['tab'] = isAdded ? 'Added User' : 'Invited User';

          return {
            kind: 'user',
            tab,
            _id: s._id,
            email: s.email ?? '',
            accessRole: s.role ?? '',
            status: uiStatus,
            selected: false,
          };
        });

        // Update rows: keep roles, replace staff
        this.rows = [...this.rows.filter((r) => r.kind !== 'user'), ...staffRows];
        this.page = 1;
        this.resetSelection();
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.message || 'Failed to fetch staff';
        this.openModal('Error', msg);
      },
    });
  }

  private mapAccountStatusToUi(accountStatus?: string): UserStatus {
    const s = (accountStatus ?? '').toLowerCase();
    if (s === 'active') return 'Active';
    if (s === 'inactive') return 'Inactive';
    if (s === 'pending') return 'Pending';
    return 'Pending';
  }

  /* ---------------- Tabs ---------------- */
  setActiveTab(tab: TabType) {
    this.activeTab = tab;
    this.page = 1;
    this.roleFilter = 'All';
    this.statusFilter = 'All';

    if (tab === 'Added Role') {
      this.loadRoles();
    } else {
      this.loadUsers();
    }

    this.resetSelection();
  }

  /* ---------------- Badge ---------------- */
  getStatusClass(status: UserStatus | RoleStatus) {
    if (status === 'Active') return 'bg-green-100 text-green-700 border border-green-300';
    if (status === 'Inactive') return 'bg-red-100 text-red-700 border border-red-300';
    return 'bg-red-100 text-red-700 border border-red-300';
  }

  getToggleStatusLabel(row: Row): 'Active' | 'Inactive' {
    if (row.kind === 'user') return row.status === 'Inactive' ? 'Active' : 'Inactive';
    return row.status === 'Inactive' ? 'Active' : 'Inactive';
  }

  /* ---------------- Dropdown data ---------------- */
  get allRoles(): string[] {
    const roleNames = this.rows
      .filter((r) => r.kind === 'role')
      .map((r) => (r as AddedRoleRow).roleName)
      .filter(Boolean);

    const userRoles = this.rows
      .filter((r) => r.kind === 'user')
      .map((r) => (r as AddedUserRow).accessRole)
      .filter(Boolean);

    return Array.from(new Set([...roleNames, ...userRoles]));
  }

  get emailOptions(): string[] {
    const options = new Set<string>();

    this.staffNoRoles.forEach(s => {
      if (s.email) options.add(s.email);
    });

    // If we are in "Change Role" mode, ensure the person's email is included
    if (!this.isAssignMode && this.assignRoleForm.email) {
      options.add(this.assignRoleForm.email);
    }

    return Array.from(options);
  }

  getRoleByName(roleName: string): AddedRoleRow | undefined {
    return this.rows.find((r) => r.kind === 'role' && (r as AddedRoleRow).roleName === roleName) as
      | AddedRoleRow
      | undefined;
  }

  onRoleChange() {
    const role = this.getRoleByName(this.modalForm.selectedRole);
    this.modalForm.roleDescription = role ? role.description : '';
  }

  /* ---------------- Filters ---------------- */
  get roleOptions(): string[] {
    if (this.activeTab === 'Added Role') {
      const set = new Set(
        this.rows.filter((r) => r.kind === 'role').map((r) => (r as AddedRoleRow).roleName)
      );
      return ['All', ...Array.from(set)];
    }

    const set = new Set(
      this.rows
        .filter((r) => r.kind === 'user' && r.tab === this.activeTab)
        .map((r) => (r as AddedUserRow).accessRole)
        .filter(Boolean)
    );
    return ['All', ...Array.from(set)];
  }

  get filteredRows(): Row[] {
    const byTab = this.rows.filter((r) => r.tab === this.activeTab);

    const byRole =
      this.roleFilter === 'All'
        ? byTab
        : byTab.filter((r) =>
          r.kind === 'role'
            ? (r as AddedRoleRow).roleName === this.roleFilter
            : (r as AddedUserRow).accessRole === this.roleFilter
        );

    if (this.activeTab === 'Added User') {
      const base = byRole.filter((r) => r.kind === 'user' && (r as AddedUserRow).status !== 'Pending');
      return this.statusFilter === 'All'
        ? base
        : base.filter((r) => (r as AddedUserRow).status === this.statusFilter);
    }

    if (this.activeTab === 'Invited User') {
      const base = byRole.filter((r) => r.kind === 'user' && (r as AddedUserRow).status === 'Pending');
      return this.statusFilter === 'All'
        ? base
        : base.filter((r) => (r as AddedUserRow).status === this.statusFilter);
    }

    return byRole;
  }

  /* ---------------- Pagination ---------------- */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get paginatedRows(): Row[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  goNext() {
    if (this.page < this.totalPages) {
      this.page++;
      this.resetSelection();
    }
  }

  goPrev() {
    if (this.page > 1) {
      this.page--;
      this.resetSelection();
    }
  }

  /* ---------------- Selection ---------------- */
  toggleSelectAll() {
    this.paginatedRows.forEach((r) => (r.selected = this.selectAll));
  }

  checkIfAllSelected() {
    this.selectAll = this.paginatedRows.length > 0 && this.paginatedRows.every((r) => r.selected);
  }

  anySelected(): boolean {
    return this.rows.some((r) => r.tab === this.activeTab && r.selected);
  }

  resetSelection() {
    this.selectAll = false;
    this.rows.forEach((r) => {
      if (r.tab === this.activeTab) r.selected = false;
    });
    this.openedRow = null;
  }

  deleteSelected() {
    this.rows = this.rows.filter((r) => !(r.tab === this.activeTab && r.selected));
    this.selectAll = false;
    this.openedRow = null;
    if (this.page > this.totalPages) this.page = this.totalPages;
  }

  /* ---------------- Menus ---------------- */
  toggleRowMenu(row: Row) {
    this.openedRow = this.openedRow === row ? null : row;
  }

  /* ---------------- Update Role Modal ---------------- */
  openUserModal(row: AddedUserRow) {
    this.modalMode = 'user';
    this.editingUserRow = row;
    this.editingRoleRow = null;

    this.modalForm.email = row.email;
    this.modalForm.selectedRole = row.accessRole;

    const role = this.getRoleByName(row.accessRole);
    this.modalForm.roleDescription = role ? role.description : '';

    this.modalForm.permissionLevel = 'Limited';
    this.modalForm.permissions = structuredClone(EMPTY_PERMISSIONS);

    this.showUpdateRoleModal = true;
    this.openedRow = null;
  }

  openRoleModal(row: AddedRoleRow) {
    this.modalMode = 'role';
    this.editingRoleRow = row;
    this.editingUserRow = null;
    this.editingRoleId = row._id;

    this.modalForm.selectedRole = row.roleName;
    this.modalForm.roleDescription = row.description;
    this.modalForm.email = '';

    this.modalForm.permissionLevel = 'Limited';
    this.modalForm.permissions = structuredClone(EMPTY_PERMISSIONS);

    this.showUpdateRoleModal = true;
    this.openedRow = null;
  }

  closeUpdateRoleModal() {
    this.showUpdateRoleModal = false;
    this.editingUserRow = null;
    this.editingRoleRow = null;
  }

  submitUpdateRole() {
    if (this.modalMode === 'user' && this.editingUserRow) {
      this.editingUserRow.accessRole = this.modalForm.selectedRole;
      this.closeUpdateRoleModal();
      return;
    }

    if (this.modalMode === 'role' && this.editingRoleRow && this.assignmentRoleId) {
      const payload: UpdateRoleRequest = {
        roleId: this.assignmentRoleId,
        name: this.modalForm.selectedRole,
        description: this.editingRoleRow.description,
        routePermission: this.mapUiPermissionsToBackend(EMPTY_PERMISSIONS) // keep dummy for now
      };

      this.createRoleService.updateRole(payload).subscribe({
        next: (res) => {
          alert(res.message);
          this.closeUpdateRoleModal();
          this.loadUsers();
        },
        error: (err) => {
          alert(err.message);
        }
      });
    }
  }

  toggleStatus(row: Row) {
    if (row.kind !== 'user') return;

    // Only allow toggling for Added Users (not pending invites)
    if (row.status === 'Pending') {
      this.openedRow = null;
      return;
    }

    // Validate staffId exists
    if (!row._id || !row._id.trim()) {
      this.openModal('Error', 'Staff ID not found');
      this.openedRow = null;
      return;
    }

    // Set loading state for this specific staff
    this.togglingStaffIds.add(row._id);
    this.openedRow = null;

    this.allUsersService.toggleStaffStatus(row._id).subscribe({
      next: (res: { success: boolean; message: string; data?: unknown }) => {
        this.togglingStaffIds.delete(row._id);

        // Show success toast
        this.openModal('Success', res.message || 'Staff status updated successfully');

        // Update UI: toggle the status
        row.status = row.status === 'Inactive' ? 'Active' : 'Inactive';
      },
      error: (err: unknown) => {
        this.togglingStaffIds.delete(row._id);

        // Extract error message
        const errorObj = err as { error?: { message?: string }; message?: string };
        const msg = errorObj?.error?.message || errorObj?.message || 'Failed to update staff status';

        // Show error toast
        this.openModal('Error', msg);
      }
    });
  }

  /* ---------------- Row actions ---------------- */
  changeRole(row: Row) {
    if (row.kind !== 'user') return;

    if (this.activeTab === 'Added User') {
      // Open Assign Role modal to change the role assigned to THIS user
      this.assignRole(row as AddedUserRow);
    } else {
      // Invited User -> Navigate to Assign Role section (Change Role mode)
      this.assignRole(row as AddedUserRow);
    }
  }

  removeRow(row: Row) {
    if (row.kind !== 'user') return;
    this.handleRemoveInvitedUser(row);
  }

  /**
   * Handles removing an invited user via API call.
   * Shows loading state on that row's button, calls removeStaffWithPendingStatus,
   * and removes the row from UI on success.
   */
  handleRemoveInvitedUser(row: AddedUserRow) {
    const email = row.email;

    // Validate email exists
    if (!email || !email.trim()) {
      this.openModal('Error', 'Email not found');
      this.openedRow = null;
      return;
    }

    // Set loading state for this specific row
    this.removingRowEmails.add(email);
    this.openedRow = null;

    this.allUsersService.removeStaffWithPendingStatus(email).subscribe({
      next: (res: { success: boolean; message: string; data?: unknown }) => {
        this.removingRowEmails.delete(email);

        // Show success toast
        this.openModal('Success', res.message || 'User removed successfully');

        // Remove row from UI (optimistic update)
        this.rows = this.rows.filter((r) => r !== row);

        // Adjust pagination if needed
        if (this.page > this.totalPages) {
          this.page = this.totalPages;
        }
      },
      error: (err: unknown) => {
        this.removingRowEmails.delete(email);

        // Extract error message
        const errorObj = err as { error?: { message?: string }; message?: string };
        const msg = errorObj?.error?.message || errorObj?.message || 'Failed to remove user';

        // Show error toast
        this.openModal('Error', msg);
      }
    });
  }

  editRole(row: Row) {
    if (row.kind !== 'role') return;

    this.isEditMode = true;
    this.editingRoleId = row._id;
    this.createRoleError = '';

    this.createRoleForm = {
      roleName: row.roleName,
      description: row.description,
      permissionLevel: 'Limited',
      permissions: this.reverseMapBackendToUiPermissions(row.routePermission),
    };

    this.showPermissionsDDCreate = false;
    this.expandedModuleCreate = null;
    this.showCreateRoleModal = true;
    this.openedRow = null;
  }

  private reverseMapBackendToUiPermissions(backendPerms: CreateRoleRoutePermission[]): PermissionState {
    const state = structuredClone(EMPTY_PERMISSIONS);

    (backendPerms ?? []).forEach(p => {
      // Find the module key by route name
      const module = this.permissionModules.find(m => m.label.toLowerCase() === p.route.toLowerCase());
      if (module) {
        const key = module.key;
        state[key].add = p.permissions.includes('create');
        state[key].update = p.permissions.includes('update');
        state[key].delete = p.permissions.includes('delete');
      }
    });

    return state;
  }

  removeRole(row: Row) {
    if (row.kind !== 'role' || !row._id) return;

    if (!confirm(`Are you sure you want to remove role "${row.roleName}"?`)) {
      this.openedRow = null;
      return;
    }

    this.isDeleting = true;

    this.createRoleService.deleteRole({ roleId: row._id }).subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.openModal('Success', res.message || 'Role deleted successfully');
        this.loadUsers();
        this.openedRow = null;
      },
      error: (err) => {
        this.isDeleting = false;
        const msg = err?.error?.message || err?.message || 'Failed to delete role';
        this.openModal('Error', msg);
        this.openedRow = null;
      },
    });
  }

  /* ---------------- Add New Dropdown ---------------- */
  toggleAddNew() {
    this.addNewOpen = !this.addNewOpen;
  }

  /* ---------------- Create User Modal ---------------- */
  createUser() {
    this.addNewOpen = false;
    this.createUserError = '';
    this.isSubmittingUser = false;
    this.createUserForm = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: null,
      profilePicturePreview: ''
    };
    this.showCreateUserModal = true;
  }

  closeCreateUserModal() {
    this.showCreateUserModal = false;
    this.createUserError = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.createUserError = 'Please select a valid image file';
        return;
      }
      this.createUserForm.profilePicture = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.createUserForm.profilePicturePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submitCreateUser(): void {
    const { firstName, lastName, email, password, confirmPassword, profilePicture } = this.createUserForm;

    if (!firstName.trim() || !lastName.trim()) {
      this.createUserError = 'First and Last name are required';
      return;
    }
    if (!email.trim()) {
      this.createUserError = 'Email is required';
      return;
    }
    if (!password || !confirmPassword) {
      this.createUserError = 'Password and Confirm Password are required';
      return;
    }
    if (password !== confirmPassword) {
      this.createUserError = 'Passwords do not match';
      return;
    }
    if (!profilePicture) {
      this.createUserError = 'Profile picture is required';
      return;
    }

    this.isSubmittingUser = true;
    this.createUserError = '';

    const formData = new FormData();
    formData.append('firstName', firstName.trim());
    formData.append('lastName', lastName.trim());
    formData.append('email', email.trim());
    formData.append('password', password);
    formData.append('profilePicture', profilePicture);

    this.allUsersService.registerStaff(formData).subscribe({
      next: (res) => {
        this.isSubmittingUser = false;
        const msg = res.message || 'User created successfully';
        this.openModal('Success', msg);

        this.showCreateUserModal = false;
        this.loadUsers(); // Refresh the list
        this.activeTab = 'Added User';
        this.page = 1;
        this.resetSelection();
      },
      error: (err) => {
        this.isSubmittingUser = false;
        this.createUserError = err?.error?.message || err?.message || 'Failed to create user';
      }
    });
  }

  /* ---------------- Create Role Modal ---------------- */
  createRole() {
    this.addNewOpen = false;
    this.createRoleError = '';
    this.isEditMode = false;
    this.editingRoleId = null;

    this.createRoleForm = {
      roleName: '',
      description: '',
      permissionLevel: 'Limited',
      permissions: structuredClone(EMPTY_PERMISSIONS),
    };

    this.showPermissionsDDCreate = false;
    this.expandedModuleCreate = null;

    this.showCreateRoleModal = true;
  }

  closeCreateRoleModal() {
    this.showCreateRoleModal = false;
    this.createRoleError = '';
    this.isEditMode = false;
    this.editingRoleId = null;

    this.showPermissionsDDCreate = false;
    this.expandedModuleCreate = null;
  }

  togglePermissionsDropdownCreate() {
    this.showPermissionsDDCreate = !this.showPermissionsDDCreate;
  }

  toggleModuleCreate(key: PermissionModuleKey) {
    this.expandedModuleCreate = this.expandedModuleCreate === key ? null : key;
  }

  /* ✅ label -> route (lowercase) */
  private moduleKeyToRouteLabel(key: PermissionModuleKey): string {
    const m = this.permissionModules.find((x) => x.key === key);
    return (m?.label ?? key).toLowerCase();
  }

  /* ✅ UI state -> backend routePermission */
  private mapUiPermissionsToBackend(state: PermissionState): CreateRoleRequest['routePermission'] {
    const routePermission: CreateRoleRequest['routePermission'] = [];

    (Object.keys(state) as PermissionModuleKey[]).forEach((moduleKey) => {
      const actions = state[moduleKey];

      const perms: BackendPermission[] = [];

      // add -> create
      if (actions.add) perms.push('create');
      if (actions.update) perms.push('update');
      if (actions.delete) perms.push('delete');

      // include read if any permission selected (UI me read nahi hai)
      if (perms.length > 0) perms.unshift('read');

      if (perms.length > 0) {
        routePermission.push({
          route: this.moduleKeyToRouteLabel(moduleKey),
          permissions: perms,
        });
      }
    });

    return routePermission;
  }

  /* ✅ API Call here */
  submitCreateRole(): void {
    const name = this.createRoleForm.roleName.trim();
    const desc = this.createRoleForm.description.trim();

    if (!name) {
      this.createRoleError = 'Role name is required';
      return;
    }

    this.createRoleError = '';

    const perms = this.mapUiPermissionsToBackend(this.createRoleForm.permissions);
    this.isSubmittingRole = true;

    if (this.isEditMode && this.editingRoleId) {
      const payload: UpdateRoleRequest = {
        roleId: this.editingRoleId,
        id: this.editingRoleId,
        _id: this.editingRoleId,
        name,
        description: desc,
        routePermission: perms,
      };

      this.createRoleService.updateRole(payload).subscribe({
        next: (res: UpdateRoleResponse) => {
          this.isSubmittingRole = false;
          this.openModal('Success', res.message || 'Role updated successfully');
          this.showCreateRoleModal = false;
          this.isEditMode = false;
          this.editingRoleId = null;
          this.loadRoles(); // Refresh roles list
          this.loadUsers(); // Refresh staff list to reflect any changes
          this.resetSelection();
        },
        error: (err: any) => {
          this.isSubmittingRole = false;
          const msg = err?.error?.message || err?.message || 'Failed to update role';
          this.openModal('Error', msg);
        }
      });
      return;
    }

    const payload: CreateRoleRequest = {
      name,
      description: desc,
      routePermission: perms,
    };

    this.createRoleService
      .createRole(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: CreateRoleResponse) => {
          this.isSubmittingRole = false;
          this.openModal('Success', res.message || 'Role created successfully');

          this.showCreateRoleModal = false;
          this.loadUsers();
          this.activeTab = 'Added Role';
          this.page = 1;
          this.resetSelection();
        },
        error: (err: any) => {
          this.isSubmittingRole = false;
          const msg = err?.error?.message || err?.message || 'Failed to create role';
          this.openModal('Error', msg);
        },
      });
  }

  /* ---------------- Assign Role Modal ---------------- */
  assignRole(row?: AddedUserRow) {
    this.addNewOpen = false;
    this.isAssignMode = !row;

    this.assignRoleForm = {
      selectedRole: row ? row.accessRole : '',
      roleDescription: '',
      email: row ? row.email : '',
      permissionLevel: 'Limited',
      permissions: structuredClone(EMPTY_PERMISSIONS),
    };

    if (row) {
      this.onAssignRoleChange();
    }

    // API should NOT be called here anymore
    this.isEmailDropdownOpen = false;
    this.showAssignRoleModal = true;
  }

  onEmailDropdownClick(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isEmailDropdownOpen = !this.isEmailDropdownOpen;
    if (this.isEmailDropdownOpen) {
      this.loadStaffNoRoles();
    }
  }

  selectEmail(email: string) {
    this.assignRoleForm.email = email;
    this.isEmailDropdownOpen = false;
  }

  loadStaffNoRoles() {
    this.isEmailsLoading = true;
    this.allUsersService.getStaffWithNoRoles().subscribe({
      next: (res) => {
        this.isEmailsLoading = false;
        if (res.success) {
          this.staffNoRoles = res.data;
        } else {
          this.staffNoRoles = [];
          this.openModal('Error', res.message);
        }
      },
      error: (err) => {
        this.isEmailsLoading = false;
        this.staffNoRoles = [];
        const msg = err?.error?.message || err?.message || 'Failed to fetch staff';
        this.openModal('Error', msg);
      }
    });
  }

  closeAssignRoleModal() {
    this.showAssignRoleModal = false;
  }

  onAssignRoleChange() {
    const role = this.getRoleByName(this.assignRoleForm.selectedRole);
    this.assignRoleForm.roleDescription = role ? role.description : '';
  }

  submitAssignRole() {
    const email = this.assignRoleForm.email;
    const roleName = this.assignRoleForm.selectedRole;

    const role = this.getRoleByName(roleName);
    const roleId = role ? role._id : '';

    if (!email || !roleName || !roleId) {
      this.openModal('Error', 'Please select email and role');
      return;
    }

    const payload = { email, roleName, roleId };
    this.isAssigning = true;
    const obs$ = this.isAssignMode
      ? this.allUsersService.assignRole(payload)
      : this.allUsersService.updateStaffRole(payload);

    obs$.subscribe({
      next: (res) => {
        this.isAssigning = false;
        this.openModal('Success', res.message || 'Operation successful');
        this.showAssignRoleModal = false;
        this.loadUsers(); // Refresh to show updated statuses
        this.activeTab = 'Added User';
        this.page = 1;
        this.resetSelection();
      },
      error: (err) => {
        this.isAssigning = false;
        const msg = err?.error?.message || err?.message || 'Failed to complete assign role operation';
        this.openModal('Error', msg);
      }
    });
  }

  /* ---------------- Permissions helpers ---------------- */
  getPermissionsLabel(state: PermissionState): string {
    const total = this.countSelectedActions(state);
    if (total === 0) return 'Select Permissions';
    return `${total} Selected`;
  }

  private countSelectedActions(state: PermissionState): number {
    let c = 0;
    Object.keys(state).forEach((k) => {
      const key = k as PermissionModuleKey;
      c += state[key].add ? 1 : 0;
      c += state[key].update ? 1 : 0;
      c += state[key].delete ? 1 : 0;
    });
    return c;
  }

  toggleAction(state: PermissionState, moduleKey: PermissionModuleKey, action: PermissionAction) {
    state[moduleKey][action] = !state[moduleKey][action];
  }

  // --- Modal Helpers ---
  openModal(title: 'Success' | 'Error', message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = title;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /* ---------------- Close on outside click ---------------- */
  @HostListener('document:click', ['$event'])
  closeMenus(e: MouseEvent) {
    const t = e.target as HTMLElement;

    if (this.showCreateUserModal || this.showAssignRoleModal || this.showUpdateRoleModal) {
      if (!t.closest('.perms-dd-create')) this.showPermissionsDDCreate = false;
      if (!t.closest('.email-dd-parent')) this.isEmailDropdownOpen = false;
      return;
    }

    if (!t.closest('.row-menu')) this.openedRow = null;
    if (!t.closest('.add-new-menu')) this.addNewOpen = false;
  }
}
