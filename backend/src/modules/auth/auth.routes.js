import { Router } from 'express';
import {
  loginHandler,
  registerHandler,
  updateProfileHandler,
} from './auth.controller.js';
import { loginSchema, registerSchema, updateProfileSchema } from './auth.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: registerSchema }),
  registerHandler
);

router.post('/login', validateRequest({ body: loginSchema }), loginHandler);

router.patch(
  '/me',
  requireAuth,
  validateRequest({ body: updateProfileSchema }),
  updateProfileHandler
);

export default router;
