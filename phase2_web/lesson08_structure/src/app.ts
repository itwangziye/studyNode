import express from "express"
import { logger, notFound } from "./middlewares/logger.ts"
import taskRoutes from "./routes/taskRoutes.ts"


const app = express();

app.use(express.json())
app.use(logger)


app.use('/tasks', taskRoutes)

app.use(notFound)

export default app