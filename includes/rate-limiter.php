<?php
class RateLimiter {
    private $redisClient;
    private $identifier;
    private $limit;
    private $window;
    
    public function __construct($identifier, $limit = 60, $window = 3600) {
        $this->identifier = 'rate_limit:' . $identifier;
        $this->limit = $limit;
        $this->window = $window;
        
        // Use Redis if available, otherwise file-based
        if (class_exists('Redis')) {
            try {
                $this->redisClient = new Redis();
                $this->redisClient->connect('127.0.0.1', 6379);
            } catch (Exception $e) {
                $this->redisClient = null;
            }
        }
    }
    
    public function checkLimit() {
        if ($this->redisClient) {
            return $this->checkRedisLimit();
        } else {
            return $this->checkFileLimit();
        }
    }
    
    private function checkRedisLimit() {
        $current = $this->redisClient->incr($this->identifier);
        
        if ($current === 1) {
            $this->redisClient->expire($this->identifier, $this->window);
        }
        
        return $current <= $this->limit;
    }
    
    private function checkFileLimit() {
        $file = '../cache/rate_limits/' . md5($this->identifier) . '.json';
        $dir = dirname($file);
        
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $data = [];
        if (file_exists($file)) {
            $content = file_get_contents($file);
            if ($content) {
                $data = json_decode($content, true) ?: [];
            }
        }
        
        $now = time();
        $data = array_filter($data, function($timestamp) use ($now) {
            return ($now - $timestamp) < $this->window;
        });
        
        if (count($data) >= $this->limit) {
            return false;
        }
        
        $data[] = $now;
        file_put_contents($file, json_encode($data), LOCK_EX);
        
        return true;
    }
    
    public function getRetryAfter() {
        // Calculate when the oldest request will expire
        return $this->window;
    }
}
?>