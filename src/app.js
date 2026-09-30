const express = require('express');
const app = express();
const { enableCORS, setSecurityHeaders } = require('./middleware/security.middleware');
const ErrorHandler = require('./middleware/ErrorHandling.middleware')
const routes = require('./routes')
const httpLogger = require('./middleware/httpLogger.middleware');
require('./store/sequelize');


app.use(express.json());
app.use(enableCORS);
app.use(setSecurityHeaders);
app.use(httpLogger);

app.use('/api/v1', routes);
app.use(ErrorHandler);
app.use((err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;
