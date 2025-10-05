export default {
  apps: [{
    name: 'ordning-v0.4',
    script: './backend/server.js',
    cwd: '/home/simon/apps/ordning-v0.4',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
};
