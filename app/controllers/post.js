import postModel from '../models/post';
import commentModel from '../models/comment';

const index = async (ctx, _next) => {
  const author = ctx.query.author;
  const posts = await postModel.getPosts(author);
  try {
    const locals = {
      title: '首页',
      posts
    };
    await ctx.render('posts/index', locals);
  } catch (e) {
    console.log(e.message);
  }
};

const newPost = async (ctx, _next) => {
  const locals = {
    title: 'New'
  };
  await ctx.render('posts/new', locals);
};

const createPost = async (ctx, _next) => {
  const author = ctx.session.user._id;
  const title = ctx.request.body.title;
  const content = ctx.request.body.content;
  try {
    console.log('校检参数');
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    console.log('校检参数出错');
    ctx.flash('error', e.message);
    ctx.redirect('back');
  }
  let post = {
    author,
    title,
    content,
    pv: 0
  };
  try {
    const result = await postModel.create(post);
    post = result.ops[0];
    ctx.flash('success', '发表成功');
    ctx.redirect(`/posts/${post._id}`);
  } catch (e) {
    console.log(e.message);
    ctx.redirect('/posts/new');
  }
};

const show = async (ctx, _next) => {
  const postId = ctx.params.postId;
  try {
    const result = await Promise.all([
      postModel.getPostById(postId),
      commentModel.getComments(postId),
      postModel.incPv(postId)
    ]);
    const post = result[0];
    const comments = result[1];
    if (!post) {
      throw new Error('该文章不存在');
    }
    const locals = {
      title: post.title,
      post,
      comments
    };
    await ctx.render('posts/show', locals);
  } catch (e) {
    console.log(e.message);
  }
};

const edit = async (ctx, _next) => {
  const postId = ctx.params.postId;
  const author = ctx.session.user._id;
  try {
    const post = await postModel.getRawPostById(postId, author);
    if (!post) {
      throw new Error('该文章不存在');
    }
    if (author.toString() !== post.author._id.toString()) {
      throw new Error('权限不足');
    }
    const locals = {
      post,
      title: '编辑文章'
    };
    await ctx.render('posts/edit', locals);
  } catch (e) {
    console.log(e.message);
  }
};

const update = async (ctx, _next) => {
  const postId = ctx.params.postId;
  const author = ctx.session.user._id;
  const title = ctx.request.body.title;
  const content = ctx.request.body.content;
  try {
    await postModel.updatePostById(postId, author, { title, content });
    ctx.flash('success', '更新成功');
    ctx.redirect(`/posts/${postId}`);
  } catch (e) {
    console.log(e.message);
  }
};

const destroy = async (ctx, _next) => {
  const postId = ctx.params.postId;
  const author = ctx.session.user._id;
  try {
    await postModel.delPostById(postId, author);
    ctx.flash('success', '删除文章成功');
    ctx.redirect('/');
  } catch (e) {
    console.log(e.message);
  }
};

export default {
  index,
  newPost,
  createPost,
  show,
  edit,
  update,
  destroy
};
