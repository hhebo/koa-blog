import fs from 'fs';
import path from 'path';
import Router from 'koa-router';

const router = Router();

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file.split('.').slice(-1)[0] === 'js') && (file !== 'index.js');
  }).forEach((file) => {
    const route = require(path.join(__dirname, file));
    router.use(route.routes(), route.allowedMethods());
  });

export default router;
