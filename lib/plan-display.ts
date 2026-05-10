export type PlanBoxData = {
  planLabel: string;
  durationDays: number | null;
  durationLabel: string;
};

const inferDurationDaysFromPlan = (planLabel?: string | null): number | null => {
  const value = (planLabel || "").toLowerCase();

  const monthMatch = value.match(/(\d+)\s*mois/);
  if (monthMatch) {
    const months = Number(monthMatch[1]);
    return Number.isFinite(months) && months > 0 ? months * 30 : null;
  }

  const weekMatch = value.match(/(\d+)\s*semaines?/);
  if (weekMatch) {
    const weeks = Number(weekMatch[1]);
    return Number.isFinite(weeks) && weeks > 0 ? weeks * 7 : null;
  }

  const dayMatch = value.match(/(\d+)\s*jours?/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return Number.isFinite(days) && days > 0 ? days : null;
  }

  const yearMatch = value.match(/(\d+)\s*ans?/);
  if (yearMatch) {
    const years = Number(yearMatch[1]);
    return Number.isFinite(years) && years > 0 ? years * 365 : null;
  }

  return null;
};

export const getPlanBoxData = (
  planLabel?: string | null,
  fallbackDurationDays?: number | null
): PlanBoxData => {
  const normalizedPlan = (planLabel || "").trim() || "Standard";
  const dbDuration =
    typeof fallbackDurationDays === "number" && fallbackDurationDays > 0
      ? Math.round(fallbackDurationDays)
      : null;
  const durationDays = dbDuration ?? inferDurationDaysFromPlan(planLabel);

  return {
    planLabel: normalizedPlan,
    durationDays,
    durationLabel: durationDays ? `${durationDays} jours` : "Flexible",
  };
};
