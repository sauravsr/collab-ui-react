namespace domainManagement {

  class DomainManageVerifyCtrl {
    private _domain;
    private _loggedOnUser;
    private _error;

    /* @ngInject */
    constructor(private $state, private $previousState, private DomainManagementService, $translate, private LogMetricsService) {
      this._domain = $state.params.domain;
      this._loggedOnUser = $state.params.loggedOnUser;

      //if any domain is already verified, it is safe to verify more:
      if (DomainManagementService.domainList.length == 0
        || _.all(DomainManagementService.domainList, {status: DomainManagementService.states.pending})) {

        //No domains have been verified (list empty or all pending). Only allow logged on user's domain:
        if (this.domainName != this._loggedOnUser.domain)
          this._error = $translate.instant('domainManagement.verify.preventLockoutError', {domain: this._loggedOnUser.domain});
      }
    }

    get domainName() {
      return this._domain && this._domain.text;
    }

    get domain() {
      return this._domain;
    }

    get error() {
      return this._error;
    }

    set error(error) {
      this._error = error;
    }

    get operationAllowed() {
      //input validation:
      if (!(this.domainName && this._loggedOnUser && this._loggedOnUser.isLoaded))
        return false;

      return !this._error;
    }

    public verify() {
      let start = moment();
      this.DomainManagementService.verifyDomain(this._domain.text).then(res => {
        this.recordMetrics('ok', 200, start, {domain: this._domain.text, action: 'verify'});
        this.$previousState.go();
      }, err => {
        this.recordMetrics('error', 500, start, {domain: this._domain.text, error: err, action: 'verify'});
        this._error = err;
      });
    }

    public cancel() {
      this.recordMetrics('cancel', 100, moment(), {domain: this._domain.text, action: 'cancel'});
      this.$previousState.go();
    }

    recordMetrics(log, status, start, data) {
      this.LogMetricsService.logMetrics(
        'domainManage verify ' + log,
        this.LogMetricsService.eventType.domainManageVerify,
        this.LogMetricsService.eventAction.buttonClick,
        status,
        start,
        1,
        data
      );
    }
  }
  angular
    .module('Core')
    .controller('DomainManageVerifyCtrl', DomainManageVerifyCtrl);
}
