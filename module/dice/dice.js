export class CNCRoll extends Roll {
  static CHAT_TEMPLATE = 'systems/cnc-system/templates/chat/roll-message.html';

  async render(chatOptions = {}) {
    chatOptions = foundry.utils.mergeObject({
      user: game.user.id,
      flavor: null,
      template: this.constructor.CHAT_TEMPLATE,
      blind: false
    }, chatOptions);
    
    const isPrivate = chatOptions.isPrivate;
    const chatData = {
      formula: isPrivate ? '???' : this.formula,
      total: isPrivate ? '?' : Math.round(this.total * 100) / 100,
      dice: this.dice
    };
    
    return renderTemplate(chatOptions.template, chatData);
  }
}