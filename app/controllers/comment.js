import commentModel from '../models/comment';

const create = async (ctx, _next) => {
  const author = ctx.session.user._id;
  const postId = ctx.params.postId;
  const content = ctx.request.body.content;
  const comment = {
    author,
    postId,
    content
  };
  try {
    await commentModel.create(comment);
    ctx.flash('success', '留言成功');
    ctx.redirect('back');
  } catch (e) {
    console.log(e.message);
  }
};

const destroy = async (ctx, _next) => {
  const commentId = ctx.params.commentId;
  const author = ctx.session.user._id;
  try {
    await commentModel.delCommentById(commentId, author);
    ctx.redirect('back');
  } catch (e) {
    console.log(e.message);
  }
};

export default {
  create,
  destroy
};
