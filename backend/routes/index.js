import { Router } from 'express';

import uploads      from './uploads.routes.js';
import auth         from './auth.routes.js';
import favorites    from './favorites.routes.js';
import downloads    from './downloads.routes.js';
import users        from './users.routes.js';
import resources    from './resources.routes.js';
import categories   from './categories.routes.js';
import banners      from './banners.routes.js';
import payments     from './payments.routes.js';
import health       from './health.routes.js';

const router = Router();

router.use('/upload', uploads);
router.use('/auth', auth);
router.use('/favorites', favorites);
router.use('/downloads', downloads);
router.use('/users', users);
router.use('/resources', resources);
router.use('/categories', categories);
router.use('/banners', banners);
router.use('/payments', payments);
router.use('/', health);

export default router;
