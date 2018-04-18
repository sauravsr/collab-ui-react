import { HcsSetupModalService, HcsSetupModalSelect, ISoftwareProfile } from 'modules/hcs/shared';
import { CardUtils } from 'modules/core/cards';

interface IHeaderTab {
  title: string;
  state: string;
}

export class HcsUpgradeSwprofileListCtrl implements ng.IComponentController {

  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'partner-services-overview';
  public swprofileList: ISoftwareProfile[];
  public currentList: ISoftwareProfile[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    public CardUtils: CardUtils,
    public HcsSetupModalService: HcsSetupModalService,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.sftp.title'),
      state: `hcs.sftplist`,
    }, {
      title: this.$translate.instant('hcs.softwareProfiles.tabTitle'),
      state: `hcs.swprofilelist`,
    });
    this.listSwProfile();
    this.currentList = this.swprofileList;
  }

  public listSwProfile(): void {
    this.swprofileList = [{
      uuid: 'ver10',
      name: 'SW Profile 10.0',
    }, {
      uuid: 'ver105',
      name: 'SW Profile 10.5',
    }, {
      uuid: 'ver11',
      name: 'SW Profile 11',
    }, {
      uuid: 'ver115',
      name: 'SW Profile 11.5',
    }, {
      uuid: 'ver12',
      name: 'SW Profile 12',
    }];
  }

  public filteredList(searchStr: string): void {
    if (_.isEmpty(searchStr)) {
      this.currentList = this.swprofileList;
    }
    this.currentList = _.filter(this.swprofileList, swprofile => {
      return swprofile.name.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1;
    });
    this.reInstantiateMasonry();
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public addSwProfile(): void {
    this.HcsSetupModalService.openSetupModal(false, HcsSetupModalSelect.SoftwareProfileSetup);
  }
  public deleteSwProfile(): void {}
  public editSwProfile(): void {}
}

export class HcsUpgradeSwprofileListComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeSwprofileListCtrl;
  public template = require('./hcs-upgrade-swprofile-list.component.html');
}
