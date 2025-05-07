
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log("Setting up API proxy middleware for development");
  
  // Define the target API server - this should point to your deployed API or local API server
  const apiTarget = process.env.API_URL || 'https://ihram-journey-wallet-api.vercel.app';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // keep the /api prefix when forwarding
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Log the outgoing request
        console.log(`Proxying request: ${req.method} ${req.path} to ${apiTarget}`);
        
        // Handle JSON body for POST/PUT requests
        if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
          // Make sure the body is properly serialized
          const bodyData = JSON.stringify(req.body);
          // Set appropriate headers
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        console.log('PROXY RES:', proxyRes.statusCode, req.url);
      }
    })
  );
};
