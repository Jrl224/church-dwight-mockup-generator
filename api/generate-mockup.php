<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/dalle-config.php';
require_once '../includes/rate-limiter.php';
require_once '../includes/prompt-validator.php';
require_once '../includes/image-processor.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['prompt']) || !isset($input['selections'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

// Check rate limit
$clientIp = $_SERVER['REMOTE_ADDR'];
$rateLimiter = new RateLimiter($clientIp);

if (!$rateLimiter->checkLimit()) {
    http_response_code(429);
    echo json_encode([
        'error' => 'Rate limit exceeded. Please try again later.',
        'retryAfter' => $rateLimiter->getRetryAfter()
    ]);
    exit;
}

// Validate and sanitize prompt
$validator = new PromptValidator();
$validationResult = $validator->validate($input['prompt']);

if (!$validationResult['valid']) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid prompt: ' . $validationResult['message']
    ]);
    exit;
}

// Build final prompt with mandatory prefix
$finalPrompt = MANDATORY_PROMPT_PREFIX . ' ' . $validationResult['sanitized'];

try {
    // Initialize cURL for OpenAI API
    $ch = curl_init('https://api.openai.com/v1/images/generations');
    
    $postData = [
        'model' => 'dall-e-3',
        'prompt' => $finalPrompt,
        'n' => 1,
        'size' => DEFAULT_IMAGE_SIZE,
        'quality' => DEFAULT_QUALITY,
        'style' => 'natural',
        'response_format' => 'url'
    ];
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENAI_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('OpenAI API error: HTTP ' . $httpCode);
    }
    
    $responseData = json_decode($response, true);
    
    if (!isset($responseData['data'][0]['url'])) {
        throw new Exception('Invalid response from OpenAI API');
    }
    
    $imageUrl = $responseData['data'][0]['url'];
    
    // Process image (add watermark if needed, optimize)
    $processor = new ImageProcessor();
    $processedUrl = $processor->process($imageUrl, [
        'addPlaceholderBorder' => true,
        'optimize' => true
    ]);
    
    // Log generation
    logGeneration([
        'timestamp' => date('c'),
        'ip' => $clientIp,
        'selections' => $input['selections'],
        'success' => true
    ]);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'imageUrl' => $processedUrl,
        'originalUrl' => $imageUrl,
        'timestamp' => date('c'),
        'id' => uniqid('mockup_'),
        'prompt' => $validationResult['sanitized']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Generation failed: ' . $e->getMessage()
    ]);
    
    // Log error
    error_log('DALL-E generation error: ' . $e->getMessage());
}

// Logging function
function logGeneration($data) {
    $logFile = '../logs/generations.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logEntry = date('Y-m-d H:i:s') . ' | ' . json_encode($data) . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}
?>