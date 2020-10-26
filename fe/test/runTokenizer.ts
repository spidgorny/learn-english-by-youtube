import MyTokenizer from "../src/MyTokenizer";
import * as fs from "fs";
// const parser = require('xml2json-light');

// console.log(['a', 'b', null, undefined, 'c'].filter((el: any) => el));

const data = fs.readFileSync(__dirname + '/fixture/timedtext.json', 'utf-8');
const json = JSON.parse(data);
// const json = parser.xml2json(xml);
// console.log(json.events);
const sentences = json.events.map((el: any) => ('segs' in el && el.segs.length) ? el.segs[0].utf8 : null)
	.filter((el: string) => el);
// console.log(sentences);
const t = new MyTokenizer(sentences);
const terms = t.getTerms();
console.log(terms);

