const path = require("path");
const express = require("express");
const next = require("next");
const mongoose = require('mongoose')


const app = next({
    dir: path.join(path.dirname(require.main.filename || process.mainModule.filename), 'app'),
    dev: process.env.NODE_ENV !== "production"
})

const handle = app.getRequestHandler()
app.prepare()
    .then(async () => {
        const server = express()

        server.use(express.json())

        server.use('/api', require('./routes/auth.routes'))



        server.get('*', (req, res) => {
            return handle(req, res)
        })

        server.listen(process.env.PORT, (err) => {
            if (err) throw err
            console.log(`> Ready on http://localhost:${process.env.PORT}`)
        })
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('Mongo has been connecting')
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })
