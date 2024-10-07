const express = require('express')
const path = require('path')
const app = express()

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json({ limit: '50mb' })) // Increase the limit if necessary


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
