import type { InternalDataItem } from "../types";

interface InternalDataListProps {
  data: InternalDataItem[];
}

export function InternalDataList({ data }: InternalDataListProps) {
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
          Internal Data
        </h3>
      </div>
      
      <div style={{ padding: "1rem" }}>
        {data.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "1rem",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "0.5rem"
            }}
          >
            <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
              {item.name}
            </div>
            <div style={{ color: "#6b7280", marginBottom: "0.25rem" }}>
              Value: {item.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Created: {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}