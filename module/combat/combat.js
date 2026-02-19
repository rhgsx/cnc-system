export class CNCCombat extends Combat {
  
  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    ids = typeof ids === 'string' ? [ids] : ids;
    const updates = [];
    
    for (const id of ids) {
      const combatant = this.combatants.get(id);
      if (!combatant?.actor) continue;
      
      const roll = await combatant.actor.rollInitiative({ combat: this });
      updates.push({ _id: id, initiative: roll.total });
    }
    
    if (updates.length) await this.updateEmbeddedDocuments('Combatant', updates);
    return this;
  }

  async startCombat() {
    await this.setFlag('cnc', 'round', 1);
    return super.startCombat();
  }

  async nextTurn() {
    // Reset action points for current combatant
    const current = this.combatant;
    if (current?.actor) {
      await current.actor.update({
        'system.actionPoints.current': current.actor.system.actionPoints.max
      });
    }
    return super.nextTurn();
  }
}