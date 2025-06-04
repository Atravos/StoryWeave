// storyweave/client/src/config/environment.js
const config = {
  development: {
    API_URL: 'http://localhost:5002',
    SOCKET_URL: 'http://localhost:5002'
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5002',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5002'
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];