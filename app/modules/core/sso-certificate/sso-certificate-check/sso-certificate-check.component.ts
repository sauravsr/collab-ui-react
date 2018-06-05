import { CertificateCheck } from 'modules/core/sso-certificate/shared/sso-certificate.constants';
import { SsoCertificateService } from 'modules/core/sso-certificate/shared/sso-certificate.service';
import { Notification } from 'modules/core/notifications';

export class SsoCertificateCheckController implements ng.IComponentController {
  public dismiss: Function;
  public nextDisabled = true;
  public submitRemoved = true;
  public certificateCheckValue = CertificateCheck.NEITHER;
  public certificateCheck = CertificateCheck;
  public isLoading = true;
  public docHref = 'https://collaborationhelp.cisco.com/article/ebxovd';

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private SsoCertificateService: SsoCertificateService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    // Get lastest certificate ID
    this.SsoCertificateService.getAllCiCertificates()
      .catch((response) => {
        this.Notification.errorResponse(response);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  public dismissModal(): void {
    this.dismiss();
  }

  public next(): void {
    this.$state.go('sso-certificate.sso-certificate-type');
  }

  public submit(): void {
    this.SsoCertificateService.addLatestCertificateToOrg()
      .then(() => this.SsoCertificateService.switchMetadata())
      .then(() => {
        this.$rootScope.$broadcast('Core::ssoCertificateExpirationNotificationDismissed');
        this.Notification.success('ssoCertificateModal.noActionSuccess');
        this.dismiss();
      });
  }

  public onCertificateCheckValueChanged(): void {
    if (this.certificateCheckValue !== CertificateCheck.NONE) {
      this.nextDisabled = false;
      this.submitRemoved = true;
    } else if (this.certificateCheckValue === CertificateCheck.NONE) {
      this.nextDisabled = true;
      this.submitRemoved = false;
    }
  }
}

export class SsoCertificateCheckComponent implements ng.IComponentOptions {
  public controller = SsoCertificateCheckController;
  public template = require('./sso-certificate-check.html');
  public bindings = {
    dismiss: '&',
  };
}
