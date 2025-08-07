import { Suspense, useEffect, useState } from "react";
import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { ApolloService } from "~/services/apollo-service";
import { 
  useInternalStore, 
  useHealth, 
  useInternalData, 
  useHealthLoading, 
  useDataLoading, 
  useCreateLoading, 
  useInternalError,
  useEventBus,
  useAppStore 
} from "~/store";

export const meta: MetaFunction = () => {
  return [
    { title: "Internal API - React Router + Apollo SSR" },
    { name: "description", content: "Internal GraphQL API integration" },
  ];
};

interface HealthCheck {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

interface InternalDataItem {
  id: string;
  name: string;
  value: string;
  createdAt: string;
}

interface LoaderData {
  health: HealthCheck;
  internalData: InternalDataItem[];
  apolloState: any;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [health, internalData] = await Promise.all([
      ApolloService.fetchHealthCheck(),
      ApolloService.fetchInternalData(),
    ]);

    return {
      health,
      internalData,
    };
  } catch (error) {
    console.error('Internal API error:', error);
    throw new Response("Failed to fetch internal data", { status: 500 });
  }
}

function HealthStatus({ health }: { health: HealthCheck }) {
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

function InternalDataList({ data }: { data: InternalDataItem[] }) {
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

function CreateDataForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const createLoading = useCreateLoading();
  const error = useInternalError();
  const { createInternalData, clearError } = useInternalStore();
  const { addNotification } = useAppStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const value = formData.get('value') as string;

    try {
      await createInternalData({ name, value });
      e.currentTarget.reset();
      setSuccessMessage(`Successfully created: ${name}`);
      
      // Show notification
      addNotification({
        type: 'success',
        message: `Created internal data: ${name}`,
        duration: 3000,
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to create internal data',
        duration: 5000,
      });
    }
  };

  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      padding: "1.5rem",
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
    }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", fontWeight: "600" }}>
        Add Internal Data
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Name:
          </label>
          <input
            type="text"
            name="name"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.25rem",
              fontSize: "1rem"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Value:
          </label>
          <input
            type="text"
            name="value"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.25rem",
              fontSize: "1rem"
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={createLoading}
          style={{
            backgroundColor: createLoading ? "#9ca3af" : "#3b82f6",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "0.25rem",
            cursor: createLoading ? "not-allowed" : "pointer",
            fontSize: "1rem"
          }}
        >
          {createLoading ? "Creating..." : "Create Data"}
        </button>
      </form>
      
      {error && (
        <div style={{ color: "#ef4444", marginTop: "0.5rem" }}>
          Error: {error}
          <button
            onClick={clearError}
            style={{
              marginLeft: "0.5rem",
              background: "none",
              border: "none",
              color: "#ef4444",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {successMessage && (
        <div style={{ color: "#10b981", marginTop: "0.5rem" }}>
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default function Internal() {
  const { health: ssrHealth, internalData: ssrInternalData } = useLoaderData<LoaderData>();
  
  // Get Zustand state
  const health = useHealth();
  const internalData = useInternalData();
  const healthLoading = useHealthLoading();
  const dataLoading = useDataLoading();
  const error = useInternalError();
  const { fetchHealth, fetchInternalData, clearError } = useInternalStore();
  const { on } = useEventBus();
  
  // Initialize store with SSR data and set up event listeners
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Initialize with SSR data if store is empty
    if (!health && ssrHealth) {
      useInternalStore.setState({ health: ssrHealth });
    }
    if (internalData.length === 0 && ssrInternalData) {
      useInternalStore.setState({ internalData: ssrInternalData });
    }
    
    // Set up event listeners
    const unsubscribeDataUpdated = on('DATA_UPDATED', (event) => {
      if (event.payload && typeof event.payload === 'object' && 'type' in event.payload && event.payload.type === 'internal-data-created') {
        // Data was updated, could refresh if needed
        console.log('Internal data updated:', event.payload);
      }
    });
    
    return () => {
      unsubscribeDataUpdated();
    };
  }, [ssrHealth, ssrInternalData, health, internalData.length, on]);
  
  // Auto-refresh health status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealth();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchHealth]);
  
  // Error display
  if (error) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Home
          </Link>
        </div>
        
        <div style={{ 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "0.5rem", 
          padding: "1rem",
          color: "#b91c1c"
        }}>
          <h2 style={{ margin: "0 0 0.5rem 0" }}>Error Loading Internal Data</h2>
          <p style={{ margin: "0 0 1rem 0" }}>{error}</p>
          <div>
            <button
              onClick={clearError}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                marginRight: "0.5rem"
              }}
            >
              Clear Error
            </button>
            <button
              onClick={() => {
                fetchHealth();
                fetchInternalData();
              }}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Use store data or fallback to SSR data
  const displayHealth = health || ssrHealth;
  const displayData = internalData.length > 0 ? internalData : ssrInternalData;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}
        >
          ← Back to Home
        </Link>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Internal GraphQL API</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          {(healthLoading || dataLoading) && (
            <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Updating...
            </div>
          )}
          <button
            onClick={() => {
              fetchHealth();
              fetchInternalData();
            }}
            style={{
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "0.25rem",
              padding: "0.25rem 0.5rem",
              cursor: "pointer",
              fontSize: "0.75rem"
            }}
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        {displayHealth && <HealthStatus health={displayHealth} />}
        <CreateDataForm />
      </div>
      
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading internal data...</p>
        </div>
      }>
        <div style={{ 
          opacity: dataLoading ? 0.5 : 1,
          transition: "opacity 0.2s" 
        }}>
          <InternalDataList data={displayData} />
        </div>
      </Suspense>
    </div>
  );
}