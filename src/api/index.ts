import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 18080

app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})