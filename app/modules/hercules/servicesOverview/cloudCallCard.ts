/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewCallCard extends ServicesOverviewCard {
    // private moreButton:CardButton = {name: 'servicesOverview.showMore', link: ''};

    getShowMoreButton():servicesOverview.CardButton {
      // if (this._buttons.length > 3) {
      //   return this.moreButton;
      // }
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.call.buttons.numbers', link: 'hurondetails/lines', buttonClass:'btn-link'},
      {name: 'servicesOverview.cards.call.buttons.features', link: 'hurondetails/features', buttonClass:'btn-link'},
      {name: 'servicesOverview.cards.call.buttons.settings', link: 'hurondetails/settings', buttonClass:'btn-link'}];

    getButtons():Array<servicesOverview.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.call.title', 'servicesOverview.cards.call.description', 'icon-circle-call', true, 'cta-bar');
      this._loading = false;
    }
  }
}
