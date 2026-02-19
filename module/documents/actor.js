/**
 * Core & Cold Actor Document
 */

export class CNCActor extends Actor {

  /**
   * Prepare derived data for the actor
   */
  prepareDerivedData() {
    const actor = this;
    const system = actor.system;

    // Calculate attribute totals
    this._prepareAttributes(system);
    
    // Calculate skill bonuses
    this._prepareSkills(system);
    
    // Calculate defense values
    this._prepareDefense(system);
    
    // Calculate initiative
    this._prepareInitiative(system);
    
    // Calculate loadout capacity
    this._prepareLoadout(system);
    
    // Calculate stress maximums
    this._prepareStress(system);
    
    // Update weapon damage based on attributes
    this._prepareWeaponDamage();
  }

  /**
   * Calculate attribute totals
   */
  _prepareAttributes(system) {
    for (const [key, attr] of Object.entries(system.attributes)) {
      attr.total = attr.value + attr.bonus;
      attr.label = `CNC.Attributes.${key}`;
    }
  }

  /**
   * Calculate skill bonuses (attribute + skill level)
   */
  _prepareSkills(system) {
    for (const [key, skill] of Object.entries(system.skills)) {
      const attrValue = system.attributes[skill.attribute]?.total || 0;
      skill.bonus = attrValue + skill.value;
      skill.label = `CNC.Skills.${key}`;
    }
  }

  /**
   * Calculate defense values
   */
  _prepareDefense(system) {
    // Passive physical defense = 10 + Agility + Vigilance
    system.defense.passiveDodge.value = 10 + 
      system.attributes.agility.total + 
      (system.skills.vigilance?.bonus || 0);

    // Active physical defense = 15 + Agility + Vigilance
    system.defense.activeDodge.value = 15 + 
      system.attributes.agility.total + 
      (system.skills.vigilance?.bonus || 0);

    // Passive mental defense = 10 + Will + Insight
    system.defense.passiveMental.value = 10 + 
      system.attributes.will.total + 
      (system.skills.insight?.bonus || 0);

    // Active mental defense = 15 + Will + Insight
    system.defense.activeMental.value = 15 + 
      system.attributes.will.total + 
      (system.skills.insight?.bonus || 0);
  }

  /**
   * Calculate initiative modifier
   */
  _prepareInitiative(system) {
    system.initiative.value = system.attributes.mind.total + system.attributes.agility.total;
  }

  /**
   * Calculate loadout capacity and overload
   */
  _prepareLoadout(system) {
    if (!system.loadout) return;
    
    // Capacity = Strength + 6
    system.loadout.capacity = system.attributes.strength.total + 6;
    
    // Calculate used capacity from items
    system.loadout.used = this._calculateUsedCapacity();
    
    // Overload level
    const overload = system.loadout.used - system.loadout.capacity;
    system.loadout.overloadLevel = Math.max(0, overload);
    system.loadout.overloaded = overload > 0;
  }

  /**
   * Calculate used capacity from items
   */
  _calculateUsedCapacity() {
    let used = 0;
    for (const item of this.items) {
      if (item.system.weight) {
        used += item.system.weight;
      }
    }
    return used;
  }

  /**
   * Calculate stress maximums
   */
  _prepareStress(system) {
    // Physical stress max = 3 + Will + Resist skill
    system.stress.physical.max = 3 + 
      system.attributes.will.total + 
      (system.skills.resist?.value || 0);

    // Mental stress max = 3 + Will
    system.stress.mental.max = 3 + system.attributes.will.total;
  }

  /**
   * Update weapon damage values
   */
  _prepareWeaponDamage() {
    const weapons = this.items.filter(i => i.type === 'weapon');
    for (const weapon of weapons) {
      const skill = weapon.system.attackSkill;
      const skillBonus = this.system.skills[skill]?.bonus || 0;
      weapon.system.damage.current = weapon.system.damage.base + skillBonus;
    }
  }

  /**
   * Get current defense value (considering active defenses)
   */
  getDefenseValue(type = 'physical') {
    const defense = this.system.defense;
    
    if (type === 'physical') {
      return defense.activeDodge.active ? 
        defense.activeDodge.value : 
        defense.passiveDodge.value;
    } else {
      return defense.activeMental.active ? 
        defense.activeMental.value : 
        defense.passiveMental.value;
    }
  }

  /**
   * Roll an attribute check
   */
  async rollAttribute(attributeKey, options = {}) {
    const attr = this.system.attributes[attributeKey];
    if (!attr) return null;

    const formula = `2d10 + ${attr.total}`;
    const roll = await new Roll(formula).evaluate();

    const isCritical = this._isCritical(roll);
    const isFumble = this._isFumble(roll);

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: await this._createRollMessage(roll, {
        type: 'attribute',
        label: game.i18n.localize(attr.label),
        isCritical,
        isFumble
      }),
      rolls: [roll]
    };

    await ChatMessage.create(chatData);
    return roll;
  }

  /**
   * Roll a skill check
   */
  async rollSkill(skillKey, options = {}) {
    const skill = this.system.skills[skillKey];
    if (!skill) return null;

    const formula = `2d10 + ${skill.bonus}`;
    const roll = await new Roll(formula).evaluate();

    const isCritical = this._isCritical(roll);
    const isFumble = this._isFumble(roll);

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: await this._createRollMessage(roll, {
        type: 'skill',
        label: game.i18n.localize(skill.label),
        isCritical,
        isFumble
      }),
      rolls: [roll]
    };

    await ChatMessage.create(chatData);
    return roll;
  }

  /**
   * Roll initiative
   */
  async rollInitiative(options = {}) {
    const formula = `2d10 + ${this.system.initiative.value}`;
    const roll = await new Roll(formula).evaluate();

    if (options.combat) {
      const combatant = options.combat.getCombatantByActor(this);
      if (combatant) {
        await options.combat.updateEmbeddedDocuments('Combatant', [{
          _id: combatant.id,
          initiative: roll.total
        }]);
      }
    }

    return roll;
  }

  /**
   * Activate active defense
   */
  async activateDefense(type = 'dodge') {
    const field = type === 'dodge' ? 'activeDodge' : 'activeMental';
    await this.update({
      [`system.defense.${field}.active`]: true
    });
  }

  /**
   * Deactivate active defense
   */
  async deactivateDefense(type = 'dodge') {
    const field = type === 'dodge' ? 'activeDodge' : 'activeMental';
    await this.update({
      [`system.defense.${field}.active`]: false
    });
  }

  /**
   * Apply damage
   */
  async applyDamage(amount, type = 'physical') {
    const stress = this.system.stress[type];
    const newValue = Math.min(stress.value + amount, stress.max);
    
    await this.update({
      [`system.stress.${type}.value`]: newValue
    });

    return { applied: amount, current: newValue, max: stress.max };
  }

  /**
   * Rest - short or long
   */
  async rest(type = 'short') {
    if (type === 'short') {
      // Short rest: recover 1 stress (player chooses which)
      return { success: true, message: 'Выберите тип стресса для восстановления' };
    }
    
    if (type === 'long') {
      // Long rest: recover all stress
      await this.update({
        'system.stress.physical.value': 0,
        'system.stress.mental.value': 0,
        'system.actionPoints.current': this.system.actionPoints.max
      });
      return { success: true, message: 'Долгий отдых завершён. Весь стресс восстановлен.' };
    }
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
   * Count tens on dice (for armor wear)
   */
  _countTens(roll) {
    const dice = roll.terms[0];
    if (!dice || !dice.results) return 0;
    return dice.results.filter(r => r.result === 10).length;
  }

  /**
   * Create roll message HTML
   */
  async _createRollMessage(roll, context) {
    const template = 'systems/cnc-system/templates/chat/roll-message.html';
    return renderTemplate(template, {
      roll,
      actor: this,
      context
    });
  }
}