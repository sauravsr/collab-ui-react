(function () {
  'use strict';

  angular.module('Sunlight')
    .service('DrillDownReportProps', drillDownReportProps);

  /* @ngInject */
  function drillDownReportProps($translate, ReportConstants, uiGridConstants) {
    var broadcastRefresh = 'DrilldownReport::Refresh';
    var broadcastReset = 'DrilldownReport::Reset';

    function getDefaultProps() {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset,
        },
        description: '',
        display: false,
        hasData: true,
        emptyDescription: '',
        errorDescription: '',
        show: '',
        hide: '',
        search: true,
        searchPlaceholder: '',
        state: ReportConstants.SET,
        table: {
          gridOptions: {
            data: 'gridData',
            multiSelect: false,
            enableRowHeaderSelection: false,
            enableColumnResize: true,
            enableSorting: true,
            enableFiltering: true,
            enableColumnMenus: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            paginationPageSize: 5,
            enablePaginationControls: false,
            rowHeight: 42,
            columnDefs: [],
          },
          pagination: {
            maxPages: 3,
          },
        },
        title: '',
      };
    }

    function taskIncomingDrilldownProps(timeSelected, isVideoEnabled, mediaType) {
      var shouldDisplayWebcall = shouldDisplayWebcallFn(isVideoEnabled, mediaType);
      var props = {
        description: function () {
          return $translate.instant('taskIncoming.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        emptyDescription: function () {
          return $translate.instant('taskIncoming.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('taskIncoming.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('taskIncoming.drilldownShow');
        },
        hide: function () {
          return $translate.instant('taskIncoming.drilldownHide');
        },
        searchPlaceholder: $translate.instant('taskIncoming.drilldownSearchPlaceholder'),
        table: {
          gridOptions: {
            columnDefs: [
              {
                field: 'displayName',
                id: 'userName',
                displayName: $translate.instant('taskIncoming.user'),
                width: shouldDisplayWebcall ? '30%' : '60%',
                sortable: true,
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                cellClass: function (grid, row) {
                  return getClassName(grid, row);
                },
              }, {
                field: 'tasksHandled',
                id: 'tasksHandled',
                displayName: shouldDisplayWebcall ? $translate.instant('careReportsPage.media_type_chat') :
                  $translate.instant('taskIncoming.tasksHandled'),
                enableFiltering: false,
                width: shouldDisplayWebcall ? '30%' : '40%',
                sortable: true,
                sort: {
                  direction: uiGridConstants.DESC,
                },
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              },
            ],
          },
        },
        title: function () {
          return $translate.instant('taskIncoming.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
      if (shouldDisplayWebcall) {
        props.table.gridOptions.columnDefs.push({
          field: 'webcallTasksHandled',
          id: 'webcallTasksHandled',
          displayName: $translate.instant('careReportsPage.media_type_webcall'),
          enableFiltering: false,
          width: '40%',
          sortable: true,
          sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
        });
      }

      return _.merge(getDefaultProps(), props);
    }

    function taskOfferedDrilldownProps(timeSelected) {
      var props = {
        description: function () {
          return $translate.instant('taskOffered.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        emptyDescription: function () {
          return $translate.instant('taskOffered.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('taskOffered.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('taskOffered.drilldownShow');
        },
        hide: function () {
          return $translate.instant('taskOffered.drilldownHide');
        },
        searchPlaceholder: $translate.instant('taskOffered.drilldownSearchPlaceholder'),
        table: {
          gridOptions: {
            columnDefs: [
              {
                field: 'displayName',
                id: 'userName',
                displayName: $translate.instant('taskOffered.user'),
                width: '33%',
                sortable: true,
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                cellClass: function (grid, row) {
                  return getClassName(grid, row);
                },
              }, {
                field: 'tasksOffered',
                id: 'tasksOffered',
                displayName: $translate.instant('taskOffered.tasksOffered'),
                enableFiltering: false,
                width: '22%',
                sortable: true,
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              }, {
                field: 'tasksAccepted',
                id: 'tasksAccepted',
                displayName: $translate.instant('taskOffered.tasksAccepted'),
                enableFiltering: false,
                width: '23%',
                sortable: true,
                sort: {
                  direction: uiGridConstants.DESC,
                },
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              }, {
                field: 'tasksMissed',
                id: 'tasksMissed',
                displayName: $translate.instant('taskOffered.tasksMissed'),
                enableFiltering: false,
                width: '22%',
                sortable: true,
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              },
            ],
          },
        },
        title: function () {
          return $translate.instant('taskOffered.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
      return _.merge(getDefaultProps(), props);
    }

    function avgCsatDrilldownProps(timeSelected, isVideoEnabled, mediaType) {
      var shouldDisplayWebcall = shouldDisplayWebcallFn(isVideoEnabled, mediaType);
      var props = {
        description: function () {
          return $translate.instant('averageCsat.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        emptyDescription: function () {
          return $translate.instant('averageCsat.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('averageCsat.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('averageCsat.drilldownShow');
        },
        hide: function () {
          return $translate.instant('averageCsat.drilldownHide');
        },
        searchPlaceholder: $translate.instant('averageCsat.drilldownSearchPlaceholder'),
        table: {
          gridOptions: {
            columnDefs: [
              {
                field: 'displayName',
                id: 'userName',
                displayName: $translate.instant('averageCsat.user'),
                width: shouldDisplayWebcall ? '30%' : '60%',
                sortable: true,
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                cellClass: function (grid, row) {
                  return getClassName(grid, row);
                },
              }, {
                field: 'avgCsatScore',
                id: 'averageCsat',
                displayName: shouldDisplayWebcall ? $translate.instant('careReportsPage.media_type_chat') :
                  $translate.instant('averageCsat.averageCsat'),
                type: 'string',
                enableFiltering: false,
                cellFilter: 'careAvgCSAT',
                width: shouldDisplayWebcall ? '30%' : '40%',
                sortable: true,
                sort: {
                  direction: uiGridConstants.DESC,
                },
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              },
            ],
          },
        },
        title: function () {
          return $translate.instant('averageCsat.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
      if (shouldDisplayWebcall) {
        props.table.gridOptions.columnDefs.push({
          field: 'avgWebcallCsatScore',
          id: 'avgWebcallCsatScore',
          displayName: $translate.instant('careReportsPage.media_type_webcall'),
          type: 'string',
          enableFiltering: false,
          cellFilter: 'careAvgCSAT',
          width: '40%',
          sortable: true,
          sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
        });
      }
      return _.merge(getDefaultProps(), props);
    }

    function taskTimeDrilldownProps(timeSelected, isVideoEnabled, mediaType) {
      var shouldDisplayWebcall = shouldDisplayWebcallFn(isVideoEnabled, mediaType);
      var props = {
        description: function () {
          return $translate.instant('taskTime.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        emptyDescription: function () {
          return $translate.instant('taskTime.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('taskTime.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('taskTime.drilldownShow');
        },
        hide: function () {
          return $translate.instant('taskTime.drilldownHide');
        },
        searchPlaceholder: $translate.instant('taskTime.drilldownSearchPlaceholder'),
        table: {
          gridOptions: {
            columnDefs: [
              {
                field: 'displayName',
                id: 'userName',
                displayName: $translate.instant('taskTime.user'),
                width: shouldDisplayWebcall ? '30%' : '60%',
                sortable: true,
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
                cellClass: function (grid, row) {
                  return getClassName(grid, row);
                },
              }, {
                field: 'avgHandleTime',
                id: 'avgHandleTime',
                displayName: shouldDisplayWebcall ? $translate.instant('careReportsPage.media_type_chat') :
                  $translate.instant('taskTime.averageHandleTime'),
                cellFilter: 'careTime',
                enableFiltering: false,
                width: shouldDisplayWebcall ? '30%' : '40%',
                sortable: true,
                sort: {
                  direction: uiGridConstants.ASC,
                },
                sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              },
            ],
          },
        },
        title: function () {
          return $translate.instant('taskTime.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
      if (shouldDisplayWebcall) {
        props.table.gridOptions.columnDefs.push({
          field: 'avgWebcallHandleTime',
          id: 'avgWebcallHandleTime',
          displayName: $translate.instant('careReportsPage.media_type_webcall'),
          cellFilter: 'careTime',
          enableFiltering: false,
          width: '40%',
          sortable: true,
          sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
        });
      }
      return _.merge(getDefaultProps(), props);
    }

    var service = {
      taskIncomingDrilldownProps: taskIncomingDrilldownProps,
      taskOfferedDrilldownProps: taskOfferedDrilldownProps,
      taskTimeDrilldownProps: taskTimeDrilldownProps,
      avgCsatDrilldownProps: avgCsatDrilldownProps,
      broadcastRefresh: broadcastRefresh,
      broadcastReset: broadcastReset,
    };

    return service;
  }

  function shouldDisplayWebcallFn(isVideoEnabled, mediaType) {
    return isVideoEnabled && mediaType === 'chat';
  }

  function getClassName(grid, row) {
    var className = '';

    if (row.entity.isError) {
      className = 'ui-grid-ui-error';
    } else if (row.entity.isUserDeleted) {
      className = 'ui-grid-ui-deleted';
    }
    return className;
  }
})();
