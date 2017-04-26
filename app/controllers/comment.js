import commentModel from '../models/comment';

const create = async (ctx, next) => {
  let author = ctx.session.user._id;
  let postId = ctx.params.postId;
  let content = ctx.request.body.content;
  let comment = {
    author: author,
    postId: postId,
    content: content
  };
  try{
    let result = await commentModel.create(comment);
    ctx.flash('success', '留言成功');
    ctx.redirect('back');
  }catch(e){
    console.log(e.message);
  }
};

const destroy = async (ctx, next) => {
  let commentId = ctx.params.commentId;
  let author = ctx.session.user._id;
  try{
    await commentModel.delCommentById(commentId, author);
    ctx.redirect('back');
  }catch(e){
    console.log(e.message);
  }
};

export default {
  create,
  destroy
};
