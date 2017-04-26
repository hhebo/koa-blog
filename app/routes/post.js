import Router from 'koa-router';
import post from '../controllers/post';

const router = Router({
  prefix: '/posts'
});

router.get('/', post.index);
router.post('/', post.createPost);
router.get('/new', post.newPost);
router.get('/:postId', post.show);
router.get('/:postId/edit', post.edit);
router.post('/:postId/edit', post.update);
router.get('/:posId/destroy', post.destroy);

module.exports = router;
