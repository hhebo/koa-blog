import Router from 'koa-router';
import comment from '../controllers/comment';

const router = Router({
  prefix: '/posts/:postId/comment'
});

router.post('/', comment.create);
router.get('/:commentId/destroy', comment.destroy);

module.exports = router;
