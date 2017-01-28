const { createServer } = require('http')
const { createReadStream } = require('fs')

const server = createServer( (req, res) => {
  console.log(new Date(), req.url)
  createReadStream('./test.json').pipe(res)
})

server.listen(2112)
