export class ArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cnc', 'sheet', 'item', 'armor'],
      template: 'systems/cnc-system/templates/item/armor-sheet.html',
      width: 400,
      height: 400
    });
  }
  async getData(options) {
    const context = await super.getData(options);
    context.config = CONFIG.CNC;
    return context;
  }
}