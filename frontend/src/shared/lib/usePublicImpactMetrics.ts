import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicImpact } from "@/shared/lib/api/stats";

export type PublicImpactMetricCard = {
  change: string;
  value: string;
  label: string;
  note: string;
  positive?: boolean;
};

export type PublicImpactMetricsStatus = "loading" | "ready" | "error";

const DEFAULT_RANGE = "month" as const;
const DEFAULT_REFRESH_INTERVAL_MS = 30000;

interface UsePublicImpactMetricsOptions {
  enabled?: boolean;
  range?: "month" | "quarter" | "year";
  refreshIntervalMs?: number;
  token?: string | null;
}

const translateImpactLabel = (label: string): string => {
  const map: Record<string, string> = {
    "Total Meals Provided": "Refeições Proporcionadas",
    "Meals Provided": "Refeições Entregues",
    "Active Volunteers": "Voluntários Ativos",
    "Food Rescued": "Alimentos Resgatados (kg)",
    "Donations Processed": "Doações Recebidas",
    "Beneficiaries Served": "Pessoas Beneficiadas",
    "Food Distributed": "Volume Redistribuído",
    "Participating Supermarkets": "Parceiros Cadastrados",
    "Families Supported": "Famílias Atendidas",
  };
  return map[label] || label;
};

const translateImpactNote = (note: string): string => {
  if (!note) return "";
  return note
    .replace(/vs last month/gi, "em relação ao mês anterior")
    .replace(/vs previous month/gi, "em relação ao mês anterior")
    .replace(/vs last quarter/gi, "em relação ao trimestre anterior")
    .replace(/vs last year/gi, "em relação ao ano anterior")
    .replace(/this month/gi, "neste mês")
    .replace(/across all locations/gi, "em todos os pontos de coleta")
    .replace(/across network/gi, "em toda a rede Colhe+");
};

const mapPublicImpactMetrics = (
  metrics: Array<{
    change: string;
    value: string;
    label: string;
    note: string;
    positive?: boolean;
  }>,
): PublicImpactMetricCard[] =>
  metrics.map((metric) => ({
    change: metric.change,
    value: metric.value,
    label: translateImpactLabel(metric.label),
    note: translateImpactNote(metric.note),
    positive: metric.positive,
  }));

export function usePublicImpactMetrics({
  enabled = true,
  range = DEFAULT_RANGE,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
  token = null,
}: UsePublicImpactMetricsOptions = {}) {
  const [impactMetrics, setImpactMetrics] = useState<PublicImpactMetricCard[]>(
    [],
  );
  const [status, setStatus] = useState<PublicImpactMetricsStatus>(
    enabled ? "loading" : "ready",
  );
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const refreshImpactMetrics = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!enabled) return;
      if (!silent) {
        setStatus((current) => (current === "ready" ? current : "loading"));
      }
      const requestId = ++requestIdRef.current;
      try {
        const response = await getPublicImpact(range, token ?? undefined);
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;
        if (
          !Array.isArray(response.impactMetrics) ||
          response.impactMetrics.length === 0
        ) {
          setStatus("error");
          return;
        }
        setImpactMetrics(mapPublicImpactMetrics(response.impactMetrics));
        setStatus("ready");
      } catch {
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;
        setStatus("error");
      }
    },
    [enabled, range, token],
  );

  useEffect(() => {
    isMountedRef.current = true;
    if (!enabled) {
      setImpactMetrics([]);
      setStatus("ready");
      return () => {
        isMountedRef.current = false;
      };
    }
    setStatus("loading");
    void refreshImpactMetrics();
    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, refreshImpactMetrics]);

  useEffect(() => {
    if (!enabled || refreshIntervalMs <= 0) return;
    const refreshVisibleMetrics = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      )
        return;
      void refreshImpactMetrics({ silent: true });
    };
    const intervalId = window.setInterval(
      refreshVisibleMetrics,
      refreshIntervalMs,
    );
    window.addEventListener("focus", refreshVisibleMetrics);
    document.addEventListener("visibilitychange", refreshVisibleMetrics);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshVisibleMetrics);
      document.removeEventListener("visibilitychange", refreshVisibleMetrics);
    };
  }, [enabled, refreshImpactMetrics, refreshIntervalMs]);

  return { impactMetrics, status, refreshImpactMetrics };
}
