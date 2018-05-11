import { startServer } from "../startServer"
const { config } = require('dotenv')
export const setup = async () => {
  config()
  const app = await startServer()
  const { port } = app.address()
  process.env.TEST_HOST = `http://127.0.0.1:${port}`
}