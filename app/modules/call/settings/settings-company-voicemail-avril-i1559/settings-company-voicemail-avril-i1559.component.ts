import { Site } from 'modules/huron/sites';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { IAvrilSiteFeatures } from 'modules/huron/avril';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

class CompanyVoicemailAvrilI1559ComponentCtrl implements ng.IComponentController {
  public site: Site;
  public features: IAvrilSiteFeatures;
  public selectedNumber: IOption;
  public missingDirectNumbers: boolean;
  public filterPlaceholder: string;
  public externalNumberOptions: IOption[];
  public dialPlanCountryCode: string;
  public companyVoicemailEnabled: boolean;
  public voicemailToPhone: boolean;
  public onNumberFilter: Function;
  public onChangeFn: Function;
  public missingDirectNumbersHelpText: string = '';
  public avrilI1558: boolean = false;
  public avrilI1559: boolean = false;
  public isMessageEntitled: boolean = false;
  public localAvrilFeatures: IAvrilSiteFeatures;
  public siteLanguage: string;
  public isFirstTime: boolean;
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private ServiceSetup,
    private Authinfo,
    private FeatureToggleService,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onInit(): void {
    this.FeatureToggleService.avrilI1558GetStatus().then((toggle) => {
      this.avrilI1558 = toggle;
    });
    this.FeatureToggleService.avrilI1559GetStatus().then((toggle) => {
      this.avrilI1559 = toggle;
    });
    this.isMessageEntitled = this.Authinfo.isMessageEntitled();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      features,
      site,
      externalNumberOptions,
    } = changes;

    if (externalNumberOptions) {
      if (externalNumberOptions.currentValue && _.isArray(externalNumberOptions.currentValue)) {
        if (externalNumberOptions.currentValue.length === 0) {
          this.missingDirectNumbers = true;
          this.missingDirectNumbersHelpText = this.$translate.instant('serviceSetupModal.voicemailNoDirectNumbersError');
        } else {
          this.missingDirectNumbers = false;
          this.missingDirectNumbersHelpText = '';
        }
      }
    }

    if (features && features.currentValue) {
      this.localAvrilFeatures = _.clone(features.currentValue);
    }

    if (site && site.currentValue) {
      if (_.get(site.currentValue, 'voicemailPilotNumber') &&
        _.get(site.currentValue, 'voicemailPilotNumberGenerated') === false) {
        this.localAvrilFeatures.VM2T = true;
        this.selectedNumber = this.setCurrentOption(_.get<string>(site.currentValue, 'voicemailPilotNumber'), this.externalNumberOptions);
      } else {
        this.localAvrilFeatures.VM2T = false;
      }
      this.siteLanguage = _.get<string>(site.currentValue, 'preferredLanguage');
      if (this.siteLanguage !== 'en_US') {
        this.localAvrilFeatures.VM2T = false;
      }
    }
  }

  public onCompanyVoicemailNumberChanged(): void {
    this.onChange(this.selectedNumber.value, 'false', true);
  }

  public onVoicemailToPhoneChanged(): void {
    if (this.voicemailToPhone) {
      this.onChange(_.get<string>(this.selectedNumber, 'value'), 'false', true);
    } else {
      const pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
      this.onChange(pilotNumber, 'true', true);
    }
  }

  public onVoicemailFeaturesChanged(): void {
    if (this.isVM2EChanged()) {
      this.localAvrilFeatures.VM2E_Transcript = this.localAvrilFeatures.VM2E && this.isLanguageEnglish();
      this.localAvrilFeatures.VM2E_Attachment = this.localAvrilFeatures.VM2E;
      this.localAvrilFeatures.VM2E_TLS = this.localAvrilFeatures.VM2E;
    }
    if (this.isVM2SChanged()) {
      this.localAvrilFeatures.VM2S_Transcript = this.localAvrilFeatures.VM2S && this.isLanguageEnglish();
      this.localAvrilFeatures.VM2S_Attachment = this.localAvrilFeatures.VM2S;
    }
    if (!this.isLanguageEnglish()) {
      this.localAvrilFeatures.VM2E_Transcript = this.localAvrilFeatures.VM2S_Transcript = false;
    }
    this.localAvrilFeatures.VMOTP = this.isMessageEntitled ? this.localAvrilFeatures.VMOTP : false;
    this.onCompanyVoicemailChange(true, false);
  }

  public isVM2EChanged(): boolean {
    return (this.localAvrilFeatures.VM2E !== this.features.VM2E);
  }

  public isVM2SChanged(): boolean {
    return (this.localAvrilFeatures.VM2S !== this.features.VM2S);
  }

  public isLanguageEnglish(): boolean {
    return (this.siteLanguage === 'en_US' || this.siteLanguage === 'en_GB');
  }

  public onCompanyVoicemailChange(value: boolean, initFeatures: boolean = true): void {
    if (value) {
      let pilotNumber: string = '';
      if (initFeatures) {
        this.initVoicemailFeatures();
      }
      if (this.selectedNumber && this.selectedNumber.value) {
        this.onCompanyVoicemailNumberChanged();
      } else {
        pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
        this.onChange(pilotNumber, 'true', value);
      }
    } else {
      this.onChange(null, null, value);
    }
  }

  public initVoicemailFeatures() {
    if (!_.isUndefined(this.localAvrilFeatures) && this.isMessageEntitled) {
      this.localAvrilFeatures.VM2T = false;
      this.localAvrilFeatures.VM2S = true;
      this.localAvrilFeatures.VM2S_Attachment = true;
      this.localAvrilFeatures.VM2S_Transcript = this.isLanguageEnglish() ? true : false;
      this.localAvrilFeatures.VMOTP = true;
    }
  }

  public onChange(voicemailPilotNumber: string | null, voicemailPilotNumberGenerated: string | null, companyVoicemailEnabled: boolean): void {
    this.onChangeFn({
      voicemailPilotNumber: voicemailPilotNumber,
      voicemailPilotNumberGenerated: voicemailPilotNumberGenerated,
      companyVoicemailEnabled: companyVoicemailEnabled,
      features: this.localAvrilFeatures,
    });
  }

  public getNumbers(filter: string): void {
    this.onNumberFilter({
      filter: filter,
    });
  }

  private setCurrentOption(currentValue: string, existingOptions: IOption[]): IOption {
    const existingOption: IOption = _.find(existingOptions, { value: currentValue });
    if (!existingOption) {
      const currentExternalNumberOption: IOption = {
        value: currentValue,
        label: this.PhoneNumberService.getNationalFormat(currentValue),
      };
      existingOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }

}

export class CompanyVoicemailAvrilI1559Component implements ng.IComponentOptions {
  public controller = CompanyVoicemailAvrilI1559ComponentCtrl;
  public templateUrl = 'modules/call/settings/settings-company-voicemail-avril-i1559/settings-company-voicemail-avril-i1559.component.html';
  public bindings = {
    site: '<',
    features: '<',
    dialPlanCountryCode: '<',
    externalNumberOptions: '<',
    companyVoicemailEnabled: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
