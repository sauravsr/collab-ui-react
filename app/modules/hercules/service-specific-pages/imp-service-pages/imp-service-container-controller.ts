import { ExpresswayContainerController } from 'modules/hercules/service-specific-pages/common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ClusterService } from 'modules/hercules/services/cluster-service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class ImpServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
    title: 'common.resources',
    state: 'imp-service.list',
  }, {
    title: 'common.settings',
    state: 'imp-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_imp',
      serviceId: () => 'spark-hybrid-impinterop',
      firstTimeSetup: false,
    },
    controller: 'AddResourceController',
    controllerAs: 'vm',
    templateUrl: 'modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html',
    type: 'small',
  };

  /* @ngInject */
  constructor(
    $modal,
    $scope: ng.IScope,
    $state: ng.ui.IStateService,
    public clusterId: string,
    ClusterService: ClusterService,
    Notification: Notification,
    ServiceDescriptorService: ServiceDescriptorService,
    ServiceStateChecker,
    USSService,
  ) {
    super($modal, $scope, $state, ClusterService, true, Notification, ServiceDescriptorService, ServiceStateChecker, USSService, ['spark-hybrid-impinterop'], 'c_imp');
  }

}

angular
  .module('Hercules')
  .controller('ImpServiceContainerController', ImpServiceContainerController);
