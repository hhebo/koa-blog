import marked from 'marked';
import db from '../../db/mongo';

db.Comments.plugin('contentToHtml', {
  afterFind(comments) {
    return comments.map((comment) => {
      comment.content = marked(comment.content);
      return comment;
    });
  },
  afterFindOne(comment) {
    if (comment) {
      comment.content = marked(comment.content);
    }
    return comment;
  }
});

module.exports = {
  create: function create(comment) {
    return db.Comments.create(comment).exec();
  },
  delCommentById: function delCommentById(commentId, author) {
    return db.Comments.remove({ author, _id: commentId }).exec();
  },
  delCommentsByPostId: function delCommentsByPostId(postId) {
    return db.Comments.remove({ postId }).exec();
  },
  getComments: function getComments(postId) {
    return db.Comments.find({ postId })
                      .populate({ path: 'author', model: 'User' })
                      .sort({ _id: 1 })
                      .addCreatedAt()
                      .contentToHtml()
                      .exec();
  },
  getCommentsCount: function getCommentsCount(postId) {
    return db.Comments.count({ postId }).exec();
  }
};
