import { Suspense } from "react";
import { useLoaderData, Link } from "react-router";
import { useQuery, useMutation } from "@apollo/client";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { GET_HEALTH_CHECK, GET_INTERNAL_DATA, CREATE_INTERNAL_DATA } from "~/lib/internal-queries";
import { createApolloClient } from "~/lib/apollo";

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
  const client = createApolloClient();

  try {
    const [healthResult, internalResult] = await Promise.all([
      client.query({ query: GET_HEALTH_CHECK }),
      client.query({ query: GET_INTERNAL_DATA }),
    ]);

    return {
      health: healthResult.data.health,
      internalData: internalResult.data.internalData,
      apolloState: client.cache.extract(),
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
  const [createData, { loading, error, data }] = useMutation(CREATE_INTERNAL_DATA, {
    refetchQueries: [{ query: GET_INTERNAL_DATA }],
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const value = formData.get('value') as string;

    createData({ variables: { name, value } });
    e.currentTarget.reset();
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
          disabled={loading}
          style={{
            backgroundColor: loading ? "#9ca3af" : "#3b82f6",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "0.25rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem"
          }}
        >
          {loading ? "Creating..." : "Create Data"}
        </button>
      </form>
      
      {error && (
        <div style={{ color: "#ef4444", marginTop: "0.5rem" }}>
          Error: {error.message}
        </div>
      )}
      
      {data && (
        <div style={{ color: "#10b981", marginTop: "0.5rem" }}>
          Successfully created: {data.createInternalData.name}
        </div>
      )}
    </div>
  );
}

export default function Internal() {
  const { health, internalData } = useLoaderData<LoaderData>();

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
      
      <h1 style={{ marginBottom: "2rem" }}>Internal GraphQL API</h1>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        <HealthStatus health={health} />
        <CreateDataForm />
      </div>
      
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading internal data...</p>
        </div>
      }>
        <InternalDataList data={internalData} />
      </Suspense>
    </div>
  );
}