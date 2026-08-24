import {
  HEALTHCORE_OPERATIONAL_BASELINE,
  type Appointment,
  type Claim,
  type Clinic,
  type Country,
  type Employee,
  type Patient,
  type ValidationResult,
} from "../types/models";

const isValidDate = (value: string): boolean => !Number.isNaN(new Date(value).getTime());

const hasText = (value: string): boolean => value.trim().length > 0;

const isRegionValidForCountry = (country: Country, region: string): boolean => {
  if (country === "US") {
    return region === "Texas" || region === "Florida" || region === "Georgia";
  }
  return region === "London" || region === "Manchester";
};

export const validateClinic = (clinic: Clinic): ValidationResult => {
  const errors: string[] = [];

  if (!hasText(clinic.clinicId)) {
    errors.push("clinicId is required.");
  }

  if (!hasText(clinic.clinicName)) {
    errors.push("clinicName is required.");
  }

  if (!isRegionValidForCountry(clinic.country, clinic.region)) {
    errors.push("region must match country (US: Texas/Florida/Georgia, UK: London/Manchester).");
  }

  if (clinic.country === "US" && clinic.ehrPlatform !== "US_EHR") {
    errors.push("US clinics must use US_EHR.");
  }

  if (clinic.country === "UK" && clinic.ehrPlatform !== "UK_EHR") {
    errors.push("UK clinics must use UK_EHR.");
  }

  if (!hasText(clinic.departmentOwner)) {
    errors.push("departmentOwner is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePatient = (patient: Patient): ValidationResult => {
  const errors: string[] = [];

  if (!hasText(patient.patientId)) {
    errors.push("patientId is required.");
  }

  if (!hasText(patient.fullName)) {
    errors.push("fullName is required.");
  }

  if (!hasText(patient.phone)) {
    errors.push("phone is required.");
  }

  if (!hasText(patient.email)) {
    errors.push("email is required.");
  }

  if (!isValidDate(patient.dateOfBirth)) {
    errors.push("dateOfBirth must be a valid date.");
  }

  if (patient.country === "US" && !patient.hipaaConsent) {
    errors.push("US patients must have hipaaConsent.");
  }

  if (patient.country === "UK" && !patient.gdprConsent) {
    errors.push("UK patients must have gdprConsent.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAppointment = (appointment: Appointment): ValidationResult => {
  const errors: string[] = [];

  if (!hasText(appointment.appointmentId)) {
    errors.push("appointmentId is required.");
  }

  if (!hasText(appointment.patientId)) {
    errors.push("patientId is required.");
  }

  if (!hasText(appointment.clinicId)) {
    errors.push("clinicId is required.");
  }

  if (!isValidDate(appointment.scheduledAt)) {
    errors.push("scheduledAt must be a valid date.");
  }

  if (appointment.noShowRiskScore < 0 || appointment.noShowRiskScore > 1) {
    errors.push("noShowRiskScore must be between 0 and 1.");
  }

  if (appointment.country === "US" && appointment.bookingChannel !== "Phone") {
    errors.push("US appointments must use Phone bookingChannel based on current HealthCore operations.");
  }

  if (appointment.country === "UK" && appointment.bookingChannel !== "FrontDesk") {
    errors.push("UK appointments must use FrontDesk bookingChannel based on current HealthCore operations.");
  }

  if (
    appointment.patientSatisfactionScore !== null &&
    (appointment.patientSatisfactionScore < 1 || appointment.patientSatisfactionScore > 5)
  ) {
    errors.push("patientSatisfactionScore must be between 1 and 5 when provided.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateClaim = (claim: Claim): ValidationResult => {
  const errors: string[] = [];

  if (!hasText(claim.claimId)) {
    errors.push("claimId is required.");
  }

  if (!hasText(claim.appointmentId)) {
    errors.push("appointmentId is required.");
  }

  if (claim.amountUsd <= 0) {
    errors.push("amountUsd must be greater than 0.");
  }

  if (
    claim.country === "US" &&
    claim.payerType !== "CommercialInsurance" &&
    claim.payerType !== "Medicare" &&
    claim.payerType !== "Medicaid"
  ) {
    errors.push("US claims must use CommercialInsurance, Medicare, or Medicaid.");
  }

  if (claim.country === "UK" && claim.payerType !== "PrivatePay" && claim.payerType !== "NHS") {
    errors.push("UK claims must use PrivatePay or NHS.");
  }

  if (claim.status === "Denied" && (!claim.denialReason || !hasText(claim.denialReason))) {
    errors.push("denialReason is required when claim status is Denied.");
  }

  if (claim.status !== "Denied" && claim.denialReason !== null) {
    errors.push("denialReason must be null when claim status is not Denied.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmployee = (employee: Employee): ValidationResult => {
  const errors: string[] = [];

  if (!hasText(employee.employeeId)) {
    errors.push("employeeId is required.");
  }

  if (!hasText(employee.fullName)) {
    errors.push("fullName is required.");
  }

  if (!hasText(employee.locationName)) {
    errors.push("locationName is required.");
  }

  if (employee.timeToHireDays < 0) {
    errors.push("timeToHireDays cannot be negative.");
  }

  if (employee.cmeHoursCompleted < 0) {
    errors.push("cmeHoursCompleted cannot be negative.");
  }

  if (employee.cmeHoursRequired <= 0) {
    errors.push("cmeHoursRequired must be greater than 0.");
  }

  if (employee.licenseExpiryDate !== null && !isValidDate(employee.licenseExpiryDate)) {
    errors.push("licenseExpiryDate must be a valid date when provided.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export interface HealthCoreDataset {
  clinics: Clinic[];
  patients: Patient[];
  appointments: Appointment[];
  claims: Claim[];
  employees: Employee[];
}

export const validateHealthCoreDataset = (dataset: HealthCoreDataset): ValidationResult => {
  const errors: string[] = [];

  dataset.clinics.forEach((clinic, index) => {
    const result = validateClinic(clinic);
    result.errors.forEach((error) => errors.push(`clinics[${index}]: ${error}`));
  });

  dataset.patients.forEach((patient, index) => {
    const result = validatePatient(patient);
    result.errors.forEach((error) => errors.push(`patients[${index}]: ${error}`));
  });

  dataset.appointments.forEach((appointment, index) => {
    const result = validateAppointment(appointment);
    result.errors.forEach((error) => errors.push(`appointments[${index}]: ${error}`));
  });

  dataset.claims.forEach((claim, index) => {
    const result = validateClaim(claim);
    result.errors.forEach((error) => errors.push(`claims[${index}]: ${error}`));
  });

  dataset.employees.forEach((employee, index) => {
    const result = validateEmployee(employee);
    result.errors.forEach((error) => errors.push(`employees[${index}]: ${error}`));
  });

  const clinicIds = new Set(dataset.clinics.map((clinic) => clinic.clinicId));
  const patientIds = new Set(dataset.patients.map((patient) => patient.patientId));
  const appointmentIds = new Set(dataset.appointments.map((appointment) => appointment.appointmentId));

  dataset.appointments.forEach((appointment, index) => {
    if (!clinicIds.has(appointment.clinicId)) {
      errors.push(`appointments[${index}]: clinicId does not exist in clinics.`);
    }

    if (!patientIds.has(appointment.patientId)) {
      errors.push(`appointments[${index}]: patientId does not exist in patients.`);
    }
  });

  dataset.claims.forEach((claim, index) => {
    if (!appointmentIds.has(claim.appointmentId)) {
      errors.push(`claims[${index}]: appointmentId does not exist in appointments.`);
    }
  });

  const clinicsById = new Map(dataset.clinics.map((clinic) => [clinic.clinicId, clinic] as const));
  const patientsById = new Map(dataset.patients.map((patient) => [patient.patientId, patient] as const));
  const appointmentsById = new Map(dataset.appointments.map((appointment) => [appointment.appointmentId, appointment] as const));

  dataset.appointments.forEach((appointment, index) => {
    const clinic = clinicsById.get(appointment.clinicId);
    const patient = patientsById.get(appointment.patientId);

    if (clinic && clinic.country !== appointment.country) {
      errors.push(`appointments[${index}]: appointment country must match clinic country.`);
    }

    if (patient && patient.country !== appointment.country) {
      errors.push(`appointments[${index}]: appointment country must match patient country.`);
    }
  });

  dataset.claims.forEach((claim, index) => {
    const appointment = appointmentsById.get(claim.appointmentId);
    if (appointment && appointment.country !== claim.country) {
      errors.push(`claims[${index}]: claim country must match appointment country.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export interface HealthCoreBaselineCheck {
  noShowRate: number;
  claimsDenialRate: number;
  averageTimeToHireDays: number;
  isNoShowRateAboveBaseline: boolean;
  isClaimsDenialRateAboveBaseline: boolean;
  isTimeToHireAboveBaseline: boolean;
}

export const evaluateHealthCoreBaseline = (
  appointments: Appointment[],
  claims: Claim[],
  employees: Employee[],
): HealthCoreBaselineCheck => {
  const totalAppointments = appointments.length;
  const noShowAppointments = appointments.filter((appointment) => !appointment.attended).length;
  const noShowRate = totalAppointments === 0 ? 0 : noShowAppointments / totalAppointments;

  const totalClaims = claims.length;
  const deniedClaims = claims.filter((claim) => claim.status === "Denied").length;
  const claimsDenialRate = totalClaims === 0 ? 0 : deniedClaims / totalClaims;

  const averageTimeToHireDays =
    employees.length === 0
      ? 0
      : employees.reduce((sum, employee) => sum + employee.timeToHireDays, 0) / employees.length;

  return {
    noShowRate,
    claimsDenialRate,
    averageTimeToHireDays,
    isNoShowRateAboveBaseline: noShowRate > HEALTHCORE_OPERATIONAL_BASELINE.noShowRate,
    isClaimsDenialRateAboveBaseline: claimsDenialRate > HEALTHCORE_OPERATIONAL_BASELINE.claimsDenialRate,
    isTimeToHireAboveBaseline: averageTimeToHireDays > HEALTHCORE_OPERATIONAL_BASELINE.timeToHireDays,
  };
};
