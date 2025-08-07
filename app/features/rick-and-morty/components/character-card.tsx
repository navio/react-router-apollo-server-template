import { Link } from "react-router";
import type { Character } from "../types";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      padding: "1rem",
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 4px 12px 0 rgba(0, 0, 0, 0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
    }}
    >
      <Link
        to={`/characters/${character.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img
          src={character.image}
          alt={character.name}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "0.25rem",
            marginBottom: "0.5rem"
          }}
        />
        <h3 style={{ margin: "0.5rem 0", fontSize: "1.1rem", fontWeight: "600" }}>
          {character.name}
        </h3>
        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          <p style={{ margin: "0.25rem 0" }}>
            <span style={{ fontWeight: "500" }}>Status:</span> 
            <span style={{ 
              color: character.status === 'Alive' ? '#10b981' : 
                     character.status === 'Dead' ? '#ef4444' : '#6b7280'
            }}>
              {character.status}
            </span>
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <span style={{ fontWeight: "500" }}>Species:</span> {character.species}
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <span style={{ fontWeight: "500" }}>Location:</span> {character.location.name}
          </p>
        </div>
      </Link>
    </div>
  );
}