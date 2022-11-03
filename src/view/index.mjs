import Languages from '../../static/scripts/languages.mjs';
import { Lyrics } from '../../static/scripts/parse.mjs';

const name = new URL(location.href).pathname.match(/\/?([^\/]+?)\/?$/)[1];
fetch(`/lyrics/${name}`).then(res => res.json().then(json => {
	const lyrics = new Lyrics(json);
	const lang = json.attributes.lang;
	if(lang)
		Languages(lang, lyrics);
	
	const ready = () => document.body.appendChild(lyrics.ToHTML());
	if(document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', ready);
	else
		ready();
}));
