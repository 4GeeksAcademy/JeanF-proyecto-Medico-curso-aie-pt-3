import {
  binarySearch,
  buildAppointmentReport,
  buildClaimsReport,
  buildExecutiveLeadershipKpiReport,
  buildWorkforceReport,
  evaluateHealthCoreBaseline,
  filterByCriteria,
  linearSearch,
  sortBy,
  validateHealthCoreDataset,
} from "../main";
import { sampleAppointments, sampleClaims, sampleDataset } from "./sampleData";

export interface QuickChecksResult {
  ukAppointmentsCount: number;
  sortedClaimAmountsDesc: number[];
  linearSearchAppointmentIndex: number;
  binarySearchClaimAmountIndex: number;
  appointmentReport: ReturnType<typeof buildAppointmentReport>;
  claimsReport: ReturnType<typeof buildClaimsReport>;
  workforceReport: ReturnType<typeof buildWorkforceReport>;
  executiveKpiReport: ReturnType<typeof buildExecutiveLeadershipKpiReport>;
  baselineCheck: ReturnType<typeof evaluateHealthCoreBaseline>;
  datasetValidation: ReturnType<typeof validateHealthCoreDataset>;
}

export const runQuickChecks = (): QuickChecksResult => {
  const ukAppointments = filterByCriteria(sampleAppointments, { country: "UK" });

  const claimsSortedDesc = sortBy(sampleClaims, (claim) => claim.amountUsd, "desc");
  const claimsSortedAsc = sortBy(sampleClaims, (claim) => claim.amountUsd, "asc");
  const appointmentTarget = sampleAppointments.find((appointment) => appointment.appointmentId === "APT-003");
  const claimTarget = claimsSortedAsc.find((claim) => claim.amountUsd === 210);

  return {
    ukAppointmentsCount: ukAppointments.length,
    sortedClaimAmountsDesc: claimsSortedDesc.map((claim) => claim.amountUsd),
    linearSearchAppointmentIndex: appointmentTarget
      ? linearSearch(sampleAppointments, appointmentTarget, (item, target) => item.appointmentId.localeCompare(target.appointmentId))
      : -1,
    binarySearchClaimAmountIndex: claimTarget
      ? binarySearch(claimsSortedAsc, claimTarget, (item, target) => item.amountUsd - target.amountUsd)
      : -1,
    appointmentReport: buildAppointmentReport(sampleAppointments),
    claimsReport: buildClaimsReport(sampleClaims),
    workforceReport: buildWorkforceReport(sampleDataset.employees),
    executiveKpiReport: buildExecutiveLeadershipKpiReport(sampleAppointments, sampleClaims),
    baselineCheck: evaluateHealthCoreBaseline(sampleAppointments, sampleClaims, sampleDataset.employees),
    datasetValidation: validateHealthCoreDataset(sampleDataset),
  };
};
