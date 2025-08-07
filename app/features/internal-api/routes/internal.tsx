import { Suspense } from "react";
import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { InternalAPI } from "../services/api";
import { HealthStatus, InternalDataList, CreateDataForm } from "../components";
import type { HealthCheck, InternalDataItem } from "../types";

export const meta: MetaFunction = () => {
  return [
    { title: "Internal API - React Router + Apollo SSR" },
    { name: "description", content: "Internal GraphQL API integration" },
  ];
};

interface LoaderData {
  health: HealthCheck;
  internalData: InternalDataItem[];
  apolloState: any;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [health, internalData] = await Promise.all([
      InternalAPI.fetchHealthCheck(),
      InternalAPI.fetchInternalData(),
    ]);

    return {
      health,
      internalData,
      apolloState: {},
    };
  } catch (error) {
    console.error('Internal API error:', error);
    throw new Response("Failed to fetch internal data", { status: 500 });
  }
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