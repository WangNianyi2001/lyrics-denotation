import ja from './lang/ja.mjs';

const languages = new Map(Object.entries({
	ja
}));

export default function(lang, lyrics) {
	if(languages.has(lang))
		return languages.get(lang)(lyrics);
	return lyrics;
}
