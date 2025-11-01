const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const VERSION = packageJson.version;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Strip query parameters from URL
    const urlWithoutQuery = req.url.split('?')[0];

    let filePath = '.' + urlWithoutQuery;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            // Add cache control headers to prevent caching during development
            const headers = {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            };

            // Inject version into HTML
            if (filePath === './index.html') {
                let html = content.toString();
                html = html.replace('{{VERSION}}', VERSION);
                res.writeHead(200, headers);
                res.end(html, 'utf-8');
            } else {
                res.writeHead(200, headers);
                res.end(content, 'utf-8');
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Đàn Tranh Tuner Server Running       ║
╚════════════════════════════════════════╝

🎵 Server running at: http://localhost:${PORT}
📂 Serving files from: ${__dirname}

Press Ctrl+C to stop the server
    `);
});
