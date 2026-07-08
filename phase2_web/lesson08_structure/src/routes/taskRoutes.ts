import { Router } from "express";
import { index, show, destroy, create } from "../controllers/taskController.ts";

const router = Router();

router.get('/', index)
router.get('/:id', show)
router.post('/', create)
router.delete('/:id', destroy)


export default router