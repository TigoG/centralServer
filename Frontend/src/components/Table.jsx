import React, { useEffect, useState } from "react";
import "./Table.css";

function Table({ data, onSelect = () => {}, selectedId = null }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Student nummer</th>
            <th>Location</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              role="button"
              tabIndex={0}
              className={row.id === selectedId ? "selected" : ""}
              onClick={() => onSelect(row.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelect(row.id);
              }}
            >
              <td>{row.id}</td>
              <td>
                {row.lon}, {row.lat}
              </td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(row.id);
                  }}
                >
                  Actuator
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
