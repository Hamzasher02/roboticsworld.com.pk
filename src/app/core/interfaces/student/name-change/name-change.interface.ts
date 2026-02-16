/**
 * Request payload for creating a name change request.
 */
export interface NameChangeRequest {
    firstName: string;
    lastName: string;
    reasonForCorrection: string;
}

/**
 * Response from creating a name change request.
 */
export interface NameChangeResponse {
    success: boolean;
    message: string;
    data?: any;
}
