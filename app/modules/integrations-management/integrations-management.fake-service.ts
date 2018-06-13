import { IApplicationUsage, ICustomPolicy, IGlobalPolicy, IIntegrationsManagementService, IListOptions, PolicyAction, PolicyType } from './integrations-management.types';

export class IntegrationsManagementFakeService implements IIntegrationsManagementService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
  ) {}

  private customPolicies: ICustomPolicy[] = [];
  private customPolicyId = 1;
  private applicationUsages: IApplicationUsage[] = this.createApplicationUsages();
  private globalAccessPolicy?: IGlobalPolicy;

  private readonly ORG_ID = '55555';

  public listIntegrations(_options?: IListOptions): IPromise<IApplicationUsage[]> {
    return this.$q.resolve(this.applicationUsages);
  }

  public getIntegration(appId: string): IPromise<IApplicationUsage> {
    const applicationUsage = this.getApplicationUsageByAppId(appId);
    if (applicationUsage) {
      return this.$q.resolve(applicationUsage);
    }
    return this.$q.reject();
  }

  public getGlobalAccessPolicy(): IPromise<IGlobalPolicy | undefined> {
    return this.$q.resolve(this.globalAccessPolicy);
  }

  public createGlobalAccessPolicy(action: PolicyAction): ng.IPromise<void> {
    this.globalAccessPolicy = {
      id: '11111',
      orgId: this.ORG_ID,
      name: 'Global Access Policy',
      type: PolicyType.DEFAULT,
      action,
    };
    return this.$q.resolve();
  }

  public updateGlobalAccessPolicy(_id: string, action: PolicyAction): ng.IPromise<void> {
    this.globalAccessPolicy!.action = action;
    return this.$q.resolve();
  }

  public getCustomPolicy(appId: string): IPromise<ICustomPolicy | undefined> {
    const customPolicy = this.getCustomPolicyByAppId(appId);
    return this.$q.resolve(customPolicy);
  }

  public createCustomPolicy(appId: string, action: PolicyAction, userIds?: string[] | undefined): IPromise<void> {
    const policyId = `${this.customPolicyId}`;
    const customPolicy = {
      id: policyId,
      orgId: this.ORG_ID,
      name: 'Custom Policy',
      type: PolicyType.CUSTOM,
      action,
      appId,
      personIds: userIds,
    };
    this.customPolicies.push(customPolicy);
    this.customPolicyId += 1;

    const applicationUsage = this.getApplicationUsageByAppId(appId);
    applicationUsage.policyId = policyId;
    return this.$q.resolve();
  }

  public updateCustomPolicy(id: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void> {
    const customPolicy = this.getCustomPolicyById(id);
    customPolicy.action = action;
    customPolicy.personIds = userIds;
    return this.$q.resolve();
  }

  public deleteCustomPolicy(id: string): IPromise<void> {
    _.remove(this.customPolicies, customPolicy => customPolicy.id === id);
    const applicationUsage = this.getApplicationUsageByPolicyId(id);
    delete applicationUsage.policyId;
    return this.$q.resolve();
  }

  public hasCustomPolicyByAction(action: PolicyAction): IPromise<boolean> {
    const applicationUsageByAction = _.filter(this.applicationUsages, applicationUsage => applicationUsage.policyAction === action);
    return this.$q.resolve(applicationUsageByAction.length > 0);
  }

  public revokeTokensForIntegration(clientId: string): IPromise<void> {
    const applicationUsage = this.getApplicationUsageByAppId(clientId);
    applicationUsage.appUserAdoption = 0;
    return this.$q.resolve();
  }

  public listAdoptedUsersForIntegration(_clientId: string): IPromise<string[]> {
    return this.$q.resolve([]);
  }

  private getApplicationUsageByAppId(appId: string): IApplicationUsage {
    return _.find(this.applicationUsages, applicationUsage => applicationUsage.appId === appId);
  }

  private getApplicationUsageByPolicyId(policyId: string): IApplicationUsage {
    return _.find(this.applicationUsages, applicationUsage => applicationUsage.policyId === policyId);
  }

  private getCustomPolicyByAppId(appId: string): ICustomPolicy {
    return _.find(this.customPolicies, customPolicy => customPolicy.appId === appId);
  }

  private getCustomPolicyById(id: string): ICustomPolicy {
    return _.find(this.customPolicies, customPolicy => customPolicy.id === id);
  }

  private createApplicationUsages(): IApplicationUsage[] {
    return _.times(100, index => {
      return {
        id: `${index}`,
        orgId: this.ORG_ID,
        appId: `${index}`,
        appName: `Fake Integration ${index}`,
        appClientId: `${index}`,
        appPrivacyUrl: `http://fake-${index}.privacy.url/`,
        appCompanyUrl: `http://fake-${index}.company.url/`,
        appContactName: `Fake Contact Name ${index}`,
        appContactEmail: `fake-${index}@contact-email.com`,
        appUserAdoption: 500,
        policyAction: PolicyAction.DENY,
        appCreated: '2018-06-08T20:50:19.355Z',
      };
    });
  }
}
