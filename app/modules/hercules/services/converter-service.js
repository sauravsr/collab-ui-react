'use strict';

angular.module('Hercules')
  .service('ConverterService', [
    function ConverterService() {

      var getAvailableSoftwareUpgradeForService = function (service, cluster) {
        if (cluster.provisioning_data && cluster.provisioning_data.not_approved_packages) {
          return _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
            return pkg.service.service_type == service.service_type;
          });
        }
      };

      var anyApprovedPackagesForService = function (service, cluster) {
        if (cluster.provisioning_data && cluster.provisioning_data.approved_packages) {
          return _.find(cluster.provisioning_data.approved_packages, function (pkg) {
            return pkg.service.service_type == service.service_type;
          });
        }
        return false;
      };

      var deduceAlarmsForService = function (service, cluster) {
        if (cluster.provisioning_data && cluster.provisioning_data.approved_packages) {
          var expected_package = _.find(cluster.provisioning_data.approved_packages, function (pkg) {
            return pkg.service.service_type == service.service_type;
          });

          var expected_version = !expected_package ? null : expected_package.version;

          _.each(service.connectors, function (connector) {
            connector.deduced_alarms = connector.deduced_alarms || [];
            if (expected_version && connector.state == 'running' && connector.version != expected_version) {
              connector.deduced_alarms.push({
                type: 'software_version_mismatch',
                expected_version: expected_version
              });
              service.alarm_count++;
              serviceAndClusterNeedsAttention(service, cluster);
            }
          });
        }
      };

      var updateServiceStatus = function (service, cluster) {
        service.running_hosts = 0;
        service.alarm_count = 0;
        _.each(service.connectors, function (connector) {
          if (service.state && connector.state != service.state) {
            service.state = 'needs_attention';
          } else {
            service.state = connector.state;
          }
          service.alarm_count += connector.alarms ? connector.alarms.length : 0;
          if ((connector.alarms && connector.alarms.length) || (connector.state != 'running' && connector.state != 'disabled')) {
            serviceAndClusterNeedsAttention(service, cluster);
            service.is_disabled = false;
          }
          if (connector.state == 'disabled' && service.running_hosts === 0) {
            service.is_disabled = true;
          }
          if (connector.state == 'running') {
            service.is_disabled = false;
            service.running_hosts = ++service.running_hosts;
          }
        });
        if (service.running_hosts) {
          cluster.running_hosts = true;
        }
      };

      var serviceAndClusterNeedsAttention = function (service, cluster) {
        cluster.needs_attention = true;
        service.needs_attention = true;
      };

      var updateSoftwareUpgradeAvailableDetails = function (service, cluster) {
        if (cluster.provisioning_data) {
          service.installed = service.connectors.length > 0;
          var not_approved_package = getAvailableSoftwareUpgradeForService(service, cluster);
          if (not_approved_package) {
            service.software_upgrade_available = true;
            cluster.software_upgrade_available = true;
            service.not_approved_package = not_approved_package;
            service.install_available = !service.installed && !anyApprovedPackagesForService(service, cluster);
          }
        }
      };

      var updateClusterNameIfNotSet = function (cluster) {
        if (!cluster.name) {
          var host = _.find(cluster.hosts, function (host) {
            if (host.host_name) {
              return host.host_name;
            }
          });
          if (host) {
            cluster.name = host.host_name;
          }
        }
      };

      var updateHostStatus = function (cluster) {
        var connectors = _(cluster.services)
          .map(function (service) {
            return service.connectors;
          })
          .flatten()
          .value();

        var map = _.reduce(connectors, function (map, connector) {
          var host = connector.host ? connector.host.host_name : 'null';
          map[host] = map[host] || [];
          map[host].push(connector.state);
          return map;
        }, {});

        _.each(cluster.hosts, function (host) {
          host.services = [];
          host.offline = false;
          if (map[host.host_name]) {
            host.offline = _.reduce(map[host.host_name], function (offline, status) {
              return offline && status == 'offline';
            }, true);
          }
          _.each(cluster.services, function (service) {
            _.each(service.connectors, function (connector) {
              if (connector.host.serial == host.serial) {
                if (host.state && connector.state != host.state) {
                  host.state = 'needs_attention';
                } else {
                  host.state = connector.state;
                }
                host.services.push({
                  display_name: service.display_name,
                  state: connector.state
                });
              }
            });
          });
        });
      };

      var convertClusters = function (data) {
        var converted = _.map(data, function (origCluster) {
          var cluster = _.cloneDeep(origCluster);
          _.each(cluster.services, function (service) {
            updateServiceStatus(service, cluster);
            updateSoftwareUpgradeAvailableDetails(service, cluster);
            deduceAlarmsForService(service, cluster);
          });
          updateClusterNameIfNotSet(cluster);
          updateHostStatus(cluster);

          cluster.services = _.sortBy(cluster.services, 'display_name');
          cluster.services = _.sortBy(cluster.services, function (obj) {
            if (obj.needs_attention) return 1;
            if (obj.is_disabled) return 3;
            return 2;
          });

          return cluster;
        });
        return _.sortBy(converted, function (obj) {
          return !obj.needs_attention;
        });
      };

      return {
        convertClusters: convertClusters
      };
    }
  ]);
