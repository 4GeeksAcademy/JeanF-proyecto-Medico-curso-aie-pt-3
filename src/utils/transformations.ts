import { groupBy } from "./collections";
import type { Appointment, Claim, Employee } from "../types/models";

export interface AppointmentReport {
  totalAppointments: number;
  attendedAppointments: number;
  noShowAppointments: number;
  noShowRate: number;
  appointmentsByCountry: Record<string, number>;
  appointmentsByBookingChannel: Record<string, number>;
  averageNoShowRiskScore: number;
}

export interface ClaimsReport {
  totalClaims: number;
  totalClaimAmountUsd: number;
  deniedClaims: number;
  paidClaims: number;
  denialRate: number;
  collectionRate: number;
  amountByPayerType: Record<string, number>;
  maxClaimAmountUsd: number | null;
  minClaimAmountUsd: number | null;
  averageClaimAmountUsd: number;
}

export interface WorkforceReport {
  totalEmployees: number;
  employeesByRoleType: Record<string, number>;
  averageTimeToHireDays: number;
  averageCmeCompletionRate: number;
  expiringLicensesIn90Days: number;
}

export interface ExecutiveLeadershipKpiReport {
  appointmentVolume: number;
  noShowRate: number;
  claimsDenialRate: number;
  revenueByCountryUsd: Record<string, number>;
  patientSatisfactionAverageByCountry: Record<string, number>;
}

export const countByCategory = <T>(items: T[], selector: (item: T) => string): Record<string, number> => {
  const grouped = groupBy(items, selector);

  return Object.entries(grouped).reduce<Record<string, number>>((accumulator, [key, values]) => {
    accumulator[key] = values.length;
    return accumulator;
  }, {});
};

export const sumBy = <T>(items: T[], selector: (item: T) => number): number => {
  return items.reduce((total, item) => total + selector(item), 0);
};

export const averageBy = <T>(items: T[], selector: (item: T) => number): number => {
  if (items.length === 0) {
    return 0;
  }

  return sumBy(items, selector) / items.length;
};

export const maxBy = <T>(items: T[], selector: (item: T) => number): number | null => {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((max, item) => Math.max(max, selector(item)), Number.NEGATIVE_INFINITY);
};

export const minBy = <T>(items: T[], selector: (item: T) => number): number | null => {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((min, item) => Math.min(min, selector(item)), Number.POSITIVE_INFINITY);
};

export const buildAppointmentReport = (appointments: Appointment[]): AppointmentReport => {
  const totalAppointments = appointments.length;
  const attendedAppointments = appointments.filter((appointment) => appointment.attended).length;
  const noShowAppointments = totalAppointments - attendedAppointments;

  return {
    totalAppointments,
    attendedAppointments,
    noShowAppointments,
    noShowRate: totalAppointments === 0 ? 0 : noShowAppointments / totalAppointments,
    appointmentsByCountry: countByCategory(appointments, (appointment) => appointment.country),
    appointmentsByBookingChannel: countByCategory(appointments, (appointment) => appointment.bookingChannel),
    averageNoShowRiskScore: averageBy(appointments, (appointment) => appointment.noShowRiskScore),
  };
};

export const buildClaimsReport = (claims: Claim[]): ClaimsReport => {
  const totalClaims = claims.length;
  const deniedClaims = claims.filter((claim) => claim.status === "Denied").length;
  const paidClaims = claims.filter((claim) => claim.status === "Paid").length;

  return {
    totalClaims,
    totalClaimAmountUsd: sumBy(claims, (claim) => claim.amountUsd),
    deniedClaims,
    paidClaims,
    denialRate: totalClaims === 0 ? 0 : deniedClaims / totalClaims,
    collectionRate: totalClaims === 0 ? 0 : paidClaims / totalClaims,
    amountByPayerType: Object.entries(groupBy(claims, (claim) => claim.payerType)).reduce<Record<string, number>>(
      (accumulator, [payerType, payerClaims]) => {
        accumulator[payerType] = sumBy(payerClaims, (claim) => claim.amountUsd);
        return accumulator;
      },
      {},
    ),
    maxClaimAmountUsd: maxBy(claims, (claim) => claim.amountUsd),
    minClaimAmountUsd: minBy(claims, (claim) => claim.amountUsd),
    averageClaimAmountUsd: averageBy(claims, (claim) => claim.amountUsd),
  };
};

export const buildWorkforceReport = (employees: Employee[]): WorkforceReport => {
  const now = Date.now();
  const ninetyDaysFromNow = now + 90 * 24 * 60 * 60 * 1000;

  return {
    totalEmployees: employees.length,
    employeesByRoleType: countByCategory(employees, (employee) => employee.roleType),
    averageTimeToHireDays: averageBy(employees, (employee) => employee.timeToHireDays),
    averageCmeCompletionRate: averageBy(employees, (employee) => {
      if (employee.cmeHoursRequired <= 0) {
        return 0;
      }
      return employee.cmeHoursCompleted / employee.cmeHoursRequired;
    }),
    expiringLicensesIn90Days: employees.filter((employee) => {
      if (!employee.licenseExpiryDate) {
        return false;
      }

      const expiryTime = new Date(employee.licenseExpiryDate).getTime();
      return expiryTime >= now && expiryTime <= ninetyDaysFromNow;
    }).length,
  };
};

export const buildExecutiveLeadershipKpiReport = (
  appointments: Appointment[],
  claims: Claim[],
): ExecutiveLeadershipKpiReport => {
  const appointmentVolume = appointments.length;
  const noShowRate = appointmentVolume === 0 ? 0 : appointments.filter((appointment) => !appointment.attended).length / appointmentVolume;
  const claimsDenialRate =
    claims.length === 0 ? 0 : claims.filter((claim) => claim.status === "Denied").length / claims.length;

  const revenueByCountryUsd = Object.entries(groupBy(claims, (claim) => claim.country)).reduce<Record<string, number>>(
    (accumulator, [country, countryClaims]) => {
      accumulator[country] = sumBy(countryClaims, (claim) => claim.amountUsd);
      return accumulator;
    },
    {},
  );

  const patientSatisfactionAverageByCountry = Object.entries(groupBy(appointments, (appointment) => appointment.country)).reduce<
    Record<string, number>
  >((accumulator, [country, countryAppointments]) => {
    const scoredAppointments = countryAppointments.filter(
      (appointment): appointment is Appointment & { patientSatisfactionScore: number } =>
        appointment.patientSatisfactionScore !== null,
    );

    accumulator[country] =
      scoredAppointments.length === 0
        ? 0
        : averageBy(scoredAppointments, (appointment) => appointment.patientSatisfactionScore);
    return accumulator;
  }, {});

  return {
    appointmentVolume,
    noShowRate,
    claimsDenialRate,
    revenueByCountryUsd,
    patientSatisfactionAverageByCountry,
  };
};
