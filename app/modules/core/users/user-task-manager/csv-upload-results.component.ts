import { ITask, TaskStatus } from './user-task-manager.component';

// TODO: brspence refactor component into task-details
export class CsvUploadResultsCtrl implements ng.IComponentController {

  public activeTask: ITask;
  public numTotalUsers = 0;
  public numNewUsers = 0;
  public numUpdatedUsers = 0;
  public numErroredUsers = 0;
  public processProgress = 0;
  public isProcessing = false;
  public userErrorArray = [];
  public isCancelledByUser = false;
  public fileName: string;
  public importCompletedAt: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ModalService,
  ) {}

  public $onInit(): void {
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.activeTask) {
      // stop the previousValue activeTask status polling
      this.fillTaskData(changes.activeTask.currentValue);
      // start the currentValue activeTask status polling
    }
  }

  private fillTaskData(taskSelection: ITask): void {
    // TODO: refactor for better initialization and an empty data state
    if (taskSelection) {
      this.numTotalUsers = taskSelection.totalUsers;
      this.numNewUsers = taskSelection.addedUsers;
      this.numUpdatedUsers = taskSelection.updatedUsers;
      this.numErroredUsers = taskSelection.erroredUsers;
      this.processProgress = Math.floor((this.numNewUsers + this.numUpdatedUsers + this.numErroredUsers) * 100 / this.numTotalUsers);
      this.isProcessing = taskSelection.status === TaskStatus.STARTED || taskSelection.status === TaskStatus.STARTING;
      this.isCancelledByUser = false;
      this.fileName = taskSelection.filename;
      this.importCompletedAt = taskSelection.stopped;
    } else {
      this.numTotalUsers = 0;
      this.numNewUsers = 0;
      this.numUpdatedUsers = 0;
      this.numErroredUsers = 0;
      this.processProgress = 0;
      this.isProcessing = false;
      this.userErrorArray = [];
      this.isCancelledByUser = false;
      this.fileName = '';
      this.importCompletedAt = '';
    }
  }

  public onCancelImport(): void {
    return this.ModalService.open({
      title: this.$translate.instant('userManage.bulk.import.stopImportTitle'),
      message: this.$translate.instant('userManage.bulk.import.stopImportBody'),
      dismiss: this.$translate.instant('common.cancel'),
      close: this.$translate.instant('userManage.bulk.import.stopImportTitle'),
      btnType: 'alert',
    }).result.then(() => {
      // Call service to cancel the task
    });
  }
}

export class CsvUploadResultsComponent implements ng.IComponentOptions {
  public controller = CsvUploadResultsCtrl;
  public template = require('./csv-upload-results.html');
  public bindings = {
    activeTask: '<',
  };
}
