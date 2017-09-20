class LineLabel implements ng.IComponentController {
  public lineLabelToggle: boolean;
  public lineLabel: string;
  public applyToAllSharedLines: boolean;
  public onChangeFn: Function;
  public showApplyToAllSharedLines: boolean;

  /* @ngInject */
  constructor(
    private FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1485)
      .then((result) => {
        this.lineLabelToggle = result;
      });
    this.applyToAllSharedLines = false;
  }

  public onLineLabelChange(): void {
    this.change(this.lineLabel, this.applyToAllSharedLines);
  }

  private change(lineLabel: string, applyToAllSharedLines: boolean): void {
    this.onChangeFn({
      lineLabel: lineLabel,
      applyToAllSharedLines: applyToAllSharedLines,
    });
  }
}

export class LineLabelComponent implements ng.IComponentOptions {
  public controller = LineLabel;
  public template = require('modules/huron/lineLabel/lineLabel.html');
  public bindings = {
    onChangeFn: '&',
    lineLabel: '<',
    showApplyToAllSharedLines: '<',
    applyToAllSharedLines: '=',
  };
}
