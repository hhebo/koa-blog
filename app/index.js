import Koa from 'koa';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import views from 'koa-views';
import convert from 'koa-convert';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import flash from 'koa-flash2';
import koaLoggerWinston from 'koa-logger-winston';
import path from 'path';
import redis from 'redis';

import router from './routes/index';
import config from '../config/default';
import middlewares from './middlewares';
import logger from '../config/logger';

const app = new Koa();

// const client = redis.createClient(config.redis_port, config.redis_host);

app.keys = ['keys'];

app.use(convert(session(app)));

app.use(bodyParser());

app.use(convert(json()));

app.use(views(path.join(__dirname, '/views'), { extension: 'ejs' }));

app.use(convert(require('koa-static')(path.join(__dirname, 'assets'))));

app.use(convert(flash()));

app.use(middlewares.addHelper);

app.use(koaLoggerWinston(logger.successLogger));

app.use(router.routes(), router.allowedMethods());

app.use(koaLoggerWinston(logger.errorLogger));

app.use(middlewares.catchError);

if (process.env.NODE_ENV === 'production') {
  const port = process.env.PORT || config.port;
  app.listen(port);
} else {
  app.listen(config.port);
}

export default app;
