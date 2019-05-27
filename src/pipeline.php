<?php

use NlpTools\Analysis\FreqDist;
use NlpTools\Documents\TokensDocument;
use NlpTools\Tokenizers\WhitespaceAndPunctuationTokenizer;

define('TAB', "\t");

require_once __DIR__ . '/../vendor/autoload.php';

$response = Unirest\Request::get('https://www.youtube.com/api/timedtext?v=RLTgnOuYb6o&lang=en');

//echo $response->code, PHP_EOL;
//print_r($response->headers);
//echo '[' . $response->body . ']';

if ($response->body) {
	$text = '';
	$xml = simplexml_load_string($response->body);
	foreach ($xml->text as $line) {
		echo '- ' . $line . '', PHP_EOL;
		$text .= ' ' . $line;
	}

	$tok = new WhitespaceAndPunctuationTokenizer();
	$tokdoc = new FreqDist($tok->tokenize($text));
	foreach ($tokdoc->getKeyValues() as $a => $b) {
		echo $a, TAB, $b, PHP_EOL;
	}
}
