process.env.NODE_ENV = 'test';

const chai = require('chai');

const should = chai.should();
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const server = require('./../index.js');

describe('routes : meter', () => {
  describe('GET /api/v1/meter', () => {
    it('should return all meter readings', (done) => {
      chai.request(server)
        .get('/api/v1/meter')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // key-value pair of {"status": "success"}
          res.body.status.should.eql('success');
          // the first object in the data array should
          // have the right keys
          res.body.data[0].should.include.keys('cumulative', 'reading_date', 'unit');
          done();
        });
    });
  });

  describe('GET /api/v1/energy-usage', () => {
    it('should respond with a single estimation usage based on the given date\'s month', (done) => {
      chai.request(server)
        .get('/api/v1/energy-usage?date=2017-04-15T00:00:00.000Z')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 200 status code
          res.status.should.equal(200);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // key-value pair of {"status": "success"}
          res.body.status.should.eql('success');
          // the JSON response body should have a
          // key-value pair of { "status": "success","data": 179}
          res.body.data.should.equal(16054.428571428572);
          done();
        });
    });

    it('should throw an error if there were no readings in the previous month.', (done) => {
      chai.request(server)
        .get('/api/v1/energy-usage?date=2017-01-15T00:00:00.000Z')
        .end((err, res) => {
          // there should be a 404 status code
          res.status.should.equal(400);
          // the response should be JSON
          res.type.should.equal('application/json');
          // the JSON response body should have a
          // key-value pair of {"status": "error"}
          res.body.status.should.eql('error');
          // the JSON response body should have a
          // key-value pair of {"message": "That movie does not exist."}
          res.body.message.should.eql('No meter_reads were found for the previous month.');
          done();
        });
    });
  });

  describe('POST /api/v1/meter', () => {
    it('should return true if the meter was successfully added', (done) => {
      chai.request(server)
        .post('/api/v1/meter')
        .send({
          cumulative: '1000',
          readingDate: '2017-02-15T00:00:00.000Z',
          unit: 'kWh',
        })
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err);
          // there should be a 201 status code
          // (indicating that something was "created")
          res.status.should.equal(201);
          // the JSON response body should have a
          // key-value pair of {"status": "success"}
          res.body.status.should.eql('success');
          // the JSON response body should have a
          // key-value pair of {"data": 1 movie object}
          res.body.data.should.equal(true);
          done();
        });
    });
  });
});
