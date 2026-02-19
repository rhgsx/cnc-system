/**
 * Core & Cold System
 * Main module entry point for Foundry VTT 13
 */

import { CNCActor } from './documents/actor.js';
import { CNCItem } from './documents/item.js';
import { CharacterSheet } from './sheets/actor/character-sheet.js';
import { NPCSheet } from './sheets/actor/npc-sheet.js';
import { WeaponSheet } from './sheets/item/weapon-sheet.js';
import { ArmorSheet } from './sheets/item/armor-sheet.js';
import { ShieldSheet } from './sheets/item/shield-sheet.js';
import { ToolSheet } from './sheets/item/tool-sheet.js';
import { ConsumableSheet } from './sheets/item/consumable-sheet.js';
import { EquipmentSheet } from './sheets/item/equipment-sheet.js';
import { HeritageSheet } from './sheets/item/heritage-sheet.js';
import { PathSheet } from './sheets/item/path-sheet.js';
import { PerkSheet } from './sheets/item/perk-sheet.js';
import { FlawSheet } from './sheets/item/flaw-sheet.js';
import { CNCRoll } from './dice/dice.js';
import { CNCCombat } from './combat/combat.js';
import { registerSystemConfig } from './config.js';

// Global reference to the system
export const CNC = {};

/**
 * Initialize the Core & Cold system
 */
Hooks.once('init', async function() {
  console.log('Core & Cold | Initializing system');

  // Store global reference
  game.cnc = CNC;

  // Register system configuration
  registerSystemConfig();

  // Register custom Document classes
  CONFIG.Actor.documentClass = CNCActor;
  CONFIG.Item.documentClass = CNCItem;
  CONFIG.Combat.documentClass = CNCCombat;

  // Register Actor sheets
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('cnc', CharacterSheet, {
    types: ['character'],
    makeDefault: true
  });
  Actors.registerSheet('cnc', NPCSheet, {
    types: ['npc'],
    makeDefault: true
  });

  // Register Item sheets
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('cnc', WeaponSheet, {
    types: ['weapon'],
    makeDefault: true
  });
  Items.registerSheet('cnc', ArmorSheet, {
    types: ['armor'],
    makeDefault: true
  });
  Items.registerSheet('cnc', ShieldSheet, {
    types: ['shield'],
    makeDefault: true
  });
  Items.registerSheet('cnc', ToolSheet, {
    types: ['tool'],
    makeDefault: true
  });
  Items.registerSheet('cnc', ConsumableSheet, {
    types: ['consumable'],
    makeDefault: true
  });
  Items.registerSheet('cnc', EquipmentSheet, {
    types: ['equipment'],
    makeDefault: true
  });
  Items.registerSheet('cnc', HeritageSheet, {
    types: ['heritage'],
    makeDefault: true
  });
  Items.registerSheet('cnc', PathSheet, {
    types: ['path'],
    makeDefault: true
  });
  Items.registerSheet('cnc', PerkSheet, {
    types: ['perk'],
    makeDefault: true
  });
  Items.registerSheet('cnc', FlawSheet, {
    types: ['flaw'],
    makeDefault: true
  });

  // Register Roll class
  CONFIG.Dice.rolls.push(CNCRoll);

  // Preload Handlebars templates
  await preloadTemplates();

  console.log('Core & Cold | System initialized');
});

/**
 * Ready hook - called when game is fully loaded
 */
Hooks.once('ready', function() {
  console.log('Core & Cold | System ready');
});

/**
 * Preload Handlebars templates
 */
async function preloadTemplates() {
  const templatePaths = [
    // Actor sheets
    'systems/cnc-system/templates/actor/character-sheet.html',
    'systems/cnc-system/templates/actor/npc-sheet.html',
    // Item sheets
    'systems/cnc-system/templates/item/weapon-sheet.html',
    'systems/cnc-system/templates/item/armor-sheet.html',
    'systems/cnc-system/templates/item/shield-sheet.html',
    'systems/cnc-system/templates/item/tool-sheet.html',
    'systems/cnc-system/templates/item/consumable-sheet.html',
    'systems/cnc-system/templates/item/equipment-sheet.html',
    'systems/cnc-system/templates/item/heritage-sheet.html',
    'systems/cnc-system/templates/item/path-sheet.html',
    'systems/cnc-system/templates/item/perk-sheet.html',
    'systems/cnc-system/templates/item/flaw-sheet.html',
    // Chat templates
    'systems/cnc-system/templates/chat/roll-message.html',
    'systems/cnc-system/templates/chat/damage-message.html'
  ];

  return loadTemplates(templatePaths);
}

// Export for use in other modules
export { CNCActor } from './documents/actor.js';
export { CNCItem } from './documents/item.js';
export { CNCRoll } from './dice/dice.js';