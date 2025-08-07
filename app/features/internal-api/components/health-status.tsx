import type { HealthCheck } from "../types";

interface HealthStatusProps {
  health: HealthCheck;
}

export function HealthStatus({ health }: HealthStatusProps) {
  const statusColor = health.status === 'healthy' ? '#10b981' : '#ef4444';
  
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      padding: "1.5rem",
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: statusColor,
          marginRight: "0.5rem"
        }} />
        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
          Server Status
        </h3>
      </div>
      
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>Status:</strong> {health.status}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>Message:</strong> {health.message}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>Version:</strong> {health.version}
      </div>
      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
        <strong>Last Check:</strong> {new Date(health.timestamp).toLocaleString()}
      </div>
    </div>
  );
}