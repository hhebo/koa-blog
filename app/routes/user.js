import Router from 'koa-router';
import multer from 'koa-multer';
import path from 'path';
import user from '../controllers/user';

const router = Router({
  prefix: '/users'
});

const upload = multer({
  dest: path.join(__dirname, '../../public/img')
});

router.get('/signup', user.newUser);
router.post('/signup', upload.single('avatar'), user.createUser);
router.get('/signin', user.signin);
router.post('/signin', user.login);
router.get('/signout', user.signout);

module.exports = router;