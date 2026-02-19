export class WeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cnc', 'sheet', 'item', 'weapon'],
      template: 'systems/cnc-system/templates/item/weapon-sheet.html',
      width: 400,
      height: 500
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.config = CONFIG.CNC;
    return context;
  }
}