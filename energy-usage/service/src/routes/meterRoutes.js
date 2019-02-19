

const Router = require('koa-router');

const router = new Router();
const meterService = require('./../services/meterService');


router.get('/api/v1/meter', async (ctx) => {
  try {
    const meterReads = await meterService.list();
    if (meterReads) {
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        data: meterReads,
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'The data is empty.',
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.',
    };
  }
});

router.post('/api/v1/meter', async (ctx) => {
  const data = ctx.request.body;
  try {
    const inserted = await meterService.create(data);
    if (inserted) {
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        data: inserted,
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Something went wrong.',
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.',
    };
  }
});

router.get('/api/v1/energy-usage', async (ctx) => {
  const date = ctx.query.date || ctx.params.date || ctx.date;

  try {
    const usage = await meterService.getUsageByMonth(date);
    if (usage || usage === 0) {
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        data: usage,
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'The data is empty.',
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.',
    };
  }
});


module.exports = router;
