import db from '../../db/mongo';

module.exports = {
  create: function create(user) {
    return db.User.create(user).exec();
  },
  getUserByName: function getUserByName(name) {
    return db.User.findOne({ name }).addCreatedAt().exec();
  }
};
