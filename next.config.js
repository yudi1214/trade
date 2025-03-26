/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (isServer) {
        // Adicione sqlite3 à lista de módulos externos
        config.externals.push('sqlite3');
      }
      
      return config;
    },
  };
  
  module.exports = nextConfig;