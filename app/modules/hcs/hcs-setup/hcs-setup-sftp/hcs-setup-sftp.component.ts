import { ISftpServer } from './hcs-setup-sftp';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';

export class HcsSetupSftpController implements ng.IComponentController {
  public readonly MAX_LENGTH: number = 255;
  public readonly MAX_LENGTH_NAME: number = 50;
  public onChangeFn: Function;
  public sftpServer: ISftpServer;
  public confirmPasswd: string;
  public messages: Object;
  public validators: Object;
  public asyncValidator: Object;
  public errors: Object;
  public hcsSftpForm: ng.IFormController;
  public editSftp: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private HcsUpgradeService: HcsUpgradeService,
    private $q: ng.IQService,
  ) {
  }
  public $onInit() {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      passwdMismatch: this.$translate.instant('hcs.sftp.passwordMismatch'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    };
    this.validators = {
      passwdMismatch: (viewValue: string) => this.confirmPassword(viewValue),
    };

    this.errors = {
      required: this.$translate.instant('common.invalidRequired'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH_NAME,
      }),
      unique: this.$translate.instant('hcs.sftp.duplicateSftpName'),
    };

    this.asyncValidator = {
      unique: (viewValue: string) => this.validateSftpName(viewValue),
    };

    if (!_.isUndefined(this.sftpServer) && this.sftpServer) {
      this.editSftp = this.$state.current.name === 'hcs.sftpserver-edit' || !_.isEmpty(this.sftpServer.uuid);
    }
  }

  public validateSftpName(name: string): ng.IPromise<void> {
    const validateDefer = this.$q.defer<void>();
    this.HcsUpgradeService.listSftpServers()
      .then((res) => {
        if (!_.find(_.get(res, 'sftpServers'), sftp => _.get(sftp, 'name') === name)) {
          validateDefer.resolve();
        } else {
          validateDefer.reject();
        }
      });
    return validateDefer.promise;
  }

  public changePassword() {
    if (this.confirmPasswd) {
      this.confirmPasswd = '';
    }
    if (this.editSftp) {
      this.confirmPasswd = '';
    }
  }

  public confirmPassword(passwd): boolean {
    return (this.sftpServer && _.isEmpty(this.sftpServer.password) || passwd && passwd === this.sftpServer.password);
  }

  public processChange() {
    this.onChangeFn({
      sftpServer: this.sftpServer,
    });
  }

}

export class HcsSetupSftpComponent implements ng.IComponentOptions {
  public controller = HcsSetupSftpController;
  public template = require('modules/hcs/hcs-setup/hcs-setup-sftp/hcs-setup-sftp.component.html');
  public bindings = {
    sftpServer: '<',
    onChangeFn: '&',
  };
}
