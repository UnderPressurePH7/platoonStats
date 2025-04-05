import BattleDataManager from './battleDataManager.js';
import BattleUIHandler from './battleUIHandler.js';

class MainHistory {
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
            // Створюємо екземпляр менеджера даних
            this.dataManager = new BattleDataManager();

            // Створюємо екземпляр UI handler
            this.uiHandler = new BattleUIHandler(this.dataManager);

            // Ініціалізуємо додаток
            this.initialize();
        } catch (error) {
            console.error('Error initializing services:', error);
            this.showError('Помилка при ініціалізації сервісів');
        }
    }

    async initialize() {
        try {
            // Завантажуємо дані з сервера
            await this.dataManager.loadFromServer();

            // Оновлюємо інтерфейс
            this.uiHandler.initializeUI();
        } catch (error) {
            console.error('Error in initialize:', error);
            this.showError('Помилка при завантаженні даних');
        }
    }

    async checkAccessKey() {
        try {
          const urlParams = window.location.search.substring(1);
          
          if (!urlParams) {
            localStorage.removeItem('accessKey');
            return false;
          }
      
          const apiUrl = `https://node-server-under-0eb3b9aee4e3.herokuapp.com/api/battle-stats/` + urlParams;
      
          const response = await fetch(apiUrl);
          const data = await response.json();
    
          if (data.success === true) {
            localStorage.setItem('accessKey', urlParams);
            return true;
          } else {
            localStorage.removeItem('accessKey');
            console.log('Access denied:', data.error);
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

    showError(message) {
        try {
            const errorContainer = document.createElement('div');
            errorContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                background-color: #ff4444;
                color: white;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
                z-index: 10000;
            `;

            errorContainer.textContent = message;
            document.body.appendChild(errorContainer);

            setTimeout(() => {
                if (document.body.contains(errorContainer)) {
                    document.body.removeChild(errorContainer);
                }
            }, 5000);
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }
}

// Створюємо екземпляр класу при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    window.mainHistory = new MainHistory();
});

export default MainHistory;
