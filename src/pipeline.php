<?php

use NlpTools\Analysis\FreqDist;
use NlpTools\Tokenizers\WhitespaceAndPunctuationTokenizer;
use Purl\Url;
use Stringy\Stringy as S;

define('TAB', "\t");

require_once __DIR__ . '/../vendor/autoload.php';
\Dotenv\Dotenv::create(__DIR__ . '/..')->load();
echo 'Yandex Key: ', getenv('YANDEX_KEY'), PHP_EOL;
if (!getenv('YANDEX_KEY')) {
	throw new Exception('.env yandex key missing');
}

function main()
{
	$youtubeLink = 'https://youtube.com/watch?v=zzfCVBSsvqA';
	$url = new Url($youtubeLink);
	$ccLink = 'http://video.google.com/timedtext?lang=en&v=' . $url->query->get('v');
	echo $ccLink, PHP_EOL;
	$cc = fetchCC($ccLink);
	$onlyTerms = filterCommonWords($cc);
	//print_r($onlyTerms);
	$translation = translateRare($onlyTerms);
	print_r($translation);
}

function fetchCC(string $ccLink)
{
	$response = Unirest\Request::get($ccLink);

	//echo $response->code, PHP_EOL;
	//print_r($response->headers);
	//echo '[' . $response->body . ']';

	if (!$response->body) {
		throw new Exception('timedtext not available');
	}

	$text = '';
	$xml = simplexml_load_string($response->body);
	foreach ($xml->text as $line) {
		//echo '- ' . $line . '', PHP_EOL;
		$text .= ' ' . $line;
	}
	return $text;
}

function filterCommonWords($text)
{
	$tok = new WhitespaceAndPunctuationTokenizer();
	$tokdoc = new FreqDist($tok->tokenize($text));
	echo 'Original: ', sizeof($tokdoc->getKeyValues()), PHP_EOL;
	foreach ($tokdoc->getKeyValues() as $a => $b) {
		//echo $a, TAB, $b, PHP_EOL;
	}

	$words = [];
	$fp = fopen(__DIR__ . '/../data/5000words.txt', 'r');
	while (!feof($fp)) {
		$line = fgetcsv($fp, 0, TAB);
		$words[$line[1]] = $line[3];
	}
//print_r(array_slice($words, 0, 10));
	$words['is'] = 0;
	$words['are'] = 0;
	$words['don'] = 0;
	$words['was'] = 0;

	$rare = [];
	foreach ($tokdoc->getKeyValues() as $a => $b) {
		$is5000 = array_key_exists(strtolower($a), $words);
		$short = strlen($a) < 3;
		$withS = $a[strlen($a) - 1] == 's'
			&& array_key_exists(substr(strtolower($a), 0, -1), $words);
		$withED = S::create($a)->endsWith('ed')
			&& array_key_exists(substr(strtolower($a), 0, -2), $words);
		$withED2 = S::create($a)->endsWith('ed')
			&& array_key_exists(substr(strtolower($a), 0, -1), $words);
		if (!$is5000 && !$short && !$withS && !$withED && !$withED2) {
			$rare[$a] = $b;
		}
	}
	echo 'Rare: ', count($rare), PHP_EOL;
	return $rare;
}

/**
 * @param string[] $rare
 * @return mixed
 * @throws Exception
 */
function translateRareYandex(array $rare)
{
	$yandex = 'https://translate.yandex.net/api/v1.5/tr.json/translate?' .
		http_build_query([
			'key' => getenv('YANDEX_KEY'),
			'text' => implode(PHP_EOL, array_keys($rare)),
			'lang' => 'en-ru',
		]);

	$response = Unirest\Request::get($yandex);
	echo 'Code: ', $response->code, PHP_EOL;
	print_r($response->headers);
	print_r($response->body);

	if ($response->code !== 200 || !$response->body) {
		throw new Exception('Translation is not working');
	}
//print_r($response->body);
	$translation = explode("\n", $response->body->text[0]);
	foreach ($rare as $en => &$trans) {
		$trans = current($translation) . ' (' . $trans . ')';
		next($translation);
	}
	return $rare;
}

function translateRare(array $rare)
{
    foreach ($rare as $en => &$trans) {
        $cmd = 'python test/pons.py ' . $en;
        echo '> ', $cmd, PHP_EOL;
        $trans = exec($cmd);
        echo '< ', $trans, PHP_EOL;
    }
    return $rare;
}

main();
