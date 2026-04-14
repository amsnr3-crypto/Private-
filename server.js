const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // fallback to index.html for SPA or not found
      const index = path.join(process.cwd(), 'index.html');
      fs.readFile(index, (err2, data2) => {
        if (err2) {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end('Not found');
          return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data2);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': type});
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Server error');
    });
  });
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
