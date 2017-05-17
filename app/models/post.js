import marked from 'marked';
import db from '../../db/mongo';
import commentModel from './comment';

db.Post.plugin('contentToHtml', {
  afterFind(posts) {
    return posts.map((post) => {
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne(post) {
    if (post) {
      post.content = marked(post.content);
    }
    return post;
  }
});

db.Post.plugin('addCommentsCount', {
  afterFind(posts) {
    return Promise.all(posts.map((post) => {
      return commentModel.getCommentsCount(post._id).then((commentsCount) => {
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },
  afterFindOne(post) {
    if (post) {
      return commentModel.getCommentsCount(post._id).then((count) => {
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }
});

module.exports = {
  create: function create(post) {
    return db.Post.create(post).exec();
  },
  getPostById: function getPostById(postId) {
    return db.Post.findOne({ _id: postId })
                  .populate({ path: 'author', model: 'User' })
                  .addCreatedAt()
                  .addCommentsCount()
                  .contentToHtml()
                  .exec();
  },
  getPosts: function getPosts(author) {
    let query = {};
    if (query) {
      query.author = author;
    }
    if (query.author === undefined) {
      query = {};
    }
    return db.Post.find(query)
                  .populate({ path: 'author', model: 'User' })
                  .sort({ _id: -1 })
                  .addCreatedAt()
                  .addCommentsCount()
                  .contentToHtml()
                  .exec();
  },
  incPv: function incPv(postId) {
    return db.Post.update({ _id: postId }, { $inc: { pv: 1 } }).exec();
  },
  getRawPostById: function getRawPostById(postId) {
    return db.Post.findOne({ _id: postId })
                  .populate({ path: 'author', model: 'User' })
                  .exec();
  },
  updatePostById: function updatePostById(postId, author, data) {
    return db.Post.update({ author, _id: postId }, { $set: data }).exec();
  },
  delPostById: function delPostById(postId, author) {
    return db.Post.remove({ author, _id: postId })
                  .exec()
                  .then((res) => {
                    if (res.result.ok && res.result.n > 0) {
                      commentModel.delCommentsByPostId(postId);
                    }
                  });
  }
};
