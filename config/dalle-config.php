<?php
// DALLE Configuration - NEVER modify the mandatory prompt prefix
define('OPENAI_API_KEY', 'sk-...');
define('DEFAULT_IMAGE_SIZE', '1024x1024');
define('DEFAULT_QUALITY', 'standard');
define('RATE_LIMIT_PER_HOUR', 60);

// Mandatory prompt prefix (NEVER allow override)
define('MANDATORY_PROMPT_PREFIX', 
    'Professional unbranded product photography on pure white background. ' .
    'MANDATORY: Include a clearly defined blank white circle or rectangular area ' .
    'positioned prominently on the product front for future logo placement. ' .
    'NO text, NO logos, NO brand names, NO identifying marks anywhere. '
);

// Banned terms to prevent brand generation
$BANNED_TERMS = [
    'arm & hammer', 'arm and hammer', 'oxiclean', 'trojan', 
    'church & dwight', 'church and dwight', 'batiste', 'waterpik',
    'coca-cola', 'pepsi', 'nike', 'adidas', 'apple', 'samsung',
    'procter & gamble', 'p&g', 'unilever', 'colgate', 'palmolive',
    'johnson & johnson', 'j&j', 'nestle', 'kraft', 'kellogg',
    'general mills', 'mars', 'hershey', 'mondelez', 'pepsico',
    'coca cola', 'mcdonalds', 'burger king', 'kfc', 'starbucks',
    'walmart', 'target', 'amazon', 'costco', 'kroger',
    'cvs', 'walgreens', 'rite aid', 'dollar general', 'dollar tree',
    'home depot', 'lowes', 'menards', 'ace hardware', 'true value',
    'microsoft', 'google', 'facebook', 'meta', 'twitter',
    'instagram', 'tiktok', 'snapchat', 'youtube', 'linkedin',
    'bmw', 'mercedes', 'audi', 'volkswagen', 'toyota',
    'honda', 'nissan', 'ford', 'chevrolet', 'gm',
    'louis vuitton', 'gucci', 'prada', 'chanel', 'hermes',
    'versace', 'armani', 'dior', 'burberry', 'coach',
    'ralph lauren', 'calvin klein', 'tommy hilfiger', 'gap', 'old navy',
    'h&m', 'zara', 'forever 21', 'uniqlo', 'primark',
    'sephora', 'ulta', 'maybelline', 'revlon', 'loreal',
    'olay', 'dove', 'nivea', 'neutrogena', 'aveeno',
    'tide', 'gain', 'downy', 'bounce', 'persil',
    'clorox', 'lysol', 'pledge', 'windex', 'mr clean',
    'glade', 'febreze', 'air wick', 'yankee candle', 'bath & body works'
];
?>