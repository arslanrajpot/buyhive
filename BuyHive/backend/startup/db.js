
const {Pool}  = require("pg")
const pool = new Pool
(
    {
        user:"postgres",
        host:"localhost",
        password:"root",
        port:5432,
        database:"buyhive"
    },
)

async function query(text, params) {
    try {
      const { rows } = await pool.query(text, params);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
  }
  
module.exports =
{
    query,
}
