// This service should obsolete ClusterService during 2017
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { ICluster, ConnectorType, HybridServiceId, IFMSOrganization, ITimeWindow, ClusterTargetType, IExtendedClusterFusion, ServiceStatusCSSClass, IMoratoria, IHost, IConnector, IExtendedConnector, IConnectorAlarm, IConnectorProvisioning, ConnectorMaintenanceMode, IClusterWithExtendedConnectors } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HybridServicesExtrasService, IAllowedRegistrationHost } from 'modules/hercules/services/hybrid-services-extras.service';
import { USSService } from 'modules/hercules/services/uss.service';

export interface IServiceStatusWithSetup {
  serviceId: HybridServiceId;
  setup: boolean;
  status: HighLevelStatusForService;
  cssClass: ServiceStatusCSSClass;
}

interface IResourceGroup {
  clusters: IExtendedClusterFusion[];
  id: string;
  name: string;
  numberOfUsers: number | '?';
  releaseChannel: string;
}

export interface IResourceGroups {
  groups: IResourceGroup[];
  unassigned: IExtendedClusterFusion[];
}

export type HighLevelStatusForService = 'setupNotComplete' | 'operational' | 'impaired' | 'outage';

export class HybridServicesClusterService {
  private static readonly CONTEXT_CONNECTOR_OLD_VERSION = '2.0.1-10131';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private UrlConfig,
    private USSService: USSService,
  ) {
    this.addExtendedPropertiesToClusters = this.addExtendedPropertiesToClusters.bind(this);
    this.addServicesStatusesToClusters = this.addServicesStatusesToClusters.bind(this);
    this.addUserCount = this.addUserCount.bind(this);
    this.extractClustersFromResponse = this.extractClustersFromResponse.bind(this);
    this.extractDataFromResponse = this.extractDataFromResponse.bind(this);
    this.filterClustersWithBadContextConnectors = this.filterClustersWithBadContextConnectors.bind(this);
    this.filterUnknownClusters = this.filterUnknownClusters.bind(this);
    this.filterClustersWithEmptyNames = this.filterClustersWithEmptyNames.bind(this);
    this.sortClusters = this.sortClusters.bind(this);
  }

  public deleteMoratoria(clusterId: string, moratoriaId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/upgradeSchedule/moratoria/${moratoriaId}`;
    return this.$http.delete<''>(url)
      .then(this.extractDataFromResponse);
  }

  public deprovisionConnector(clusterId: string, connectorType: ConnectorType): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/remove/invoke?connectorType=${connectorType}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public deregisterCluster(clusterId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/actions/deregisterCluster/invoke?clusterId=${clusterId}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public deregisterEcpNode(connectorId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/actions/deregister/invoke?managementConnectorId=${connectorId}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public get(clusterId: string, orgId?: string): ng.IPromise<IExtendedClusterFusion> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/clusters/${clusterId}?fields=@wide`;
    return this.$http.get<ICluster>(url)
      .then(this.extractDataFromResponse)
      .then((cluster) => {
        let clusters = this.filterClustersWithBadContextConnectors([cluster]);
        clusters = _.map<ICluster, IClusterWithExtendedConnectors>(clusters, cluster => {
          return <IClusterWithExtendedConnectors>{
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector, cluster);
            }),
          };
        });
        return clusters[0] as IClusterWithExtendedConnectors;
      })
      .then((cluster) => {
        return this.addExtendedPropertiesToClusters([cluster])
          .then((clusters) => {
            return clusters[0];
          });
      })
      .then((cluster) => {
        const clusters = this.addServicesStatusesToClusters([cluster]);
        return clusters[0];
      });
  }

  public getAll(orgId?: string): ng.IPromise<IExtendedClusterFusion[]> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}?fields=@wide`;
    return this.$http.get<IFMSOrganization>(url)
      .then(this.extractClustersFromResponse)
      .then(this.filterUnknownClusters)
      .then(this.filterClustersWithEmptyNames)
      .then(this.filterClustersWithBadContextConnectors)
      .then((clusters) => {
        return _.map(clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector, cluster);
            }),
          };
        });
      })
      .then(this.addExtendedPropertiesToClusters)
      .then(this.addServicesStatusesToClusters)
      .then(this.sortClusters);
  }

  public getClustersForResourceGroup(id: string, clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.resourceGroupId === id;
    });
  }

  public getHost(serial: string, orgId?: string): ng.IPromise<IHost> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/hosts/${serial}`;
    return this.$http.get<IHost>(url)
      .then(this.extractDataFromResponse);
  }

  public getResourceGroups(): ng.IPromise<IResourceGroups> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}?fields=@wide`;
    return this.$http.get<IFMSOrganization>(url)
      .then(this.extractDataFromResponse)
      .then((org) => {
        org.clusters = this.filterUnknownClusters(org.clusters);
        org.clusters = this.filterClustersWithEmptyNames(org.clusters);
        org.clusters = this.filterClustersWithBadContextConnectors(org.clusters);
        org.clusters = _.map(org.clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector, cluster);
            }),
          };
        });
        return org;
      })
      // addInfoToEmptyExpresswayClusters
      .then((org) => {
        return this.addExtendedPropertiesToClusters(org.clusters as IClusterWithExtendedConnectors[])
          .then((clusters) => {
            org.clusters = this.addServicesStatusesToClusters(clusters);
            return org;
          });
      })
      // formatData
      .then((org: IFMSOrganization) => {
        const resourceGroups = _.sortBy(org.resourceGroups, 'name');
        return {
          groups: _.map(resourceGroups, (resourceGroup) => {
            return {
              id: resourceGroup.id,
              name: resourceGroup.name,
              releaseChannel: resourceGroup.releaseChannel,
              clusters: this.sortClusters(this.getClustersForResourceGroup(resourceGroup.id, org.clusters)),
            };
          }),
          unassigned: this.sortClusters(this.getUnassignedClusters(org.clusters)),
        };
      })
      .then(this.addUserCount);
  }

  public getStatusForService(serviceId: HybridServiceId, clusterList: IExtendedClusterFusion[]): IServiceStatusWithSetup {
    const status = this.processClustersToAggregateStatusForService(serviceId, clusterList);
    const serviceStatus = {
      serviceId: serviceId,
      setup: this.processClustersToSeeIfServiceIsSetup(serviceId, clusterList),
      status: status,
      cssClass: this.HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(status),
    };
    return serviceStatus;
  }

  public getUnassignedClusters(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, (cluster) => cluster.resourceGroupId === undefined);
  }

  public postponeUpgradeSchedule(id: string, upgradeWindow: ITimeWindow): ng.IPromise<IMoratoria> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${id}/upgradeSchedule/moratoria`;
    return this.$http.post<IMoratoria>(url, { timeWindow: upgradeWindow })
      .then(this.extractDataFromResponse);
  }

  public preregisterCluster(name: string, releaseChannel: string, targetType: ClusterTargetType): ng.IPromise<ICluster> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters`;
    return this.$http.post<ICluster>(url, {
      name: name,
      releaseChannel: releaseChannel,
      targetType: targetType,
    })
    .then(this.extractDataFromResponse);
  }

  public processClustersToAggregateStatusForService(serviceId: HybridServiceId, clusterList: IExtendedClusterFusion[]): HighLevelStatusForService {
    const connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(serviceId);
    const connectors = _.chain(clusterList)
      .map(cluster => cluster.connectors)
      .flatten<IExtendedConnector>()
      .filter(connector => connector.connectorType === connectorType)
      .value();
    if (connectors.length === 0 || _.every(connectors, connector => connector.state === 'not_installed')) {
      return 'setupNotComplete';
    }
    // TODO: today we piggiyback on the method to compute the status for a service, inside a cluster.
    // But find the status for a service overall (by taking into account al clusters) could be different.
    // For Expressways, we would have to look at it per resource group, and them have a different algorithm than today to decide.
    return this.HybridServicesClusterStatesService.getServiceStatusDetails(connectors).name;
  }

  public processClustersToSeeIfServiceIsSetup(serviceId: HybridServiceId, clusterList: ICluster[]): boolean {
    const connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(serviceId);
    if (!connectorType) {
      return false; // Cannot recognize service, default to *not* enabled
    }

    if (serviceId === 'squared-fusion-media') {
      return _.some(clusterList, { targetType: 'mf_mgmt' });
    } else if (serviceId === 'contact-center-context') {
      return _.some(clusterList, { targetType: 'cs_mgmt' });
    } else if (serviceId === 'spark-hybrid-datasecurity') {
      return _.some(clusterList, { targetType: 'hds_app' });
    } else {
      return _.chain(clusterList)
        .map('provisioning')
        .flatten()
        .some({ connectorType: connectorType })
        .value();
    }
  }

  public provisionConnector(clusterId: string, connectorType: ConnectorType): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/add/invoke?connectorType=${connectorType}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public serviceIsSetUp(serviceId: HybridServiceId): ng.IPromise<boolean> {
    return this.getAll()
      .then((clusterList) => {
        return this.processClustersToSeeIfServiceIsSetup(serviceId, clusterList);
      });
  }

  public addExtendedPropertiesToClusters(clusters: IClusterWithExtendedConnectors[]): ng.IPromise<IExtendedClusterFusion[]> {
    const promises = _.map(clusters, (cluster) => {
      const isClusterEmpty = _.size(cluster.connectors) === 0;
      const allClusterAlarms = _.chain(cluster.connectors)
        .map((connector) => connector.alarms)
        .flatten<IConnectorAlarm>()
        .value();
      // to test
      let alarms: 'none' | 'warning' | 'error' = 'none'; // this type is duplicate of what's inside hybrid-services.types.ts?
      if (allClusterAlarms.length > 0) {
        alarms = _.some(allClusterAlarms, (alarm) => alarm.severity === 'critical' || alarm.severity === 'error') ? 'error' : 'warning';
      }
      // to test
      const hasUpgradeAvailable = _.some(cluster.connectors, (connector) => connector.extendedProperties.hasUpgradeAvailable);
      // no_nodes_registered or not_registered if _.size(connectors) === 0
      if (isClusterEmpty && cluster.targetType === 'c_mgmt') {
        return this.HybridServicesExtrasService.getPreregisteredClusterAllowList(cluster.id)
          .then((allowList: IAllowedRegistrationHost[]) => {
            return {
              ...cluster,
              extendedProperties: {
                alarms: alarms,
                alarmsBadgeCss: 'danger',
                allowedRedirectTarget: allowList[0],
                hasUpgradeAvailable: hasUpgradeAvailable,
                isEmpty: isClusterEmpty,
                maintenanceMode: this.getMaintenanceModeForCluster(cluster),
                registrationTimedOut: _.isUndefined(allowList[0]),
                servicesStatuses: [],
                upgradeState: this.getUpgradeState(cluster.connectors),
              },
            };
          });
      } else {
        return this.$q.resolve<IExtendedClusterFusion>({
          ...cluster,
          extendedProperties: {
            alarms: alarms,
            alarmsBadgeCss: 'danger',
            allowedRedirectTarget: undefined,
            hasUpgradeAvailable: hasUpgradeAvailable,
            isEmpty: isClusterEmpty,
            maintenanceMode: this.getMaintenanceModeForCluster(cluster),
            registrationTimedOut: false,
            servicesStatuses: [],
            upgradeState: this.getUpgradeState(cluster.connectors),
          },
        });
      }
    });
    return this.$q.all(promises);
  }

  public setClusterInformation(clusterId: string, data: { name?: string; releaseChannel?: string; }): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}`;
    return this.$http.patch<''>(url, data)
      .then(this.extractDataFromResponse);
  }

  public setUpgradeSchedule(id: string, params: any): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${id}/upgradeSchedule`;
    return this.$http.patch<''>(url, params)
      .then(this.extractDataFromResponse);
  }

  public updateHost(serial: string, params: any, orgId?: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/hosts/${serial}`;
    return this.$http.patch<''>(url, params)
      .then(this.extractDataFromResponse);
  }

  // PRIVATE

  /**
   * Take the connector data straigth from the API and adds a property named
   * `extendedProperties` containing `alarms` and `alarmsBadgeCss`. They represent
   * an overview of the alarms we can find on the connector.
   * @param {connector} IConnector
   * @return {IExtendedConnector}
   */
  // public only as long as ClusterService uses it
  public addExtendedPropertiesToConnector(connector: IConnector, cluster: ICluster): IExtendedConnector {
    let alarms: 'none' | 'warning' | 'error' = 'none'; // this type is duplicate of what's inside hybrid-services.types.ts?
    if (connector.alarms.length > 0) {
      alarms = _.some(connector.alarms, (alarm) => alarm.severity === 'critical' || alarm.severity === 'error') ? 'error' : 'warning';
    }
    return {
      ...connector,
      extendedProperties: {
        alarms: alarms,
        alarmsBadgeCss: 'danger',
        state: this.HybridServicesClusterStatesService.getConnectorStateDetails(connector),
        hasUpgradeAvailable: this.hasConnectorUpgradeAvailable(connector, cluster.provisioning), // to test
        maintenanceMode: this.getMaintenanceModeForConnector(connector), // to test
      },
    };
  }

  // public only as long as ClusterService uses it
  public addServicesStatusesToClusters(clusters: IExtendedClusterFusion[]): IExtendedClusterFusion[] {
    return _.map(clusters, cluster => {
      if (cluster.targetType === 'c_mgmt') {
        const mgmtConnectors = _.filter(cluster.connectors, { connectorType: 'c_mgmt' });
        const ucmcConnectors = _.filter(cluster.connectors, { connectorType: 'c_ucmc' });
        const calConnectors = _.filter(cluster.connectors, { connectorType: 'c_cal' });
        const impConnectors = _.filter(cluster.connectors, { connectorType: 'c_imp' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'squared-fusion-mgmt',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(mgmtConnectors),
          total: mgmtConnectors.length,
        }, {
          serviceId: 'squared-fusion-uc',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(ucmcConnectors),
          total: ucmcConnectors.length,
        }, {
          serviceId: 'squared-fusion-cal',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(calConnectors),
          total: calConnectors.length,
        }, {
          serviceId: 'spark-hybrid-impinterop',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(impConnectors),
          total: impConnectors.length,
        }];
      } else if (cluster.targetType === 'mf_mgmt') {
        const mediaConnectors = _.filter(cluster.connectors, { connectorType: 'mf_mgmt' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'squared-fusion-media',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(mediaConnectors),
          total: mediaConnectors.length,
        }];
      } else if (cluster.targetType === 'hds_app') {
        const hdsConnectors = _.filter(cluster.connectors, { connectorType: 'hds_app' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'spark-hybrid-datasecurity',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(hdsConnectors),
          total: hdsConnectors.length,
        }];
      } else if (cluster.targetType === 'cs_mgmt') {
        const hybridContextConnectors = _.filter(cluster.connectors, connector => (connector.connectorType === 'cs_mgmt' || connector.connectorType === 'cs_context'));
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'contact-center-context',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(hybridContextConnectors),
          total: hybridContextConnectors.length,
        }];
      } else if (cluster.targetType === 'ucm_mgmt') {
        const ucmConnectors = _.filter(cluster.connectors, { connectorType: 'ucm_mgmt' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'squared-fusion-khaos',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(ucmConnectors),
          total: ucmConnectors.length,
        }];
      }
      return cluster;
    });
  }

  /* Caution: This function is written with Hybrid Call in mind, and reflects their definition of High Availability (HA).
   * Before using it on other connectors, make sure to verify their HA definitions. Note that this function should not
   * be used for c_cal, because they do not follow this HA definition.   */
  public serviceHasHighAvailability(connectorType: ConnectorType, orgId?: string): ng.IPromise<boolean> {
    return this.getAll(orgId)
      .then((clusters) => {
        return _.filter(clusters, (cluster) => {
          return _.some(cluster.provisioning, (provisioning) => provisioning.connectorType === connectorType);
        });
      })
      .then((clusters) => {
        return _.map(clusters, (cluster) => {
          return _.reduce(cluster.connectors, (sum, connector) => sum + Number(connector.connectorType === connectorType) , 0);
        });
      })
      .then((connectorCounts) => {
        if (connectorCounts.length === 0) {
          return false;
        }
        return !_.some(connectorCounts, (connectorCount) => connectorCount < 2);
      });
  }

  private addUserCount(response): ng.IPromise<any> {
    if (response.groups.length === 0) {
      return response;
    }
    return this.USSService.getUserPropsSummary()
      .then((summary) => {
        return {
          groups: _.map(response.groups, (group: any) => {
            const countForGroup = _.find(summary.userCountByResourceGroup, (count) => {
              return count.resourceGroupId === group.id;
            });
            group.numberOfUsers = countForGroup ? countForGroup.numberOfUsers : 0;
            return group;
          }),
          unassigned: response.unassigned,
        };
      })
      .catch(() => {
        return {
          groups: _.map(response.groups, (group: any) => {
            group.numberOfUsers = '?';
            return group;
          }),
          unassigned: response.unassigned,
        };
      });
  }

  private extractClustersFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>): ICluster[] {
    return _.get(this.extractDataFromResponse(response), 'clusters', []);
  }

  private extractDataFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>): T {
    return _.get<T>(response, 'data');
  }

  // public only as long as ClusterService uses it
  public filterUnknownClusters(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.targetType !== 'unknown';
    });
  }

  /**
   * Mainly for Media Fusion team. They have an empty cluster they can't get rid of!
   * @param clusters ICluster[]
   */
  // to test
  public filterClustersWithEmptyNames(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.name !== '';
    });
  }

  /**
   * Filtering the old Context Connectors.
   * The issue is that the hosts show the new connectors as well as the old ones.
   * The old ones disappear after a few days, but we need to remove them from the list so that overall state shows correctly.
   * @param clusters
   * @returns ICluster[] clusters
   */
  // public only as long as ClusterService uses it
  public filterClustersWithBadContextConnectors(clusters: ICluster[]): ICluster[] {
    return _.map(clusters, cluster => {
      if (cluster.targetType === 'cs_mgmt') {
        cluster.connectors = _.filter(cluster.connectors, connector => connector.runningVersion !== HybridServicesClusterService.CONTEXT_CONNECTOR_OLD_VERSION);
      }
      return cluster;
    });
  }

  private sortClusters<T extends ICluster>(clusters: T[]): T[] {
    // Could be any predicate, but at least make it consistent between 2 page refresh
    return _.sortBy(clusters, ['targetType', 'name']);
  }

  private hasConnectorUpgradeAvailable(connector: IConnector, provisioning: IConnectorProvisioning[]): boolean {
    const provisioningType = _.find(provisioning, { connectorType: connector.connectorType });
    if (provisioningType) {
      // Upgrade available if:
      // - has the right type
      // - is not currently upgrading
      // - version is different from the available version
      return provisioningType.connectorType === connector.connectorType &&
        connector.upgradeState === 'upgraded' &&
        !_.isUndefined(provisioningType.availableVersion) && connector.runningVersion !== provisioningType.availableVersion;
    }
    return false;
  }

  private getMaintenanceModeForConnector(connector: IConnector): ConnectorMaintenanceMode {
    // `connector.maintenanceMode` should reflect the status it should be in (maps `maintenanceMode` on the node)
    // `connector.connectorStatus.maintenanceMode` is the latest mode received via an heartbeat
    const fromHeartbeat = _.get<IConnector, ConnectorMaintenanceMode>(connector, 'connectorStatus.maintenanceMode');
    if (connector.maintenanceMode === 'off') {
      return 'off';
    } else if (connector.maintenanceMode === 'on' && _.includes(['stopped', 'disabled', 'offline'], connector.state)) {
      return 'on';
    } else if (connector.maintenanceMode === 'on' && fromHeartbeat === 'off') {
      return 'pending';
    } else {
      return fromHeartbeat;
    }
  }

  // to test
  private getMaintenanceModeForCluster(cluster: IClusterWithExtendedConnectors): ConnectorMaintenanceMode {
    if (_.some(cluster.connectors, (connector) => connector.connectorStatus && connector.connectorStatus.maintenanceMode === 'pending')) {
      return 'pending';
    } else if (_.some(cluster.connectors, (connector) => connector.connectorStatus && connector.connectorStatus.maintenanceMode === 'on')) {
      return 'on';
    } else {
      return 'off';
    }
  }

  private getUpgradeState(connectors: IExtendedConnector[]): 'upgraded' | 'upgrading' {
    const allAreUpgraded = _.every(connectors, { upgradeState: 'upgraded' });
    return allAreUpgraded ? 'upgraded' : 'upgrading';
  }
}

export default angular
  .module('hercules.hybrid-services-cluster-service', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/hybrid-services-cluster-states.service').default,
    require('modules/hercules/services/hybrid-services-utils.service').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/core/config/urlConfig'),
    require('modules/hercules/services/uss.service').default,
  ])
  .service('HybridServicesClusterService', HybridServicesClusterService)
  .name;
