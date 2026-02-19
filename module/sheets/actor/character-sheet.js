/**
 * Core & Cold Character Sheet
 */

export class CharacterSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cnc', 'sheet', 'actor', 'character'],
      template: 'systems/cnc-system/templates/actor/character-sheet.html',
      width: 800,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'attributes'
      }],
      scrollY: ['.inventory-list', '.perks-list', '.flaws-section']
    });
  }

  /**
   * Prepare data for template rendering
   */
  async getData(options) {
    const context = await super.getData(options);
    const actor = this.actor;
    const system = actor.system;

    // System configuration
    context.config = CONFIG.CNC;

    // Group skills by attribute
    context.skillGroups = this._groupSkills();

    // Filter items by type
    context.weapons = actor.items.filter(i => i.type === 'weapon' && i.system.equipped);
    context.armors = actor.items.filter(i => i.type === 'armor' && i.system.equipped);
    context.shields = actor.items.filter(i => i.type === 'shield' && i.system.equipped);
    context.inventoryItems = actor.items.filter(i => 
      ['weapon', 'armor', 'shield', 'tool', 'consumable', 'equipment'].includes(i.type)
    );

    // Character-specific items
    context.heritage = actor.items.find(i => i.type === 'heritage');
    context.paths = actor.items.filter(i => i.type === 'path');
    context.perks = actor.items.filter(i => i.type === 'perk');
    context.flaws = actor.items.filter(i => i.type === 'flaw');
    context.flawsXpTotal = context.flaws.reduce((sum, f) => sum + (f.system.xpValue || 0), 0);

    // Loadout percentage
    if (system.loadout) {
      context.loadoutPercent = Math.min(100, 
        (system.loadout.used / system.loadout.capacity) * 100
      );
    }

    return context;
  }

  /**
   * Group skills by attribute
   */
  _groupSkills() {
    const groups = {
      strength: { label: 'CNC.Attributes.strength', skills: [] },
      agility: { label: 'CNC.Attributes.agility', skills: [] },
      mind: { label: 'CNC.Attributes.mind', skills: [] },
      will: { label: 'CNC.Attributes.will', skills: [] }
    };

    for (const [key, skill] of Object.entries(CONFIG.CNC.skills)) {
      groups[skill.attribute].skills.push(key);
    }

    return groups;
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Attribute rolls
    html.find('.roll-attribute').click(this._onRollAttribute.bind(this));

    // Skill rolls
    html.find('.roll-skill').click(this._onRollSkill.bind(this));

    // Initiative roll
    html.find('.roll-initiative').click(this._onRollInitiative.bind(this));

    // Toggle defense
    html.find('.toggle-defense').click(this._onToggleDefense.bind(this));

    // Attack roll
    html.find('.attack-roll').click(this._onAttackRoll.bind(this));

    // Item edit
    html.find('.item-edit').click(this._onItemEdit.bind(this));

    // Item delete
    html.find('.item-delete').click(this._onItemDelete.bind(this));

    // Item create
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Toggle equipped
    html.find('.toggle-equipped').click(this._onToggleEquipped.bind(this));

    // Reset action points
    html.find('.reset-ap').click(this._onResetActionPoints.bind(this));

    // Rest buttons
    html.find('.short-rest').click(this._onShortRest.bind(this));
    html.find('.long-rest').click(this._onLongRest.bind(this));
  }

  /**
   * Handle attribute roll
   */
  async _onRollAttribute(event) {
    event.preventDefault();
    const attribute = event.currentTarget.closest('.attribute-box').dataset.attribute;
    await this.actor.rollAttribute(attribute);
  }

  /**
   * Handle skill roll
   */
  async _onRollSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.closest('.skill-row').dataset.skill;
    await this.actor.rollSkill(skill);
  }

  /**
   * Handle initiative roll
   */
  async _onRollInitiative(event) {
    event.preventDefault();
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn('Нет активного боя');
      return;
    }
    await this.actor.rollInitiative({ combat });
  }

  /**
   * Handle defense toggle
   */
  async _onToggleDefense(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const field = type === 'dodge' ? 'activeDodge' : 'activeMental';
    const current = this.actor.system.defense[field].active;
    
    await this.actor.update({
      [`system.defense.${field}.active`]: !current
    });
  }

  /**
   * Handle attack roll
   */
  async _onAttackRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const weapon = this.actor.items.get(itemId);
    if (weapon) {
      await weapon.rollAttack();
    }
  }

  /**
   * Handle item edit
   */
  _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      item.sheet.render(true);
    }
  }

  /**
   * Handle item delete
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      const confirmed = await Dialog.confirm({
        title: game.i18n.localize('CNC.Dialog.deleteItem'),
        content: `<p>${game.i18n.format('CNC.Dialog.deleteItemConfirm', { name: item.name })}</p>`
      });
      if (confirmed) {
        await item.delete();
      }
    }
  }

  /**
   * Handle item create
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    
    const itemData = {
      name: game.i18n.format('CNC.Item.new', { type: game.i18n.localize(`CNC.ItemTypes.${type}`) }),
      type: type,
      system: {}
    };

    await this.actor.createEmbeddedDocuments('Item', [itemData]);
  }

  /**
   * Handle toggle equipped
   */
  async _onToggleEquipped(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item && item.system.equipped !== undefined) {
      await item.update({ 'system.equipped': !item.system.equipped });
    }
  }

  /**
   * Handle reset action points
   */
  async _onResetActionPoints(event) {
    event.preventDefault();
    await this.actor.update({ 
      'system.actionPoints.current': this.actor.system.actionPoints.max 
    });
  }

  /**
   * Handle short rest
   */
  async _onShortRest(event) {
    event.preventDefault();
    
    // Show dialog to choose stress type
    const stressType = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize('CNC.Rest.short'),
        content: `
          <p>${game.i18n.localize('CNC.Rest.chooseStress')}</p>
          <select id="stress-type">
            <option value="physical">${game.i18n.localize('CNC.Stress.physical')}</option>
            <option value="mental">${game.i18n.localize('CNC.Stress.mental')}</option>
          </select>
        `,
        buttons: {
          ok: {
            label: game.i18n.localize('CNC.Rest.rest'),
            callback: (html) => resolve(html.find('#stress-type').val())
          },
          cancel: {
            label: game.i18n.localize('CNC.Cancel'),
            callback: () => resolve(null)
          }
        }
      }).render(true);
    });

    if (stressType) {
      const current = this.actor.system.stress[stressType].value;
      await this.actor.update({
        [`system.stress.${stressType}.value`]: Math.max(0, current - 1)
      });
      ui.notifications.info(game.i18n.localize('CNC.Rest.shortComplete'));
    }
  }

  /**
   * Handle long rest
   */
  async _onLongRest(event) {
    event.preventDefault();
    const result = await this.actor.rest('long');
    ui.notifications.info(result.message);
  }
}