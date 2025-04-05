import CoreService from './coreService.js';
import UIService from './uiService.js';

export default class SquadWidget {
  constructor() {
    if (!this.checkAccessKey()) {
      this.showAccessDenied();
      return;
    }

    this.init();
  }

  async init() {
    try {
      const hasAccess = await this.checkAccessKey();
      if (!hasAccess) {
        this.showAccessDenied();
        return;
      }
      this.initializeServices();
      this.initialized = true;
    } catch (error) {
      console.error('Error in init:', error);
      this.showAccessDenied();
    }
  }
  initializeServices() {
    try {
      this.coreService = new CoreService();
      this.uiService = new UIService(this.coreService);
      this.initialize();
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }

  initialize() {
    try {
      this.coreService.loadFromServer();
      this.uiService.updatePlayersUI();
    } catch (error) {
      console.error('Error in initialize:', error);
    }
  }

  async checkAccessKey() {
    try {
      localStorage.removeItem('accessKey');
      const urlParams = window.location.search.substring(1);
      
      if (!urlParams) {
        localStorage.removeItem('accessKey');
        return false;
      }
  
      const apiUrl = `https://node-server-under-0eb3b9aee4e3.herokuapp.com/api/battle-stats/`+ urlParams;
  

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`response is not ok`);
      }

      const data = await response.json();


      if (data.success) {
        localStorage.setItem('accessKey', urlParams);
        return true;
      } else {
        localStorage.removeItem('accessKey');
        return false;
      }
  
    } catch (error) {
      console.error('Error in checkAccessKey:', error);
      localStorage.removeItem('accessKey');
      return false;
    }
  }

  showAccessDenied() {
    try {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--wotstat-background,rgba(255, 255, 255, 0));
        z-index: 9999;
      `;

      const message = document.createElement('div');
      message.style.cssText = `
        text-align: center;
        padding: 2em;
        border-radius: 1em;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--wotstat-primary, #ffffff);
      `;

      message.innerHTML = `
        <h2>Доступ заборонено</h2>
        <p>Невірний ключ доступу</p>
      `;

      container.appendChild(message);

      document.body.innerHTML = '';
      document.body.appendChild(container);
    } catch (error) {
      console.error('Error in showAccessDenied:', error);
    }
  }
}
