import EnrollmentRequest, { IEnrollmentRequest } from './EnrollmentRequest';

// For compatibility: treat approved EnrollmentRequests as real enrollments
export type IEnrollment = IEnrollmentRequest;

export const Enrollment = EnrollmentRequest;

export default Enrollment;
