import { ClusterService } from 'modules/hercules/services/cluster-service';
import { ConnectorType } from 'modules/hercules/hybrid-services.types';

export interface IGridApiScope extends ng.IScope {
  gridApi?: any;
}

export class HybridServiceClusterListCtrl implements ng.IComponentController {

  public clusterList: any = {};
  public clusterListGridOptions = {};
  public getSeverity = this.FusionClusterStatesService.getSeverity;

  private serviceId: string;
  private connectorType: ConnectorType;
  private clusterId: string;

  /* @ngInject */
  constructor(
    private $scope: IGridApiScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private ClusterService: ClusterService,
    private FusionClusterService,
    private FusionClusterStatesService,
    private HybridServicesUtils,
  ) {
    this.updateClusters = this.updateClusters.bind(this);
  }

  public $onInit() {
    this.connectorType = this.HybridServicesUtils.serviceId2ConnectorType(this.serviceId);
    this.clusterList = this.ClusterService.getClustersByConnectorType(this.connectorType);
    this.clusterListGridOptions = {
      data: '$ctrl.clusterList',
      enableSorting: false,
      multiSelect: false,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      rowHeight: 75,
      columnDefs: [{
        field: 'name',
        displayName: this.$translate.instant(`hercules.clusterListComponent.clusters-title-${this.serviceId}`),
        cellTemplate: 'modules/hercules/service-specific-pages/components/cluster-list/cluster-list-display-name.html',
        width: '35%',
      }, {
        field: 'serviceStatus',
        displayName: this.$translate.instant('hercules.clusterListComponent.status-title'),
        cellTemplate: 'modules/hercules/service-specific-pages/components/cluster-list/cluster-list-status.html',
        width: '65%',
      }],
      onRegisterApi: (gridApi) => {
        this.$scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.goToSidepanel(row.entity.id);
        });
        if (!_.isUndefined(this.clusterId) && this.clusterId !== null) {
          this.goToSidepanel(this.clusterId);
        }
      },
    };
    this.ClusterService.subscribe('data', this.updateClusters, {
      scope: this.$scope,
    });
  }

  protected updateClusters() {
    if (this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-uc') {
      this.FusionClusterService.setClusterAllowListInfoForExpressway(this.ClusterService.getClustersByConnectorType(this.connectorType))
        .then((clusters) => {
          this.clusterList = clusters;
        })
        .catch(() => {
          this.clusterList = this.ClusterService.getClustersByConnectorType(this.connectorType);
        });
    } else if (this.serviceId === 'spark-hybrid-datasecurity' ||
               this.serviceId === 'squared-fusion-media' ||
               this.serviceId === 'contact-center-context') {
      this.clusterList = this.ClusterService.getClustersByConnectorType(this.connectorType);
    }
  }

  private goToSidepanel(clusterId: string) {
    let routeMap = {
      'squared-fusion-cal': 'expressway-cluster-sidepanel',
      'squared-fusion-uc': 'expressway-cluster-sidepanel',
      'squared-fusion-media': 'media-cluster-details',
      'spark-hybrid-datasecurity': 'hds-cluster-details',
      'contact-center-context': 'context-cluster-sidepanel',
    };

    this.$state.go(routeMap[this.serviceId], {
      clusterId: clusterId,
      connectorType: this.connectorType,
    });

  }

}

export class HybridServiceClusterListComponent implements ng.IComponentOptions {
  public controller = HybridServiceClusterListCtrl;
  public templateUrl = 'modules/hercules/service-specific-pages/components/cluster-list/hybrid-service-cluster-list.html';
  public bindings = {
    serviceId: '<',
    clusterId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('hybridServiceClusterList', new HybridServiceClusterListComponent())
  .name;
