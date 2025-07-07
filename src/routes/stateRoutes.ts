// routes/stateRoutes.ts
import { Router } from 'express';
import { getStates, getLocalGovernments } from '../controllers/stateController';

const router = Router();

// Route to get all states
router.get('/states', getStates);

// Route to get local governments by state ID
router.get('/lga/:stateId', getLocalGovernments);

export default router;
