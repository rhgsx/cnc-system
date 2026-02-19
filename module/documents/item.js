/**
 * Core & Cold Item Document
 */

export class CNCItem extends Item {

  /**
   * Prepare derived data for the item
   */
  prepareDerivedData() {
    const item = this;
    const system = item.system;

    // Type-specific preparations
    if (item.type === 'weapon') {
      this._prepareWeaponData(system);
    } else if (item.type === 'armor') {
      this._prepareArmorData(system);
    } else if (item.type === 'flaw') {
      this._prepareFlawData(system);
    } else if (item.type === 'perk') {
      this._preparePerkData(system);
    }
  }

  /**
   * Prepare weapon data
   */
  _prepareWeaponData(system) {
    // Light weapons get +2 to hit
    if (system.weaponSize === 'light') {
      system.hitBonus = 2;
    } else {
      system.hitBonus = 0;
    }

    // Heavy weapons ignore 2 armor
    if (system.weaponSize === 'heavy') {
      system.armorIgnore = 2;
    } else {
      system.armorIgnore = 0;
    }
  }

  /**
   * Prepare armor data
   */
  _prepareArmorData(system) {
    // Armor damage reduction is set directly
    system.damageReduction.current = system.damageReduction.base;
  }

  /**
   * Prepare flaw data - calculate XP value
   */
  _prepareFlawData(system) {
    const severityXP = { 1: 10, 2: 20, 3: 30 };
    system.xpValue = severityXP[system.severity] || 10;
  }

  /**
   * Prepare perk data - calculate XP cost
   */
  _preparePerkData(system) {
    const levelXP = { 1: 5, 2: 10, 3: 15 };
    system.xpCost = levelXP[system.level] || 5;
  }

  /**
   * Roll an attack with this weapon
   */
  async rollAttack(options = {}) {
    if (this.type !== 'weapon') {
      ui.notifications.error('Можно атаковать только оружием');
      return null;
    }

    const actor = this.parent;
    if (!actor) return null;

    const skill = this.system.attackSkill;
    const skillData = actor.system.skills[skill];
    
    let formula = `2d10 + ${skillData?.bonus || 0}`;
    
    // Add bonus for light weapons
    if (this.system.weaponSize === 'light') {
      formula += ' + 2';
    }

    const roll = await new Roll(formula).evaluate();
    const isCritical = this._isCritical(roll);
    const isFumble = this._isFumble(roll);

    // Create chat message
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: await this._createAttackMessage(roll, {
        weapon: this,
        isCritical,
        isFumble
      }),
      rolls: [roll]
    };

    await ChatMessage.create(chatData);

    // Check for weapon breakage (ones on dice)
    if (isFumble) {
      const ones = this._countOnes(roll);
      if (ones > 0) {
        ui.notifications.warn(`${this.name} получил ${ones} единиц(ы) на кубах - риск поломки!`);
      }
    }

    return roll;
  }

  /**
   * Roll damage with this weapon
   */
  async rollDamage(options = {}) {
    if (this.type !== 'weapon') {
      ui.notifications.error('Можно наносить урон только оружием');
      return null;
    }

    const actor = this.parent;
    if (!actor) return null;

    // Base damage + skill bonus
    let damage = this.system.damage.base;
    
    // Add exceed if provided
    if (options.exceed) {
      damage += options.exceed;
    }

    // Subtract target armor if provided
    let armorReduction = 0;
    if (options.targetArmor) {
      armorReduction = options.targetArmor;
      // Heavy weapons ignore 2 armor
      if (this.system.weaponSize === 'heavy') {
        armorReduction = Math.max(0, armorReduction - 2);
      }
    }

    const finalDamage = Math.max(0, damage - armorReduction);

    // Create chat message
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: await this._createDamageMessage({
        weapon: this,
        baseDamage: this.system.damage.base,
        exceed: options.exceed || 0,
        armorReduction,
        finalDamage
      })
    };

    await ChatMessage.create(chatData);

    return { damage: finalDamage, armor: armorReduction };
  }

  /**
   * Check if roll is critical success (natural 20)
   */
  _isCritical(roll) {
    const dice = roll.terms[0];
    if (!dice || !dice.results) return false;
    return dice.results.reduce((sum, r) => sum + r.result, 0) === 20;
  }

  /**
   * Check if roll is fumble (natural 2)
   */
  _isFumble(roll) {
    const dice = roll.terms[0];
    if (!dice || !dice.results) return false;
    return dice.results.reduce((sum, r) => sum + r.result, 0) === 2;
  }

  /**
   * Count ones on dice (for weapon breakage)
   */
  _countOnes(roll) {
    const dice = roll.terms[0];
    if (!dice || !dice.results) return 0;
    return dice.results.filter(r => r.result === 1).length;
  }

  /**
   * Create attack message HTML
   */
  async _createAttackMessage(roll, context) {
    const template = 'systems/cnc-system/templates/chat/roll-message.html';
    return renderTemplate(template, {
      roll,
      actor: this.parent,
      item: this,
      context: {
        type: 'attack',
        label: `${game.i18n.localize('CNC.Attack')} - ${this.name}`,
        isCritical: context.isCritical,
        isFumble: context.isFumble
      }
    });
  }

  /**
   * Create damage message HTML
   */
  async _createDamageMessage(context) {
    const template = 'systems/cnc-system/templates/chat/damage-message.html';
    return renderTemplate(template, {
      weapon: this,
      actor: this.parent,
      context
    });
  }

  /**
   * Use a consumable item
   */
  async use() {
    if (this.type !== 'consumable') {
      ui.notifications.error('Можно использовать только расходуемые предметы');
      return false;
    }

    if (this.system.uses.current <= 0) {
      ui.notifications.warn('У этого предмета закончились использования');
      return false;
    }

    await this.update({
      'system.uses.current': this.system.uses.current - 1
    });

    return true;
  }

  /**
   * Toggle equipment state
   */
  async toggleEquipped() {
    if (!this.system.equipped !== undefined) {
      return;
    }

    await this.update({
      'system.equipped': !this.system.equipped
    });
  }
}