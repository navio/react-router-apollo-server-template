import { useMutation } from "@apollo/client";
import { CREATE_INTERNAL_DATA, GET_INTERNAL_DATA } from "../services/queries";

export function CreateDataForm() {
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