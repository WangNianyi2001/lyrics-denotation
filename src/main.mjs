import Express from 'express';
import * as Fs from 'fs';
import * as Path from 'path';
import * as URL from 'url';
import FrontMatter from 'front-matter';

const projectRoot = Path.resolve(Path.dirname(URL.fileURLToPath(import.meta.url)), '..');
const lyricsRoot = Path.resolve(projectRoot, 'lyrics');
const port = 8080;

const app = Express();

app.use('/static', Express.static('src/static'))

app.get('/lyrics/*', function(req, res) {
	try {
		const id = Path.relative('/lyrics/', req.url);
		const lyrics = (() => {
			for(const filename of Fs.readdirSync(lyricsRoot)) {
				const content = Fs.readFileSync(Path.resolve(lyricsRoot, filename)).toString();
				const fm = FrontMatter(content);
				if(fm.attributes['id'] !== id)
					continue;
				return fm;
			}
			return null;
		})();
		if(lyrics) {
			res.writeHead(200, {
				'Content-Type': 'text/json',
				'Encoding': 'utf-8'
			});
			res.write(JSON.stringify(lyrics));
		}
		else {
			res.writeHead(404);
		}
	}
	catch {
		res.writeHead(500);
	}
	finally {
		res.end();
	}
});

const mimeTable = [
	[/^html?$/, 'text/html'],
	[/^[mc]?js$/, 'text/javascript'],
	[/^(c|sc|sa)ss$/, 'text/css'],
];

app.get('/', function(req, res) {
	try {
		const path = Path.join(projectRoot, 'src/index/index.html');
		const data = Fs.readFileSync(path);

		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(data);
	}
	catch {
		res.writeHead(404);
	}
	finally {
		res.end();
	}
});

app.get('/entries', function(req, res) {
	try {
		const lyricsPath = Path.join(projectRoot, 'lyrics');
		const data = [];
		for(const fileName of Fs.readdirSync(lyricsPath)) {
			const file = Fs.readFileSync(Path.join(lyricsPath, fileName)).toString();
			const fm = FrontMatter(file);
			data.push(fm.attributes);
		}

		res.writeHead(200, { 'Content-Type': 'text/json' });
		res.write(JSON.stringify(data));
	}
	catch {
		res.writeHead(404);
	}
	finally {
		res.end();
	}
});

app.get('/view/*', function(req, res) {
	let path = req.url;
	path = /\/([^\/]*)$/.exec(path)[1];
	if(!path.length)
		path = 'index.html';
	try {
		const realPath = Path.join(projectRoot, 'src/view/', path);
		const mime = mimeTable.find(([test]) => test.test(Path.extname(path).slice(1))) || null;
		const content = Fs.readFileSync(realPath);

		const header = {};
		if(mime)
			header['Content-Type'] = mime;

		res.writeHead(200, header);
		res.write(content);
	}
	catch {
		res.writeHead(404);
	}
	finally {
		res.end();
	}
});

app.listen(port);
console.log(`Listening at http://localhost:${port}/`);
