<?php
class PromptValidator {
    private $bannedTerms;
    private $maxLength = 1000;
    
    public function __construct() {
        global $BANNED_TERMS;
        $this->bannedTerms = $BANNED_TERMS;
    }
    
    public function validate($prompt) {
        // Check length
        if (strlen($prompt) > $this->maxLength) {
            return [
                'valid' => false,
                'message' => 'Prompt too long'
            ];
        }
        
        // Check for banned terms
        $lowerPrompt = strtolower($prompt);
        foreach ($this->bannedTerms as $term) {
            if (strpos($lowerPrompt, strtolower($term)) !== false) {
                return [
                    'valid' => false,
                    'message' => 'Prompt contains restricted terms'
                ];
            }
        }
        
        // Check for injection attempts
        if (preg_match('/(\bignore\b|\boverride\b|\bbypass\b)/i', $prompt)) {
            return [
                'valid' => false,
                'message' => 'Invalid prompt structure'
            ];
        }
        
        // Sanitize
        $sanitized = $this->sanitize($prompt);
        
        return [
            'valid' => true,
            'sanitized' => $sanitized
        ];
    }
    
    private function sanitize($prompt) {
        // Remove any HTML/script tags
        $prompt = strip_tags($prompt);
        
        // Remove multiple spaces
        $prompt = preg_replace('/\s+/', ' ', $prompt);
        
        // Trim
        $prompt = trim($prompt);
        
        return $prompt;
    }
}
?>