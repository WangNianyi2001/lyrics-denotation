import Express from 'express';
import * as Fs from 'fs';
import * as Path from 'path';
import * as URL from 'url';
import FrontMatter from 'front-matter';

const projectRoot = Path.resolve(Path.dirname(URL.fileURLToPath(import.meta.url)), '..');
const lyricsRoot = Path.resolve(projectRoot, 'lyrics');
const port = 8080;

const app = Express();

app.get('/lyrics/*', function(req, res) {
	try {
		const id = Path.relative('/lyrics/', req.url);
		const lyrics = (() => {
			for(const filename of Fs.readdirSync(lyricsRoot)) {
				const content = Fs.readFileSync(Path.resolve(lyricsRoot, filename), { encoding: 'utf-8' });
				const fm = FrontMatter(content);
				if(fm.attributes['id'] !== id)
					continue;
				return fm;
			}
			return null;
		})();
		if(lyrics) {
			res.writeHead(200);
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

app.get('/*', function(req, res) {
	let path = req.url;
	if(path[path.length - 1] === '/')
		path = '/index.html';
	path = Path.relative('/', path);
	try {
		const realPath = Path.join(projectRoot, 'src/static/', path);
		const mime = (found => found || null)(mimeTable.find(([test]) => test.test(Path.extname(path).slice(1))));
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
