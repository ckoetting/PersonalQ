// public/assetLoader.js
const fs = require('fs');
const path = require('path');

/**
 * Loads assets and converts them to base64 for inline embedding in HTML
 */
class AssetLoader {
    constructor() {
        this.assetCache = new Map();
    }

    /**
     * Get absolute path to asset
     * @param {string} relativePath - Path relative to the assets directory
     * @returns {string} Absolute path to the asset
     */
    getAssetPath(relativePath) {
        // In development
        if (process.env.NODE_ENV === 'development') {
            return path.join(process.cwd(), 'public', relativePath);
        }

        // In production
        return path.join(process.resourcesPath, 'app.asar.unpacked', 'build', relativePath);
    }

    /**
     * Load an asset and convert it to base64
     * @param {string} relativePath - Path relative to the assets directory
     * @returns {string} Base64 encoded asset with appropriate data URI prefix
     */
    loadAsBase64(relativePath) {
        // Check cache first
        if (this.assetCache.has(relativePath)) {
            return this.assetCache.get(relativePath);
        }

        try {
            const assetPath = this.getAssetPath(relativePath);
            const data = fs.readFileSync(assetPath);
            const base64 = data.toString('base64');

            // Determine MIME type from file extension
            const ext = path.extname(relativePath).toLowerCase();
            let mimeType;

            switch (ext) {
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.svg':
                    mimeType = 'image/svg+xml';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                case '.css':
                    mimeType = 'text/css';
                    break;
                case '.js':
                    mimeType = 'application/javascript';
                    break;
                default:
                    mimeType = 'application/octet-stream';
            }

            const dataUrl = `data:${mimeType};base64,${base64}`;

            // Cache the result
            this.assetCache.set(relativePath, dataUrl);

            return dataUrl;
        } catch (error) {
            console.error(`Failed to load asset: ${relativePath}`, error);
            return '';
        }
    }
}

module.exports = new AssetLoader();