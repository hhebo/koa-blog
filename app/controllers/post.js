import postModel from '../models/post';
import commentModel from '../models/comment';

const index = async (ctx, next) => {
  let author = ctx.query.author;
  let posts = await postModel.getPosts(author);
  try {
    const locals = {
      title: '首页',
      posts: posts
    };
    await ctx.render('posts/index', locals);
  }catch(e){
    console.log(e.message);
  }
};

const newPost = async (ctx, next) => {
  const locals = {
    title: 'new post'
  };
  await ctx.render('posts/new', locals);
};

const createPost = async (ctx, next) => {
  let author = ctx.session.user._id;
  let title = ctx.request.body.title;
  let content = ctx.request.body.content;
  try {
    console.log('校检参数');
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch(e) {
    console.log('校检参数出错');
    ctx.flash('error',e.message);
    return ctx.redirect('back');
  }
  let post = {
    author : author,
    title : title,
    content : content,
    pv: 0
  };
  try {
    let result = await postModel.create(post);
    post = result.ops[0];
    ctx.flash('success', '发表成功');
    ctx.redirect(`/posts/${post._id}`);
  }catch(e){
    return ctx.redirect('/posts/new');
  }
};

const show = async (ctx, next) => {
  let postId = ctx.params.postId;
  try {
    let result = await Promise.all([
      postModel.getPostById(postId),
      commentModel.getComments(postId),
      postModel.incPv(postId)
    ]);
    let post = result[0];
    let comments = result[1];
    if(!post) {
      throw new Error('该文章不存在');
    }
    const locals = {
      title: post.title,
      post: post,
      comments: comments
    };
    await ctx.render('posts/show', locals);
  } catch(e) {
    console.log(e.message);
  }
};

const edit = async (ctx, next) => {
  let postId = ctx.params.postId;
  let author = ctx.session.user._id;
  try{
    let post = await postModel.getRawPostById(postId, author);
    if (!post) {
      throw new Error('该文章不存在');
    }
    if (author.toString() !== post.author._id.toString()) {
      throw new Error('权限不足');
    }
    const locals = {
      post: post,
      title:'编辑文章'
    };
    await ctx.render('posts/edit', locals);
  } catch(e) {
    console.log(e.message);
  }
};

const update = async (ctx, next) => {
  let postId = ctx.params.postId;
  let author = ctx.session.user._id;
  let title = ctx.request.body.title;
  let content = ctx.request.body.content;
  try{
    await postModel.updatePostById(postId,author, {title: title, content: content});
    ctx.flash('success', '更新成功');
    ctx.redirect(`/posts/${postId}`);
  }catch(e){
    console.log(e.message);
  }
};

const destroy = async (ctx, next) => {
  let postId = ctx.params.postId;
  let author = ctx.session.user._id;
  try {
    await postModel.delPostById(postId, author);
    ctx.flash('success', '删除文章成功');
    ctx.redirect('/');
  }catch(e){
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
