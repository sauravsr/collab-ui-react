import healthModuleName from './index';

describe('HealthService', function () {
  beforeEach(function () {
    this.initModules(healthModuleName);
    this.injectDependencies(
      '$httpBackend',
      'HealthService',
      'UrlConfig',
    );

    this.pingRegex = /.*\/ping\.*/;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Health Status for server', function () {
    beforeEach(installPromiseMatchers);

    it('should return online if service is available', function () {
      this.$httpBackend.expectGET(this.pingRegex).respond({
        serviceState: 'online',
      });

      this.HealthService.getHealthStatus().then(response => {
        expect(response).toBe('online');
      });

      this.$httpBackend.flush();
    });

    it('should return an error if service is unavailable', function () {
      this.$httpBackend.expectGET(this.pingRegex).respond(404);

      this.HealthService.getHealthStatus().then(fail)
      .catch(response => {
        expect(response.status).toBe(404);
      });

      this.$httpBackend.flush();
    });
  });

  describe('getHealthCheck', function () {
    it('should return success is true when API returns successfully', function () {
      this.$httpBackend.expectGET(this.UrlConfig.getHealthCheckServiceUrl()).respond(200, { fakeData: true });
      this.HealthService.getHealthCheck().then((healthData) => {
        expect(healthData.success).toBe(true);
        expect(healthData.status).toBe(200);
      });
      this.$httpBackend.flush();
    });

    it('should return success is false when API call fails', function () {
      this.$httpBackend.expectGET(this.UrlConfig.getHealthCheckServiceUrl()).respond(500);
      this.HealthService.getHealthCheck().then((healthData) => {
        expect(healthData.success).toBe(false);
        expect(healthData.status).toBe(500);
      });
      this.$httpBackend.flush();
    });
  });
});
