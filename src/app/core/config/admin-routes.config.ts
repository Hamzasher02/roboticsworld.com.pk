/**
 * 🔒 Admin Secret Route Configuration
 * IMPORTANT: Keep this path secret and do not share publicly
 * Change this path regularly for better security
 */

// Secret admin path - only share this with authorized personnel
export const ADMIN_SECRET_PATH = 'admin-xa2K2myufyulfP7n44sdfasdQ4sL8vR3';

/**
 * Get the full admin login URL
 */
export function getAdminLoginUrl(): string {
    return `/${ADMIN_SECRET_PATH}/login`;
}

/**
 * Get the full admin dashboard URL
 */
export function getAdminDashboardUrl(): string {
    return `/${ADMIN_SECRET_PATH}/dashboard`;
}

/**
 * Get the admin base path
 */
export function getAdminBasePath(): string {
    return `/${ADMIN_SECRET_PATH}`;
}
