import React, { useEffect, useState } from "react";
import "./Table.css";

function Table() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      { id: 1, studentNummer: "0000001", location: "51.917279, 4.484359" },
      { id: 2, studentNummer: "0000002", location: "51.917280, 4.484360" },
      { id: 3, studentNummer: "0000003", location: "51.917281, 4.484361" },
      { id: 4, studentNummer: "0000004", location: "51.917282, 4.484362" },
      { id: 5, studentNummer: "0000005", location: "51.917283, 4.484363" },
      { id: 6, studentNummer: "0000006", location: "51.917284, 4.484364" },
      { id: 7, studentNummer: "0000007", location: "51.917285, 4.484365" },
      { id: 8, studentNummer: "0000008", location: "51.917286, 4.484366" },
      { id: 9, studentNummer: "0000009", location: "51.917287, 4.484367" },
      { id: 10, studentNummer: "0000010", location: "51.917288, 4.484368" },
      { id: 11, studentNummer: "0000011", location: "51.917289, 4.484369" },
      { id: 12, studentNummer: "0000012", location: "51.917290, 4.484370" },
      { id: 13, studentNummer: "0000013", location: "51.917291, 4.484371" },
      { id: 14, studentNummer: "0000014", location: "51.917292, 4.484372" },
      { id: 15, studentNummer: "0000015", location: "51.917293, 4.484373" },
    ]);
  }, []);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student nummer</th>
            <th>Location</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.studentNummer}</td>
              <td>{row.location}</td>
              <td>
                <button onClick={() => handleEdit(row.id)}>Actuator</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
