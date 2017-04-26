import fs from 'fs';
import crypto from 'crypto';
import userModel from '../models/user';

const newUser = async (ctx, next) => {
  const locals = {
    title: 'signup'
  };
  await ctx.render('users/signup', locals);
};

const createUser = async (ctx, next) => {
  let req = ctx.req;
  let name = req.body.name;
  let gender = req.body.gender;
  let bio = req.body.bio;
  let avatar;
  let password = req.body.password;
  let repassword = req.body.repassword;
  try {
    if (!(name.trim().length) >= 1 && name.trim().length <= 10) {
      ctx.flash('error','名字长度为1-10');
    }
    if (['m','f','x'].indexOf(gender) === -1) {
      ctx.flash('error','性别不对');
    }
    if (!(bio.trim().length >= 1 && bio.trim().length <= 30)) {
      ctx.flash('error','简介不能超过30个字符');
    }
    if (!ctx.req.file.originalname) {
      ctx.flash('error','需要上传头像');
    }
    if (password.length < 6) {
      ctx.flash('error','密码长度必须大于6');
    }
    if (password !== repassword) {
      ctx.flash('error','两次密码不同');
    }
    avatar = req.file.path.split('/').pop();
  } catch(e) {
    fs.unlink(ctx.req.file.path);
    ctx.flash('error',e.message);
    return ctx.redirect('/users/signup');
  }
  password = encrypt(password,'sha256');
  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };
  try {
    let create = await userModel.create(user);
    user = create.ops[0];
    user.password = null;
    ctx.session.user = user;
    ctx.flash('success','注册成功');
  } catch(e) {
    fs.unlink(ctx.req.file.path);
    if (e.message.match('E11000 duplicate key')) {
      ctx.flash('error','用户名已被占用');
      return ctx.redirect('/users/signup');
    }
  }
  ctx.redirect('/');
};

function encrypt(plainPassword,method){
  const hash = crypto.createHash(method);
  hash.update(plainPassword);
  return hash.digest('hex');
};

const signin = async (ctx, next) => {
  const locals = {
    title: 'signin'
  };
  await ctx.render('users/signin', locals)
};

const login = async (ctx, next) => {
  let name = ctx.request.body.name;
  let password = ctx.request.body.password;
  let user = await userModel.getUserByName(name);
  if (!user) {
    ctx.flash('error', '用户不存在');
    return ctx.redirect('back');
  }
  if(!auth(password,user.password)){
    ctx.flash('error', '用户名或者密码错误');
    return ctx.redirect('back');
  }
  ctx.flash('success', '登录成功');
  user.password = null;
  ctx.session.user = user;
  ctx.redirect('/');
};

function auth(plainPassword,encryPassword){
  let hash = crypto.createHash('sha256');
  hash.update(plainPassword);
  return hash.digest('hex') === encryPassword ;
};

const signout = async (ctx, next) => {
  ctx.session.user  =null;
  ctx.flash('success', '登出成功');
  ctx.redirect('/');
};

export default {
  newUser,
  createUser,
  signin,
  login,
  signout
};
