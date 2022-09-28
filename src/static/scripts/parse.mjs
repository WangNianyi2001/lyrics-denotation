export function Token(token) {
	if(/^\s*$/.test(token)) {
		this.br = true;
	} else {
		this.segments = [];
		for(; token.length; ) {
			const match = token.match(/^([^\[]+)(?:\[([^\]]*)\])?/);
			if(!match)
				throw new EvalError(`Malformed token: "${token}"`);
			token = token.slice(match[0].length);
			const [, body, ruby] = match;
			this.segments.push({ body, ruby });
		}
	}
}
Token.prototype = {
	ToHTML() {
		if(this.br)
			return document.createElement('br');
		const $span = document.createElement('span');
		$span.classList.add('token');
		for(const { body, ruby } of this.segments) {
			if(!ruby?.length) {
				$span.append(body);
				continue;
			}
			const $ruby = document.createElement('ruby');
			const $rt = document.createElement('rt');
			$rt.append(ruby);
			$ruby.append(body, $rt);
			$span.appendChild($ruby);
		}
		return $span;
	}
};

export function Paragraph(paragraph) {
	const tokens = [];
	for(; /\S/.test(paragraph); ) {
		const match = paragraph.match(/^(\S+)(\s*)/m);
		if(match === null)
			throw new EvalError(`Invalid paragraph: "${paragraph}"`);
		const [, token, whitespace] = match;
		paragraph = paragraph.slice(match[0].length);
		tokens.push(new Token(token));
		if(whitespace.indexOf('\n') !== -1)
			tokens.push(new Token(whitespace));
	}
	this.tokens = tokens.filter(_ => _);
}
Paragraph.prototype = {
	ToHTML() {
		const $p = document.createElement('p');
		$p.classList.add('paragraph');
		$p.append(...this.tokens.map(t => t.ToHTML()));
		return $p;
	}
};

export function Lyrics({ attributes: { name }, body }) {
	this.name = name;
	this.paragraphs = body
		.replaceAll(/\r\n?/g, '\n')
		.split(/\n{2,}/)
		.map(p => new Paragraph(p));
}
Lyrics.prototype = {
	ToHTML() {
		const $main = document.createElement('main');
		const $title = document.createElement('h1');
		$title.innerText = this.name;
		$main.appendChild($title);
		$main.append(...this.paragraphs.map(p => p.ToHTML()));
		return $main;
	}
}
