interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    Alive: "#10b981",
    Dead: "#ef4444",
    unknown: "#6b7280"
  };

  return (
    <span style={{
      backgroundColor: colors[status as keyof typeof colors] || colors.unknown,
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }}>
      {status}
    </span>
  );
}