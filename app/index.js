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

let client = redis.createClient(config.redis_port, config.redis_host);

app.keys = ['keys'];

app.use(convert(session({
  store: redisStore({ client: client })
})));

app.use(bodyParser());

app.use(convert(json()));

app.use(views(__dirname + '/views', { extension: 'ejs' }));

app.use(convert(require('koa-static')(path.join(__dirname, '../public'))));

app.use(middlewares.addHelper);

app.use(convert(flash()));

app.use( async (ctx,next) => {
  Object.assign(ctx.state, {
    success: ctx.flash('success').toString(),
    error: ctx.flash('error').toString(),
    title: config.blog_title,
    description: config.blog_description
  });
  await next();
});

app.use(koaLoggerWinston(logger.successLogger));

app.use(router.routes(), router.allowedMethods());

app.use(koaLoggerWinston(logger.errorLogger));

app.use(async (ctx,next) => {
  if (ctx.status === 404) {
    await ctx.render('404',{ title: '404 Page'});
  }
  await next();
});

app.on('error',async (err,ctx) => {
  await ctx.render('500',{ title:'系统错误',error:err });
});

app.listen(3000);

export default app;
