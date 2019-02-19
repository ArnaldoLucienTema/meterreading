const sqlite3 = require('sqlite3').verbose();
const sampleData = require('../../sampleData.json');

const connection = new sqlite3.Database(':memory:');

async function insert(data) {
  return new Promise((resolve, reject) => {
    connection.run(
      `INSERT INTO 
            meter_reads (cumulative, reading_date, unit) 
            VALUES (?, ?, ?)`,
      [data.cumulative, data.readingDate, data.unit],
      (err) => {
        if (err) {
          reject(err.message);
        }
        resolve(true);
      },
    );
  });
}

/**
 * Imports the data from the sampleData.json file into a `meter_reads` table.
 * The table contains three columns - cumulative, reading_date and unit.
 *
 * An example query to get all meter reads,
 *   connection.all('SELECT * FROM meter_reads', (error, data) => console.log(data));
 *
 * Note, it is an in-memory database, so the data will be reset when the
 * server restarts.
 */
function initialize() {
  connection.serialize(() => {
    connection.run('CREATE TABLE meter_reads (cumulative INTEGER, reading_date TEXT, unit TEXT)');

    const { electricity } = sampleData;
    electricity
      .forEach(data => insert(data, (err) => {
        if (err) console.log(err.message);
      }));
  });
}

function close() {
  connection.close();
}

async function list() {
  return new Promise((resolve, reject) => {
    connection.all(
      'SELECT * FROM meter_reads ORDER BY date(reading_date) DESC', [],
      (err, rows) => {
        if (err) {
          reject(err.message);
        }
        resolve(rows);
      },
    );
  });
}

async function select(query, params) {
  return new Promise((resolve, reject) => {
    connection.get(
      query, params,
      (err, rows) => {
        if (err) {
          reject(err.message);
        }
        resolve(rows);
      },
    );
  });
}

module.exports = {
  initialize,
  connection,
  insert,
  list,
  select,
  close,
};
