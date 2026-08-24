export type Country = "US" | "UK";

export type UsRegion = "Texas" | "Florida" | "Georgia";

export type UkRegion = "London" | "Manchester";

export type Region = UsRegion | UkRegion;

export type EhrPlatform = "US_EHR" | "UK_EHR";

export type BookingChannel = "Phone" | "FrontDesk" | "Online";

export type ReminderStatus = "NotSent" | "Sent" | "Confirmed" | "Rescheduled";

export type PayerType = "CommercialInsurance" | "Medicare" | "Medicaid" | "PrivatePay" | "NHS";

export type ClaimStatus = "Submitted" | "Denied" | "Paid" | "Pending";

export type RoleType = "Physician" | "NursePractitioner" | "Nurse" | "MedicalAssistant" | "Administration" | "Technology";

export type HealthCoreDepartment =
  | "Clinical Operations"
  | "Patient Experience and Access"
  | "Revenue Cycle and Billing"
  | "Compliance and Data Governance"
  | "People and Workforce"
  | "Technology"
  | "Executive Leadership";

export const HEALTHCORE_OPERATIONAL_BASELINE = {
  clinicCount: 12,
  employeeCount: 200,
  annualRevenueUsd: 28_000_000,
  noShowRate: 0.22,
  claimsDenialRate: 0.14,
  clinicalDocumentationMinutesPerDay: 35,
  timeToHireDays: 47,
} as const;

export interface Clinic {
  clinicId: string;
  clinicName: string;
  country: Country;
  region: Region;
  ehrPlatform: EhrPlatform;
  departmentOwner: "Dr. Marcus Reid" | "Priya Nair" | "Tom Callahan" | "Claire Whitfield" | "Diane Foster" | "James Osei";
  extendedHours: boolean;
  bilingualStaff: boolean;
}

export interface Patient {
  patientId: string;
  fullName: string;
  country: Country;
  dateOfBirth: string;
  phone: string;
  email: string;
  hipaaConsent: boolean;
  gdprConsent: boolean;
}

export interface Appointment {
  appointmentId: string;
  patientId: string;
  clinicId: string;
  country: Country;
  scheduledAt: string;
  attended: boolean;
  bookingChannel: BookingChannel;
  reminderStatus: ReminderStatus;
  noShowRiskScore: number;
  patientSatisfactionScore: number | null;
}

export interface Claim {
  claimId: string;
  appointmentId: string;
  country: Country;
  payerType: PayerType;
  amountUsd: number;
  status: ClaimStatus;
  denialReason: string | null;
}

export interface Employee {
  employeeId: string;
  fullName: string;
  country: Country;
  roleType: RoleType;
  locationName: string;
  timeToHireDays: number;
  cmeHoursCompleted: number;
  cmeHoursRequired: number;
  licenseExpiryDate: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const createClinic = (clinic: Clinic): Clinic => ({ ...clinic });

export const createPatient = (patient: Patient): Patient => ({ ...patient });

export const createAppointment = (appointment: Appointment): Appointment => ({ ...appointment });

export const createClaim = (claim: Claim): Claim => ({ ...claim });

export const createEmployee = (employee: Employee): Employee => ({ ...employee });

export const isUsClinic = (clinic: Clinic): boolean => clinic.country === "US";

export const isUkClinic = (clinic: Clinic): boolean => clinic.country === "UK";

export const getAppointmentWeekKey = (appointment: Appointment): string => {
  const date = new Date(appointment.scheduledAt);
  const year = date.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const elapsedDays = Math.floor((date.getTime() - firstDay.getTime()) / 86_400_000);
  const week = Math.floor((elapsedDays + firstDay.getUTCDay()) / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
};
