

const dataService = require('./../data/data');
const moment = require('moment');

const dbDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';

/**
 * Check whether a moment object is the end of the month.
 * Ignore the time part.
 * @param {moment} mmt
 */
function isEndOfMonth(mmt) {
  // startOf allows to ignore the time component
  // we call moment(mmt) because startOf and endOf mutate the momentj object.
  return moment
    .utc(mmt)
    .startOf('day')
    .isSame(moment
      .utc(mmt)
      .endOf('month')
      .startOf('day'));
}

/**
 * Returns the difference between two moment objects in number of days.
 * @param {moment} mmt1
 * @param {moment} mm2
 */
function getDiffInDays(mmt1, mm2) {
  return mmt1.diff(mm2, 'days');
}

/**
 * Return the number of days between the given moment object
 * and the end of the month of this moment object.
 * @param {moment} mmt
 */
function getDaysUntilMonthEnd(mmt) {
  return getDiffInDays(moment.utc(mmt).endOf('month'), mmt);
}

function estimateMonthReading(meterReading) {

  let monthReading = meterReading.cumulative;
  const date = moment(meterReading.reading_date);

  if (!isEndOfMonth(date)) {

    const daysUntilMonthEnd = getDaysUntilMonthEnd(date);
    const dayOfTheMonth = date.date();

    monthReading = ((monthReading * (dayOfTheMonth + daysUntilMonthEnd)) / dayOfTheMonth);
  }

  return monthReading;
}


/**
 * Returns the estimated energy usage in the @param {Date} date's month
 * The calculation is reflected in the following equation:
 *
 * EnergyUsage(month M) = MeterReading(last day of month M) - MeterReading(last day of month M-1).
 */
async function getUsageByMonth(date) {
  const mmtMonthBefore = moment(date, dbDateFormat);
  mmtMonthBefore.subtract(1, 'months');

  let firstDayOfTheMonth = mmtMonthBefore.startOf('month').format(dbDateFormat);
  let lastDayOfTheMonth = mmtMonthBefore.endOf('month').format(dbDateFormat);


  let q = `SELECT * 
    FROM meter_reads
    WHERE reading_date >= Datetime(?)
    and reading_date <= Datetime(?) limit 1`;

  return new Promise(async (resolve, reject) => {
    const meterReadPreviousMonth = await dataService.select(q, [`${firstDayOfTheMonth}Z`, `${lastDayOfTheMonth}Z`]);

    if (!meterReadPreviousMonth) {
      return reject(new Error('No meter_reads were found for the previous month.'));
    }

    const mmt = moment(date, dbDateFormat);

    const prevMonthsEstimate = estimateMonthReading(meterReadPreviousMonth);

    firstDayOfTheMonth = mmt.startOf('month').format(dbDateFormat);
    lastDayOfTheMonth = mmt.endOf('month').format(dbDateFormat);


    q = `SELECT * 
                FROM meter_reads
                WHERE reading_date >= Datetime(?)
                and reading_date <= Datetime(?)
                ORDER BY date(reading_date) DESC Limit 1`;

    const meterReadGivenMonth =
        await dataService.select(q, [firstDayOfTheMonth, lastDayOfTheMonth]);

    if (!meterReadGivenMonth) {
      return reject(new Error('No meter_reads were found for the given month.'));
    }

    const givenMonthsEstimate = estimateMonthReading(meterReadGivenMonth);

    return resolve(givenMonthsEstimate - prevMonthsEstimate);
  });
}

/**
 *
 Returns all meter readings present in the current data base.
 *
 */
async function list() {
  return dataService.list();
}

/**
 *
 * Inserts a new meter read with the following fields: cumulative, reading_date and unit.
 *
 */
async function create(data) {
  return dataService
    .insert(data);
}


module.exports = {
  create,
  list,
  getUsageByMonth,
};
