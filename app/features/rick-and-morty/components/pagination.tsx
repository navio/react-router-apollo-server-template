import { Link } from "react-router";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function Pagination({ currentPage, totalPages, hasNext, hasPrev }: PaginationProps) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      gap: "1rem", 
      marginTop: "2rem" 
    }}>
      {hasPrev && (
        <Link
          to={`/characters?page=${currentPage - 1}`}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.25rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
        >
          ← Previous
        </Link>
      )}
      
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#f8fafc",
        borderRadius: "0.25rem",
        fontSize: "0.875rem"
      }}>
        <span style={{ fontWeight: "500" }}>Page {currentPage}</span>
        <span style={{ color: "#6b7280" }}>of</span>
        <span style={{ fontWeight: "500" }}>{totalPages}</span>
      </div>

      {hasNext && (
        <Link
          to={`/characters?page=${currentPage + 1}`}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.25rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
        >
          Next →
        </Link>
      )}
    </div>
  );
}