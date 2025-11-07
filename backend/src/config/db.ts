import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT ?? "8007", 10),
});


// const pool = new Pool({
//   user: process.env.PGUSER || 'admin',
//   host: process.env.PGHOST || '145.24.237.211',
//   database: process.env.PGDATABASE || 'centraldb',
//   password: process.env.PGPASSWORD || 'adminadmin',
//   port: parseInt(process.env.PGPORT || '8007', 10),
// });

export default pool;
