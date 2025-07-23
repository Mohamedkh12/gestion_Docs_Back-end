const HTTP_METHOD = {
  POST: 'POST'
}

function isPOST(method) {
  return method === HTTP_METHOD.POST
}

function isJSON(type) {
  return type.indexOf('application/json') > -1
}

module.exports = (req, res, next) => {
  const method = req.method,
        type = req.headers['content-type']
  if (isPOST(method) && isJSON(type)) {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      const parseBody = JSON.parse(body)
      req.body = parseBody
      next()
    })
  } else {
    next()
  }
}
