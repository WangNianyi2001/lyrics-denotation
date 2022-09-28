import { Lyrics } from '../parse.mjs';

const MatchKana = RegExp.prototype.exec.bind(/^[\u3040-\u30ff]+/);

function ArrayInsert(arr, target, anchor, after = false) {
	let index = arr.indexOf(anchor);
	if(index === -1)
		throw new RangeError('Cannot index anchor element');
	if(after) ++index;
	arr.splice(index, 0, target);
	return arr;
}

export default function(lyrics) {
	for(const paragraph of lyrics.paragraphs) {
		for(const token of paragraph.tokens) {
			if(!token.segments)
				continue;
			for(const segment of token.segments) {
				if(!segment.ruby)
					continue;
				const match = MatchKana(segment.body);
				if(!match)
					continue;
				const prefix = match[0];
				segment.body = segment.body.slice(prefix.length);
				ArrayInsert(token.segments, { body: prefix }, segment);
			}
		}
	}
	lyrics.ToHTML = function() {
		const $main = Lyrics.prototype.ToHTML.call(this);
		$main.lang = 'ja';
		return $main;
	};
	return lyrics;
}
