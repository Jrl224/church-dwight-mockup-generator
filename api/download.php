<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['imageUrl']) || !isset($input['filename'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

// Validate URL
if (!filter_var($input['imageUrl'], FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid image URL']);
    exit;
}

// Sanitize filename
$filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $input['filename']);
if (!preg_match('/\.png$/i', $filename)) {
    $filename .= '.png';
}

try {
    // Fetch image
    $ch = curl_init($input['imageUrl']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Failed to fetch image: HTTP ' . $httpCode);
    }
    
    if ($imageData === false) {
        throw new Exception('Failed to download image');
    }
    
    // Verify it's actually an image
    if (strpos($contentType, 'image/') !== 0) {
        throw new Exception('Invalid content type: ' . $contentType);
    }
    
    // Set headers for download
    header('Content-Type: image/png');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($imageData));
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Output image
    echo $imageData;
    
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
?>