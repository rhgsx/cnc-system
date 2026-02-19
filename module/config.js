/**
 * Core & Cold System Configuration
 */

export function registerSystemConfig() {
  CONFIG.CNC = {
    attributes: {
      strength: {
        label: 'CNC.Attributes.strength',
        abbreviation: 'CNC.Attributes.strengthAbbr',
        skills: ['athletics', 'brawl', 'intimidate', 'melee', 'resist', 'throw']
      },
      agility: {
        label: 'CNC.Attributes.agility',
        abbreviation: 'CNC.Attributes.agilityAbbr',
        skills: ['drive', 'firearms', 'larceny', 'ride', 'stealth', 'vigilance']
      },
      mind: {
        label: 'CNC.Attributes.mind',
        abbreviation: 'CNC.Attributes.mindAbbr',
        skills: ['art', 'craft', 'knowledge', 'medicine', 'perception', 'scholarship']
      },
      will: {
        label: 'CNC.Attributes.will',
        abbreviation: 'CNC.Attributes.willAbbr',
        skills: ['insight', 'leadership', 'performance', 'persuasion', 'streetwise', 'survival']
      }
    },

    skills: {
      // Strength skills
      athletics: { label: 'CNC.Skills.athletics', attribute: 'strength' },
      brawl: { label: 'CNC.Skills.brawl', attribute: 'strength' },
      intimidate: { label: 'CNC.Skills.intimidate', attribute: 'strength' },
      melee: { label: 'CNC.Skills.melee', attribute: 'strength' },
      resist: { label: 'CNC.Skills.resist', attribute: 'strength' },
      throw: { label: 'CNC.Skills.throw', attribute: 'strength' },
      // Agility skills
      drive: { label: 'CNC.Skills.drive', attribute: 'agility' },
      firearms: { label: 'CNC.Skills.firearms', attribute: 'agility' },
      larceny: { label: 'CNC.Skills.larceny', attribute: 'agility' },
      ride: { label: 'CNC.Skills.ride', attribute: 'agility' },
      stealth: { label: 'CNC.Skills.stealth', attribute: 'agility' },
      vigilance: { label: 'CNC.Skills.vigilance', attribute: 'agility' },
      // Mind skills
      art: { label: 'CNC.Skills.art', attribute: 'mind' },
      craft: { label: 'CNC.Skills.craft', attribute: 'mind' },
      knowledge: { label: 'CNC.Skills.knowledge', attribute: 'mind' },
      medicine: { label: 'CNC.Skills.medicine', attribute: 'mind' },
      perception: { label: 'CNC.Skills.perception', attribute: 'mind' },
      scholarship: { label: 'CNC.Skills.scholarship', attribute: 'mind' },
      // Will skills
      insight: { label: 'CNC.Skills.insight', attribute: 'will' },
      leadership: { label: 'CNC.Skills.leadership', attribute: 'will' },
      performance: { label: 'CNC.Skills.performance', attribute: 'will' },
      persuasion: { label: 'CNC.Skills.persuasion', attribute: 'will' },
      streetwise: { label: 'CNC.Skills.streetwise', attribute: 'will' },
      survival: { label: 'CNC.Skills.survival', attribute: 'will' }
    },

    weaponTypes: {
      melee: { label: 'CNC.WeaponTypes.melee' },
      ranged: { label: 'CNC.WeaponTypes.ranged' }
    },

    weaponSizes: {
      light: { label: 'CNC.WeaponSizes.light', hitBonus: 2, armorIgnore: 0 },
      normal: { label: 'CNC.WeaponSizes.normal', hitBonus: 0, armorIgnore: 0 },
      heavy: { label: 'CNC.WeaponSizes.heavy', hitBonus: 0, armorIgnore: 2 }
    },

    ranges: {
      close: { label: 'CNC.Ranges.close' },
      medium: { label: 'CNC.Ranges.medium' },
      long: { label: 'CNC.Ranges.long' },
      extreme: { label: 'CNC.Ranges.extreme' }
    },

    weaponTags: {
      brutal: { label: 'CNC.WeaponTags.brutal' },
      defensive: { label: 'CNC.WeaponTags.defensive' },
      reach: { label: 'CNC.WeaponTags.reach' },
      reload: { label: 'CNC.WeaponTags.reload' },
      silent: { label: 'CNC.WeaponTags.silent' },
      twoHanded: { label: 'CNC.WeaponTags.twoHanded' },
      unload: { label: 'CNC.WeaponTags.unload' },
      zone: { label: 'CNC.WeaponTags.zone' }
    },

    armorTags: {
      concealed: { label: 'CNC.ArmorTags.concealed' },
      noisy: { label: 'CNC.ArmorTags.noisy' },
      shield: { label: 'CNC.ArmorTags.shield' }
    },

    flawTypes: {
      physical: { label: 'CNC.FlawTypes.physical' },
      mental: { label: 'CNC.FlawTypes.mental' },
      social: { label: 'CNC.FlawTypes.social' }
    },

    severityLevels: {
      1: { label: 'CNC.Severity.light', xp: 10 },
      2: { label: 'CNC.Severity.moderate', xp: 20 },
      3: { label: 'CNC.Severity.severe', xp: 30 }
    },

    perkLevels: {
      1: { label: 'CNC.PerkLevels.1', xp: 5 },
      2: { label: 'CNC.PerkLevels.2', xp: 10 },
      3: { label: 'CNC.PerkLevels.3', xp: 15 }
    },

    difficultyLevels: {
      trivial: { label: 'CNC.Difficulty.trivial', value: 12 },
      easy: { label: 'CNC.Difficulty.easy', value: 15 },
      moderate: { label: 'CNC.Difficulty.moderate', value: 18 },
      hard: { label: 'CNC.Difficulty.hard', value: 21 },
      expert: { label: 'CNC.Difficulty.expert', value: 24 },
      master: { label: 'CNC.Difficulty.master', value: 27 },
      heroic: { label: 'CNC.Difficulty.heroic', value: 30 },
      impossible: { label: 'CNC.Difficulty.impossible', value: 33 }
    },

    actionCosts: {
      attack: 3,
      move: 1,
      defense: 2,
      aim: 1,
      assist: 2,
      swapWeapon: 1,
      useItem: 2,
      stand: 1,
      wait: 0
    },

    stressTypes: {
      physical: { label: 'CNC.Stress.physical' },
      mental: { label: 'CNC.Stress.mental' }
    }
  };

  // Store in game.cnc.config for easy access
  game.cnc = game.cnc || {};
  game.cnc.config = CONFIG.CNC;
}