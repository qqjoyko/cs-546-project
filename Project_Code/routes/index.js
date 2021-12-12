const jobRoutes = require('./jobs');
const recruiterRoutes = require('./recruiters');
const userRoutes = require('./users');

const constructorMethod = (app) => {
  app.use('/recruiters', recruiterRoutes);
  app.use('/users', userRoutes);
  app.use('/', jobRoutes);


  app.use('*', (req, res) => {
    // will figure out later what to do here to handle the error routes.
  });
};

module.exports = constructorMethod;