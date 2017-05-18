import Mongolass from 'mongolass';
import moment from 'moment';
import objectIdToTimestamp from 'objectid-to-timestamp';
import config from '../config/default';

const mongolass = new Mongolass('mongodb://tmac:00..@ds137441.mlab.com:37441/koa-blog');

mongolass.plugin('addCreatedAt', {
  afterFind(results) {
    results.forEach((item) => {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne(result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

const User = mongolass.model('user', {
  name: { type: 'string' },
  password: { type: 'string' },
  avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'] },
  bio: { type: 'string' }
});

User.index({ name: 1 }, { unique: true }).exec();

const Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId },
  title: { type: 'string' },
  content: { type: 'string' },
  pv: { type: 'number' }
});

Post.index({ author: -1, _id: -1 }).exec();

const Comments = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' },
  postId: { type: Mongolass.Types.ObjectId }
});

Comments.index({ postId: 1, _id: 1 }).exec();
Comments.index({ author: 1, _id: 1 }).exec();

export default {
  User,
  Post,
  Comments
};
