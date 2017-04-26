import helpers from '../helpers';

async function addHelper(ctx, next) {
  let currentUser = null;
  if(ctx.session.user){
    currentUser = ctx.session.user;
  }
  if (!ctx.state) {
    ctx.state = {};
  }
  ctx.state.csrf = ctx.csrf;
  ctx.state.helpers = helpers;
  ctx.state.currentUser = currentUser;
  ctx.state.isUserSignIn = (currentUser != null);
  await next();
}

export default {
  addHelper
}