import config from '../../config/default';

const addHelper = async (ctx, next) => {
  let currentUser = null;
  if (ctx.session.user) {
    currentUser = ctx.session.user;
  }
  if (!ctx.state) {
    ctx.state = {};
  }
  ctx.state.success = ctx.flash('success').toString();
  ctx.state.error = ctx.flash('error').toString();
  ctx.state.title = config.blog_title;
  ctx.state.description = config.blog_description;
  ctx.state.csrf = ctx.csrf;
  ctx.state.currentUser = currentUser;
  ctx.state.isUserSignIn = (currentUser != null);
  await next();
};

const catchError = async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) await ctx.render('error/error', { status: '404' });
  } catch (err) {
    let status = err.status || 500;
    if (status < 0) status = 500;
    ctx.status = status;
    ctx.state = {
      status: status,
      currentUser: null
    };
    if (status === 500) console.log('server error', err, ctx);
    await ctx.render('error/error', { status: status });
  }
};

export default {
  addHelper,
  catchError
}