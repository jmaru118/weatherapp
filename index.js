const express = require('express')
const helmet = require('helmet');
const app = express()
const port = 3000

app.use(helmet({
    frameguard: {         // configure
      action: 'deny'
    },
    contentSecurityPolicy: {    // enable and configure
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
      }
    },
    dnsPrefetchControl: false     // disable
  }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
