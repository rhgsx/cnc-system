/**
 * Core & Cold NPC Sheet
 */

export class NPCSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cnc', 'sheet', 'actor', 'npc'],
      template: 'systems/cnc-system/templates/actor/npc-sheet.html',
      width: 600,
      height: 500,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'attributes'
      }]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.config = CONFIG.CNC;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    html.find('.roll-attribute').click(this._onRollAttribute.bind(this));
    html.find('.roll-skill').click(this._onRollSkill.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attribute = event.currentTarget.closest('.attribute-box').dataset.attribute;
    await this.actor.rollAttribute(attribute);
  }

  async _onRollSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.closest('.skill-row').dataset.skill;
    await this.actor.rollSkill(skill);
  }

  _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) await item.delete();
  }
}