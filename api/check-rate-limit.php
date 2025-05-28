<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/dalle-config.php';
require_once '../includes/rate-limiter.php';

// Get client IP
$clientIp = $_SERVER['REMOTE_ADDR'];

// Check current rate limit status
$rateLimiter = new RateLimiter($clientIp, RATE_LIMIT_PER_HOUR);

// For checking status, we need to look at the current count without incrementing
$file = '../cache/rate_limits/' . md5('rate_limit:' . $clientIp) . '.json';
$count = 0;

if (file_exists($file)) {
    $data = json_decode(file_get_contents($file), true);
    if ($data) {
        $now = time();
        $data = array_filter($data, function($timestamp) use ($now) {
            return ($now - $timestamp) < 3600; // 1 hour window
        });
        $count = count($data);
    }
}

$remaining = max(0, RATE_LIMIT_PER_HOUR - $count);

echo json_encode([
    'limit' => RATE_LIMIT_PER_HOUR,
    'remaining' => $remaining,
    'reset' => time() + 3600, // Reset in 1 hour
    'clientIp' => $clientIp
]);
?>