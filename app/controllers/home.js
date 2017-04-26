const index = async (ctx, next) => {
  await ctx.redirect('/posts');
  // const locals = {
  //   title: 'home',
  // };
  // await ctx.render('home/index', locals);
};

export default {
  index
};
