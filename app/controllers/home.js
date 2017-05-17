const index = async (ctx, _next) => {
  await ctx.redirect('/posts');
};

export default {
  index
};
