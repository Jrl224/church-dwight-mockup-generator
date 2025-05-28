# Church & Dwight Unbranded Product Mockup Generator

## Overview
AI-powered web application for generating professional unbranded product mockups with mandatory blank logo placeholders. Built for R&D teams, designers, and product managers at Church & Dwight Co., Inc.

## Features
- 🎨 **AI-Powered Generation**: Uses OpenAI DALL-E 3 for photorealistic product mockups
- 🚫 **Brand Protection**: Strict validation to prevent any branded content
- ⚡ **Fast Generation**: Optimized for sub-5 second generation times
- 📱 **Mobile Responsive**: Works on all devices
- 💾 **History Tracking**: Saves and displays previous generations
- 🔒 **Rate Limiting**: 60 generations per hour per user
- 📥 **Download Options**: High-quality PNG downloads with descriptive filenames
- 🌐 **PWA Support**: Installable as a progressive web app

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 8.1+
- **AI**: OpenAI DALL-E 3 API
- **Hosting**: SiteGround (recommended) or any PHP hosting
- **Database**: File-based storage (no DB required)

## Project Structure
```
church-dwight-mockup-generator/
├── index.html                 # Main application
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
├── .htaccess                 # Apache configuration
├── api/                      # API endpoints
│   ├── generate-mockup.php   # Main generation endpoint
│   ├── download.php          # Image download handler
│   └── check-rate-limit.php  # Rate limit checker
├── assets/                   # Static assets
│   ├── css/
│   │   └── main.css         # Application styles
│   └── js/
│       └── main.js          # Application logic
├── config/                   # Configuration files
│   └── dalle-config.php     # OpenAI configuration
├── includes/                 # PHP includes
│   ├── prompt-validator.php  # Prompt validation
│   ├── rate-limiter.php     # Rate limiting logic
│   └── image-processor.php  # Image processing
├── cache/                    # Cache directory (auto-created)
├── logs/                     # Log files (auto-created)
└── temp/                     # Temporary files (auto-created)
```

## Installation

### Prerequisites
- PHP 8.1 or higher
- Apache web server with mod_rewrite enabled
- SSL certificate (required for PWA features)
- OpenAI API key with DALL-E 3 access

### Step 1: Clone Repository
```bash
git clone https://github.com/Jrl224/church-dwight-mockup-generator.git
cd church-dwight-mockup-generator
```

### Step 2: Configure OpenAI API
Edit `config/dalle-config.php` and replace the API key:
```php
define('OPENAI_API_KEY', 'your-actual-openai-api-key-here');
```

### Step 3: Set Permissions
```bash
chmod 755 cache logs temp
```

### Step 4: Configure Apache
Ensure your Apache configuration allows .htaccess overrides:
```apache
<Directory /path/to/mockup-generator>
    AllowOverride All
    Require all granted
</Directory>
```

### Step 5: Install on SiteGround
1. Create a subdomain (e.g., mockups.churchdwight-labs.com)
2. Upload all files via FTP or Git
3. Set PHP version to 8.1+ in SiteGround Site Tools
4. Install SSL certificate (free Let's Encrypt)
5. Set file permissions via File Manager

## Configuration

### Environment Variables
Create a `.env` file (optional) for local development:
```
OPENAI_API_KEY=sk-...
RATE_LIMIT_PER_HOUR=60
```

### Customization Options
- **Rate Limiting**: Adjust in `config/dalle-config.php`
- **Banned Terms**: Add/remove in `config/dalle-config.php`
- **Image Quality**: Change between 'standard' and 'hd' in API calls
- **Cache Duration**: Modify in `.htaccess` file

## Usage

### Basic Workflow
1. Select product type (bottle, box, tube, etc.)
2. Choose product category (laundry, personal care, etc.)
3. Customize appearance options
4. Click "Generate Mockup"
5. Download or regenerate as needed

### API Endpoints

#### Generate Mockup
```
POST /api/generate-mockup.php
Content-Type: application/json

{
  "prompt": "Product description",
  "selections": {
    "productType": "bottle",
    "category": "laundry",
    "colorScheme": "white-gray",
    "finish": "matte",
    "logoShape": "circle",
    "specialFeatures": "ergonomic grip"
  }
}
```

#### Download Image
```
POST /api/download.php
Content-Type: application/json

{
  "imageUrl": "https://...",
  "filename": "mockup_2025-05-27.png"
}
```

#### Check Rate Limit
```
GET /api/check-rate-limit.php
```

## Security Features
- Input sanitization and validation
- Rate limiting per IP address
- Banned brand terms enforcement
- HTTPS enforcement
- XSS protection headers
- Directory browsing disabled
- Sensitive file protection

## Performance Optimization
- Optimized DALL-E 3 settings for speed
- Client-side caching with service worker
- Compressed assets
- Lazy loading for history images
- Minimal JavaScript framework usage

## Troubleshooting

### Common Issues

#### 504 Gateway Timeout
- Ensure using 'standard' quality instead of 'hd'
- Check server timeout settings
- Verify API key is valid

#### Rate Limit Errors
- Wait for hourly reset
- Check IP-based limits
- Clear cache directory if needed

#### Image Generation Fails
- Verify OpenAI API key
- Check error logs in `logs/generations.log`
- Ensure prompt doesn't contain banned terms

#### CORS Issues
- Verify .htaccess is being read
- Check Apache mod_headers is enabled
- Ensure API endpoints have proper headers

## Development

### Local Development
```bash
# Start PHP development server
php -S localhost:8000

# Watch for changes (optional)
npm install -g nodemon
nodemon --watch . --ext php,html,css,js
```

### Testing
- Test rate limiting with multiple requests
- Verify brand term blocking
- Check mobile responsiveness
- Test PWA installation
- Validate download functionality

## Deployment Checklist
- [ ] Set production OpenAI API key
- [ ] Enable HTTPS/SSL
- [ ] Configure error logging
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Configure backup strategy
- [ ] Set up Google Analytics (optional)
- [ ] Configure CDN (optional)

## Future Enhancements
- Export to PowerPoint functionality
- Batch generation support
- Advanced image editing features
- Team collaboration features
- Analytics dashboard
- Multi-language support

## Support
For issues or questions:
- GitHub Issues: [Create Issue](https://github.com/Jrl224/church-dwight-mockup-generator/issues)
- Internal Support: Contact R&D IT Team

## License
Proprietary - Church & Dwight Co., Inc.

## Credits
Developed by Jrl224 for Church & Dwight R&D Innovation Suite

---
*Version 1.0.0 - May 2025*