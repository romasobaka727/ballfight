// --- Константы игры ---
const GRID_SIZE = 30; // Размер поля 30x30 клеток
const CELL_SIZE = 30; // Размер одной клетки в пикселях
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

const PLAYER_RADIUS = CELL_SIZE / 3; // Радиус шара игрока
const BOT_RADIUS = CELL_SIZE / 3;    // Радиус шара бота

const PLAYER_HP = 100;
const BOT_HP = 100;

// Характеристики оружия (урон, радиус в клетках, скорость атак в атаках/сек)
const WEAPONS = {
    SWORD: { name: 'Меч', damage: 2, range: 2, speed: 1, color: 'black' },
    SPEAR: { name: 'Копьё', damage: 1, range: 3, speed: 2, color: 'black' },
    DAGGER: { name: 'Кинжал', damage: 5, range: 1, speed: 1, color: 'black', price: 10, unlocked: false }
};

// Характеристики ультимейтов
const ULTIMATES = {
    SWORD: { name: 'Меч', duration: 30000, damageBoost: 2 }, // 30 секунд, +2 к урону
    SPEAR: { name: 'Копьё', attacks: 5, damageBoost: 5, speedBoost: 3 }, // 5 быстрых метаний, +5 урона, скорость 3 атаки/сек
    DAGGER: { name: 'Кинжал', duration: 30000, damageMultiplier: 2 } // 30 секунд, x2 урон (двойной кинжал)
};

const BOT_SPAWN_INTERVAL = 2000; // Интервал спавна ботов в мс
const BOT_MOVE_SPEED = 1; // Скорость движения ботов (1 клетка за шаг, шаг каждые N кадров)
const BOT_MOVE_TICKS = 30; // Бот двигается каждые 30 кадров (для замедления)
const DEATH_SCREEN_DURATION = 3000; // Длительность красного экрана смерти в мс

// --- Переменные игры ---
let canvas, ctx;
let player;
let bots = [];
let coins = 0; // Монеты за текущую игру
let kills = 0; // Убийства за текущую игру
let gameRunning = false; // Изначально игра не запущена
let gameLoopInterval;
let daggerUnlocked = false; 
let currentLanguage = 'ru'; // Язык по умолчанию

// Переменные для сохранения прогресса
let totalCoins = 0;   // Общее количество монет (сохраняется)
let totalKills = 0;   // Общее количество убийств (сохраняется)
let totalDeaths = 0;  // Общее количество смертей (сохраняется)

let isFirstLaunchGame = true; // Флаг первого запуска игры (для напоминания о языке)
let isFirstLaunchApp = true; // Флаг первого запуска приложения (для выбора языка)

// Для управления геймпадом
let gamepads = {};
let lastGamepadUpdate = 0;
const GAMEPAD_POLL_INTERVAL = 100; // Опрашивать геймпада каждые 100 мс

// --- Объект для переводов ---
const translations = {
    en: {
        selectInitialLanguage: "Select Language",
        playerName: "Player: ",
        hp: "HP: ",
        coins: "Coins: ",
        endGame: "End Game",
        ultimate: "Ultimate",
        ultimateReady: "Ultimate (Ready!)",
        ultimateCooldown: "Ultimate ({0}/3)",
        ultimateActive: "Ultimate Active ({0} sec)",
        spearUltActive: "Spear Ultimate ({0} attacks)",
        shopTitle: "Shop",
        shopDescription: "Choose your weapon:",
        buyDagger: "Buy Dagger ({0} coins)",
        daggerBought: "Dagger Bought!",
        close: "Close",
        settingsTitle: "Settings",
        language: "Language",
        english: "English",
        russian: "Русский",
        gameEndedUser: "Game ended by user.",
        gameLost: "You lost! Your ball is destroyed.",
        yourScore: "Your score: {0} kills, {1} coins.",
        daggerPurchased: "Dagger purchased and equipped!",
        notEnoughCoins: "Not enough coins!",
        daggerAlreadyOwned: "Dagger already owned.",
        ultimateAlreadyActive: "Ultimate already active.",
        ultimateNotReady: "Ultimate not ready. Need 3 kills.",
        languageReminder: "Remember to change the game language in Settings if needed!",
        ok: "OK",
        play: "Play",
        selectWeaponTitle: "Select Weapon",
        sword: "Sword",
        spear: "Spear",
        dagger: "Dagger",
        backToMenu: "Back to Menu",
        stats: "Statistics",
        totalKills: "Total Kills: {0}",
        totalDeaths: "Total Deaths: {0}",
        youDied: "You Died!"
    },
    ru: {
        selectInitialLanguage: "Выберите язык",
        playerName: "Игрок: ",
        hp: "HP: ",
        coins: "Монеты: ",
        endGame: "Завершить игру",
        ultimate: "Ультимейт",
        ultimateReady: "Ультимейт (Готов!)",
        ultimateCooldown: "Ультимейт ({0}/3)",
        ultimateActive: "Ульта активна ({0} сек)",
        spearUltActive: "Ульта Копья ({0} атак)",
        shopTitle: "Магазин",
        shopDescription: "Выбери оружие:",
        buyDagger: "Купить Кинжал ({0} монет)",
        daggerBought: "Кинжал куплен!",
        close: "Закрыть",
        settingsTitle: "Настройки",
        language: "Язык",
        english: "English",
        russian: "Русский",
        gameEndedUser: "Игра завершена пользователем.",
        gameLost: "Вы проиграли! Ваш шар уничтожен.",
        yourScore: "Ваши очки: {0} убийств, {1} монет.",
        daggerPurchased: "Кинжал куплен и экипирован!",
        notEnoughCoins: "Недостаточно монет!",
        daggerAlreadyOwned: "Кинжал уже куплен.",
        ultimateAlreadyActive: "Ультимейт уже активен.",
        ultimateNotReady: "Ультимейт не готов. Нужно 3 убийства.",
        languageReminder: "Не забудьте сменить язык игры в Настройках, если это необходимо!",
        ok: "ОК",
        play: "Играть",
        selectWeaponTitle: "Выбери оружие",
        sword: "Меч",
        spear: "Копьё",
        dagger: "Кинжал",
        backToMenu: "Назад в меню",
        stats: "Статистика",
        totalKills: "Всего убийств: {0}",
        totalDeaths: "Всего смертей: {0}",
        youDied: "Ты умер!"
    }
};

// Функция для получения текста на текущем языке
function getLocalizedText(key, ...args) {
    let text = translations[currentLanguage][key];
    if (text && args.length > 0) {
        // Заменяем {0}, {1} и т.д. на переданные аргументы
        args.forEach((arg, index) => {
            text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), arg);
        });
    }
    return text || `MISSING_TRANSLATION[${key}]`;
}

// --- Элементы DOM ---
const gameCanvas = document.getElementById('gameCanvas');
const topUi = document.getElementById('top-ui');
const bottomUi = document.getElementById('bottom-ui');
const playerHpDisplay = document.getElementById('player-hp-display');
const coinsDisplay = document.getElementById('coins-display');
const ultBtn = document.getElementById('ult-btn');
const endGameBtn = document.getElementById('end-game-btn');

const shopOverlay = document.getElementById('shop-overlay');
const shopTitle = document.getElementById('shop-title');
const shopDescription = document.getElementById('shop-description');
const buyDaggerBtn = document.getElementById('buy-dagger-btn');
const closeShopBtn = document.getElementById('close-shop-btn');

const settingsOverlay = document.getElementById('settings-overlay');
const settingsTitle = document.getElementById('settings-title');
const languageBtn = document.getElementById('language-btn');
const languageOptions = document.getElementById('language-options');
const langEnBtn = document.getElementById('lang-en-btn');
const langRuBtn = document.getElementById('lang-ru-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

const initialLanguageSelectOverlay = document.getElementById('initial-language-select-overlay');
const initialLangEnBtn = document.getElementById('initial-lang-en-btn');
const initialLangRuBtn = document.getElementById('initial-lang-ru-btn');

const languageReminder = document.getElementById('language-reminder');
const reminderText = document.getElementById('reminder-text');
const reminderCloseBtn = document.getElementById('reminder-close-btn');

const mainMenuOverlay = document.getElementById('main-menu-overlay');
const playerNameDisplay = document.getElementById('player-name-display');
const playBtn = document.getElementById('play-btn');
const settingsBtnMainMenu = document.getElementById('settings-btn-mainmenu');
const statsBtnMainMenu = document.getElementById('stats-btn-mainmenu');

const weaponSelectOverlay = document.getElementById('weapon-select-overlay');
const weaponSelectTitle = document.getElementById('weapon-select-title');
const selectSwordBtn = document.getElementById('select-sword-btn');
const selectSpearBtn = document.getElementById('select-spear-btn');
const selectDaggerBtn = document.getElementById('select-dagger-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

const statsOverlay = document.getElementById('stats-overlay');
const statsTitle = document.getElementById('stats-title');
const statsKillsDisplay = document.getElementById('stats-kills');
const statsDeathsDisplay = document.getElementById('stats-deaths');
const closeStatsBtn = document.getElementById('close-stats-btn');

const deathOverlay = document.getElementById('death-overlay');
const deathTitle = document.getElementById('death-title');

// --- Глобальные переменные игры ---
let selectedWeapon = 'SWORD'; // Оружие по умолчанию
let lastAttackTime = 0; // Время последней атаки игрока
let ultimateKills = 0; // Количество убийств для активации ультимейта

let ultimateActive = false;
let ultimateStartTime = 0;
let spearUltAttacksLeft = 0; // Для ульты копья

let botMoveTimers = new Map(); // Карта для таймеров движения ботов

// --- Классы игры ---

class Entity {
    constructor(x, y, radius, color, hp) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.hp = hp;
        this.maxHp = hp;
        this.weapon = { ...WEAPONS.SWORD }; // У каждой сущности может быть свое оружие
        this.attackCooldown = 0; // В миллисекундах
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Полоса здоровья
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2, 5);
        ctx.fillStyle = 'lime'; // Ярко-зеленый для HP
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, (this.radius * 2) * (this.hp / this.maxHp), 5);

        // Отрисовка оружия, если оно есть и направление атаки задано
        if (this.weapon && this.attackDir !== undefined) {
            ctx.strokeStyle = this.weapon.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            // Дальность оружия в пикселях
            const weaponLength = this.weapon.range * CELL_SIZE;
            const weaponEndX = this.x + Math.cos(this.attackDir) * weaponLength;
            const weaponEndY = this.y + Math.sin(this.attackDir) * weaponLength;
            ctx.lineTo(weaponEndX, weaponEndY);
            ctx.stroke();
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
}

class Player extends Entity {
    constructor(x, y, radius, color, name) {
        super(x, y, radius, color, PLAYER_HP);
        this.name = name;
        this.attackDir = 0; // Направление атаки в радианах (0 = вправо)
        this.weapon = { ...WEAPONS[selectedWeapon] }; // Глубокая копия, чтобы не менять оригинал
    }

    update(moveX, moveY, attackX, attackY) {
        const speed = 3; // Пикселей за кадр

        this.x += moveX * speed;
        this.y += moveY * speed;

        // Ограничение игрока в пределах карты
        this.x = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, this.y));

        // Обновление направления атаки только если есть ввод с правого стика
        if (Math.abs(attackX) > 0.1 || Math.abs(attackY) > 0.1) {
            this.attackDir = Math.atan2(attackY, attackX);
        }

        // Автоматическая атака
        const now = Date.now();
        if (now - lastAttackTime >= (1000 / this.weapon.speed)) {
            let attacked = false;
            for (let i = 0; i < bots.length; i++) {
                const bot = bots[i];
                const dist = Math.hypot(this.x - bot.x, this.y - bot.y);
                const weaponRangePixels = this.weapon.range * CELL_SIZE;

                if (dist < weaponRangePixels + bot.radius) {
                    const angleToBot = Math.atan2(bot.y - this.y, bot.x - this.x);
                    // Проверка, находится ли бот в секторе атаки
                    const angleDiff = Math.abs(this.attackDir - angleToBot);
                    // Если разница углов больше PI, значит, бот с другой стороны круга.
                    // Приводим разницу к диапазону [-PI, PI]
                    const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

                    const attackSector = Math.PI / 4; // Сектор 45 градусов (22.5 в каждую сторону)
                    if (Math.abs(normalizedAngleDiff) < attackSector) {
                        bot.takeDamage(this.weapon.damage);
                        attacked = true;
                        break; // Атакуем только одного бота за раз
                    }
                }
            }
            if (attacked) {
                lastAttackTime = now;
            }
        }

        // Обновление состояния ультимейта
        if (ultimateActive) {
            const elapsedTime = Date.now() - ultimateStartTime;
            let remainingTime = 0;

            if (selectedWeapon === 'SPEAR') {
                // Для копья ульта не по времени, а по числу атак
                // В данном случае, это просто индикация
                if (spearUltAttacksLeft <= 0) {
                    deactivateUltimate();
                }
                updateUltBtn(ULTIMATES[selectedWeapon].attacks - spearUltAttacksLeft, ULTIMATES[selectedWeapon].attacks);
            } else {
                remainingTime = Math.max(0, ULTIMATES[selectedWeapon].duration - elapsedTime);
                if (remainingTime <= 0) {
                    deactivateUltimate();
                }
                updateUltBtn(Math.ceil(remainingTime / 1000));
            }
        }
    }

    draw() {
        super.draw();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - this.radius - 15);
    }
}

class Bot extends Entity {
    constructor(x, y, radius) {
        super(x, y, radius, 'grey', BOT_HP);
        this.target = player; // Цель бота - игрок
        this.weapon = { ...WEAPONS.SWORD }; // Боты тоже со стандартным мечом
        this.moveCounter = 0; // Для замедления движения ботов
    }

    update() {
        if (!this.target) return; // Если игрока нет, бот не двигается

        // Движение к игроку
        this.moveCounter++;
        if (this.moveCounter >= BOT_MOVE_TICKS) {
            const angleToPlayer = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.x += Math.cos(angleToPlayer) * BOT_MOVE_SPEED;
            this.y += Math.sin(angleToPlayer) * BOT_MOVE_SPEED;
            this.moveCounter = 0;
        }

        // Автоматическая атака игрока
        const now = Date.now();
        if (now - this.attackCooldown >= (1000 / this.weapon.speed)) {
            const dist = Math.hypot(this.x - this.target.x, this.y - this.target.y);
            const weaponRangePixels = this.weapon.range * CELL_SIZE;

            if (dist < weaponRangePixels + this.target.radius) {
                this.target.takeDamage(this.weapon.damage);
                playerHpDisplay.textContent = `${getLocalizedText('hp')}${player.hp}`;
                this.attackCooldown = now; // Сброс таймера атаки
            }
        }
    }
}

// --- Функции игры ---

function initializeGame() {
    canvas = gameCanvas;
    ctx = canvas.getContext('2d');

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Загрузка сохранённых данных
    loadGameData();
    applyLanguage(currentLanguage);

    // Проверка первого запуска приложения
    if (isFirstLaunchApp) {
        showOverlay(initialLanguageSelectOverlay);
    } else {
        showMainMenu();
    }
}

function startGame() {
    hideAllOverlays();
    topUi.classList.remove('hidden');
    bottomUi.classList.remove('hidden');
    gameCanvas.classList.remove('hidden');

    const playerColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, PLAYER_RADIUS, playerColor, "Player");
    player.weapon = { ...WEAPONS[selectedWeapon] }; // Устанавливаем выбранное оружие
    playerHpDisplay.textContent = `${getLocalizedText('hp')}${player.hp}`;
    
    bots = [];
    coins = 0;
    kills = 0;
    ultimateKills = 0;
    updateCoinsDisplay();
    updateUltBtn(); // Сброс кнопки ультимейта
    
    lastAttackTime = Date.now(); // Сброс времени последней атаки игрока
    lastBotSpawnTime = Date.now(); // Сброс времени спавна ботов

    gameRunning = true;
    gameLoopInterval = requestAnimationFrame(gameLoop);

    // Если это первый запуск игры после выбора языка
    if (isFirstLaunchGame) {
        reminderText.textContent = getLocalizedText('languageReminder');
        showOverlay(languageReminder);
        isFirstLaunchGame = false;
        saveGameData(); // Сохраняем флаг
    }
}

function endGame(reason = 'user') {
    if (!gameRunning) return; // Чтобы избежать повторного вызова
    gameRunning = false;
    cancelAnimationFrame(gameLoopInterval);

    hideAllUI();
    gameCanvas.classList.add('hidden');

    totalCoins += coins;
    totalKills += kills;
    if (reason === 'death') {
        totalDeaths++;
        showOverlay(deathOverlay);
        setTimeout(() => {
            hideAllOverlays();
            showMainMenu();
        }, DEATH_SCREEN_DURATION);
    } else {
        showMainMenu();
    }
    
    saveGameData(); // Сохраняем данные после каждой игры
    
    // Сброс состояния ультимейта
    ultimateActive = false;
    ultimateStartTime = 0;
    spearUltAttacksLeft = 0;
    player.weapon = { ...WEAPONS[selectedWeapon] }; // Сброс урона, если ульта была активна

    // Оповещение об окончании игры
    let message;
    if (reason === 'user') {
        message = getLocalizedText('gameEndedUser');
    } else if (reason === 'death') {
        message = getLocalizedText('gameLost');
    }
    // Можно добавить алерт, но для PWA лучше использовать свои окна
    // alert(`${message}\n${getLocalizedText('yourScore', kills, coins)}`);
}

function gameLoop() {
    if (!gameRunning) return;

    updateGamepads();

    let moveX = 0, moveY = 0, attackX = 0, attackY = 0;
    // Геймпад 1 для движения (левый стик)
    if (gamepads[0] && gamepads[0].axes.length >= 2) {
        moveX = gamepads[0].axes[0];
        moveY = gamepads[0].axes[1];
    }
    // Геймпад 2 для атаки (правый стик)
    if (gamepads[1] && gamepads[1].axes.length >= 4) {
        attackX = gamepads[1].axes[2]; // Обычно правый стик это оси 2 и 3
        attackY = gamepads[1].axes[3];
    }

    player.update(moveX, moveY, attackX, attackY);

    // Обновление ботов
    for (let i = 0; i < bots.length; i++) {
        bots[i].update();
    }

    // Проверка на смерть игрока
    if (player.hp <= 0) {
        endGame('death');
        return; // Останавливаем цикл, чтобы избежать дальнейших обновлений
    }

    // Спавн ботов
    const now = Date.now();
    if (now - lastBotSpawnTime >= BOT_SPAWN_INTERVAL && bots.length < 10) { // Ограничение на 10 ботов
        spawnBot();
        lastBotSpawnTime = now;
    }

    // Удаление мертвых ботов и начисление монет/убийств
    bots = bots.filter(bot => {
        if (bot.hp <= 0) {
            kills++;
            coins++;
            ultimateKills++; // Увеличиваем счетчик для ульты
            player.hp = player.maxHp; // Восстановление здоровья игрока
            updateCoinsDisplay();
            playerHpDisplay.textContent = `${getLocalizedText('hp')}${player.hp}`;
            updateUltBtn(); // Обновить состояние кнопки ульты
            return false; // Удалить бота
        }
        return true;
    });

    drawGame();
    gameLoopInterval = requestAnimationFrame(gameLoop);
}

function drawGame() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Очистка холста
    player.draw();
    bots.forEach(bot => bot.draw());
}

function spawnBot() {
    const radius = BOT_RADIUS;
    let x, y;
    // Спавн бота за пределами экрана
    if (Math.random() > 0.5) { // Спавн слева или справа
        x = Math.random() < 0.5 ? -radius : CANVAS_WIDTH + radius;
        y = Math.random() * CANVAS_HEIGHT;
    } else { // Спавн сверху или снизу
        x = Math.random() * CANVAS_WIDTH;
        y = Math.random() < 0.5 ? -radius : CANVAS_HEIGHT + radius;
    }
    const newBot = new Bot(x, y, radius);
    bots.push(newBot);
}

function updateCoinsDisplay() {
    coinsDisplay.textContent = `${getLocalizedText('coins')}${coins}`;
}

function updateUltBtn(remainingValue = ultimateKills, maxValue = 3) {
    if (ultimateActive) {
        if (selectedWeapon === 'SPEAR') {
            ultBtn.textContent = getLocalizedText('spearUltActive', remainingValue);
        } else {
            ultBtn.textContent = getLocalizedText('ultimateActive', remainingValue);
        }
        ultBtn.classList.add('ready'); // Всегда подсвечиваем, когда активна
    } else if (ultimateKills >= 3) {
        ultBtn.textContent = getLocalizedText('ultimateReady');
        ultBtn.classList.add('ready');
    } else {
        ultBtn.textContent = getLocalizedText('ultimateCooldown', ultimateKills);
        ultBtn.classList.remove('ready');
    }
}

function activateUltimate() {
    if (ultimateActive) {
        alert(getLocalizedText('ultimateAlreadyActive'));
        return;
    }
    if (ultimateKills < 3) {
        alert(getLocalizedText('ultimateNotReady'));
        return;
    }

    ultimateActive = true;
    ultimateStartTime = Date.now();
    ultimateKills = 0; // Сброс убийств после использования ульты

    switch (selectedWeapon) {
        case 'SWORD':
            player.weapon.damage += ULTIMATES.SWORD.damageBoost;
            player.color = 'red'; // Меч становится красным
            break;
        case 'SPEAR':
            spearUltAttacksLeft = ULTIMATES.SPEAR.attacks;
            // Специальная логика для копья: серия быстрых атак
            for (let i = 0; i < ULTIMATES.SPEAR.attacks; i++) {
                setTimeout(() => {
                    if (!gameRunning) return; // Прекращаем, если игра закончилась
                    bots.forEach(bot => {
                        const dist = Math.hypot(player.x - bot.x, player.y - bot.y);
                        // Ульта копья бьет по всем в расширенном радиусе
                        const ultRangePixels = (WEAPONS.SPEAR.range + ULTIMATES.SPEAR.speedBoost) * CELL_SIZE;
                        if (dist < ultRangePixels + bot.radius) {
                            bot.takeDamage(WEAPONS.SPEAR.damage + ULTIMATES.SPEAR.damageBoost);
                        }
                    });
                    spearUltAttacksLeft--;
                    updateUltBtn(ULTIMATES.SPEAR.attacks - spearUltAttacksLeft, ULTIMATES.SPEAR.attacks);
                }, i * (1000 / ULTIMATES.SPEAR.speedBoost)); // Скорость атак
            }
            break;
        case 'DAGGER':
            player.weapon.damage *= ULTIMATES.DAGGER.damageMultiplier;
            // Дополнительная визуализация для двойного кинжала (если нужно)
            break;
    }
    updateUltBtn(); // Обновляем текст кнопки
}

function deactivateUltimate() {
    ultimateActive = false;
    player.weapon = { ...WEAPONS[selectedWeapon] }; // Возвращаем исходные характеристики оружия
    player.color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Случайный цвет игрока
    updateUltBtn(); // Обновляем текст кнопки
}

// --- Управление PWA и хранилищем ---

function saveGameData() {
    const data = {
        totalCoins: totalCoins,
        totalKills: totalKills,
        totalDeaths: totalDeaths,
        daggerUnlocked: WEAPONS.DAGGER.unlocked, // Сохраняем статус разблокировки кинжала
        currentLanguage: currentLanguage,
        isFirstLaunchGame: isFirstLaunchGame,
        isFirstLaunchApp: isFirstLaunchApp
    };
    localStorage.setItem('ballFightGameData', JSON.stringify(data));
}

function loadGameData() {
    const dataString = localStorage.getItem('ballFightGameData');
    if (dataString) {
        const data = JSON.parse(dataString);
        totalCoins = data.totalCoins || 0;
        totalKills = data.totalKills || 0;
        totalDeaths = data.totalDeaths || 0;
        WEAPONS.DAGGER.unlocked = data.daggerUnlocked || false; // Загружаем статус кинжала
        currentLanguage = data.currentLanguage || 'ru';
        isFirstLaunchGame = data.isFirstLaunchGame !== undefined ? data.isFirstLaunchGame : true;
        isFirstLaunchApp = data.isFirstLaunchApp !== undefined ? data.isFirstLaunchApp : true;
    }
}

// --- Управление интерфейсом (UI) ---

function hideAllOverlays() {
    const overlays = document.querySelectorAll('.overlay');
    overlays.forEach(overlay => overlay.classList.add('hidden'));
}

function showOverlay(overlayElement) {
    hideAllOverlays(); // Сначала скрываем все, чтобы избежать наложений
    overlayElement.classList.remove('hidden');
}

function hideAllUI() {
    topUi.classList.add('hidden');
    bottomUi.classList.add('hidden');
}

function showMainMenu() {
    hideAllOverlays();
    hideAllUI();
    playerNameDisplay.textContent = `${getLocalizedText('playerName')} [Имя]`; // Будет заменено на имя
    showOverlay(mainMenuOverlay);
    // Обновляем доступность кинжала в меню выбора оружия, если он разблокирован
    if (WEAPONS.DAGGER.unlocked) {
        selectDaggerBtn.disabled = false;
        selectDaggerBtn.textContent = getLocalizedText('dagger'); // Убираем цену
    } else {
        selectDaggerBtn.disabled = true; // Снова отключаем, если игра сброшена и не куплена
        selectDaggerBtn.textContent = getLocalizedText('buyDagger', WEAPONS.DAGGER.price);
    }
}

function updateUILanguage() {
    // Обновление текстов на текущем экране
    // Главное меню
    playerNameDisplay.textContent = `${getLocalizedText('playerName')} [Имя]`;
    playBtn.textContent = getLocalizedText('play');
    settingsBtnMainMenu.textContent = getLocalizedText('settingsTitle');
    statsBtnMainMenu.textContent = getLocalizedText('stats');

    // Экран выбора оружия
    weaponSelectTitle.textContent = getLocalizedText('selectWeaponTitle');
    selectSwordBtn.textContent = getLocalizedText('sword');
    selectSpearBtn.textContent = getLocalizedText('spear');
    selectDaggerBtn.textContent = WEAPONS.DAGGER.unlocked ? getLocalizedText('dagger') : getLocalizedText('buyDagger', WEAPONS.DAGGER.price);
    selectDaggerBtn.disabled = !WEAPONS.DAGGER.unlocked; // Если не разблокирован, кнопка должна быть неактивна в меню

    backToMenuBtn.textContent = getLocalizedText('backToMenu');

    // Магазин
    shopTitle.textContent = getLocalizedText('shopTitle');
    shopDescription.textContent = getLocalizedText('shopDescription');
    buyDaggerBtn.textContent = getLocalizedText('buyDagger', WEAPONS.DAGGER.price);
    closeShopBtn.textContent = getLocalizedText('close');

    // Настройки
    settingsTitle.textContent = getLocalizedText('settingsTitle');
    languageBtn.textContent = getLocalizedText('language');
    langEnBtn.textContent = getLocalizedText('english');
    langRuBtn.textContent = getLocalizedText('russian');
    closeSettingsBtn.textContent = getLocalizedText('close');

    // Верхний UI (в игре)
    playerHpDisplay.textContent = `${getLocalizedText('hp')}${player ? player.hp : PLAYER_HP}`; // Обновляем HP
    coinsDisplay.textContent = `${getLocalizedText('coins')}${coins}`;
    settingsBtnIngame.textContent = getLocalizedText('settingsTitle');
    endGameBtn.textContent = getLocalizedText('endGame');

    // Нижний UI (в игре)
    updateUltBtn(); // Обновление текста кнопки ультимейта

    // Статистика
    statsTitle.textContent = getLocalizedText('stats');
    statsKillsDisplay.textContent = getLocalizedText('totalKills', totalKills);
    statsDeathsDisplay.textContent = getLocalizedText('totalDeaths', totalDeaths);
    closeStatsBtn.textContent = getLocalizedText('close');

    // Экран смерти
    deathTitle.textContent = getLocalizedText('youDied');

    // Начальный выбор языка
    initialLanguageSelectOverlay.querySelector('h2').textContent = getLocalizedText('selectInitialLanguage');
    initialLangEnBtn.textContent = getLocalizedText('english');
    initialLangRuBtn.textContent = getLocalizedText('russian');

    // Напоминание о языке
    reminderText.textContent = getLocalizedText('languageReminder');
    reminderCloseBtn.textContent = getLocalizedText('ok');
}

function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang); // Сохраняем выбор языка
    updateUILanguage();
    saveGameData(); // Сохраняем данные, чтобы флаг isFirstLaunchApp обновился
}

// --- Обработчики событий ---

document.addEventListener('DOMContentLoaded', () => {
    initializeGame(); // Инициализация при загрузке страницы

    // PWA: Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('Service Worker registration failed: ', registrationError);
                });
        });
    }

    // Главное меню
    playBtn.addEventListener('click', () => {
        showOverlay(weaponSelectOverlay);
        // При переходе на выбор оружия, убеждаемся что кинжал отображается корректно
        if (WEAPONS.DAGGER.unlocked) {
            selectDaggerBtn.disabled = false;
            selectDaggerBtn.textContent = getLocalizedText('dagger');
        } else {
            selectDaggerBtn.disabled = true;
            selectDaggerBtn.textContent = getLocalizedText('buyDagger', WEAPONS.DAGGER.price);
        }
    });

    settingsBtnMainMenu.addEventListener('click', () => {
        showOverlay(settingsOverlay);
        languageOptions.classList.add('hidden'); // Скрываем опции языка по умолчанию
    });

    statsBtnMainMenu.addEventListener('click', () => {
        statsKillsDisplay.textContent = getLocalizedText('totalKills', totalKills);
        statsDeathsDisplay.textContent = getLocalizedText('totalDeaths', totalDeaths);
        showOverlay(statsOverlay);
    });

    // Экран выбора оружия
    selectSwordBtn.addEventListener('click', () => {
        selectedWeapon = 'SWORD';
        startGame();
    });
    selectSpearBtn.addEventListener('click', () => {
        selectedWeapon = 'SPEAR';
        startGame();
    });
    selectDaggerBtn.addEventListener('click', () => {
        if (!WEAPONS.DAGGER.unlocked) {
            if (totalCoins >= WEAPONS.DAGGER.price) {
                totalCoins -= WEAPONS.DAGGER.price;
                WEAPONS.DAGGER.unlocked = true;
                saveGameData(); // Сохраняем разблокировку кинжала
                selectedWeapon = 'DAGGER';
                alert(getLocalizedText('daggerPurchased')); // Уведомление о покупке
                startGame();
            } else {
                alert(getLocalizedText('notEnoughCoins'));
            }
        } else {
            selectedWeapon = 'DAGGER';
            startGame();
        }
    });
    backToMenuBtn.addEventListener('click', showMainMenu);

    // Магазин (в игре, если захотите добавить, сейчас функционал покупки кинжала перенесен в выбор оружия)
    // buyDaggerBtn.addEventListener('click', () => { /* Логика покупки */ });
    closeShopBtn.addEventListener('click', () => {
        shopOverlay.classList.add('hidden');
        // Показать основной UI игры
        topUi.classList.remove('hidden');
        bottomUi.classList.remove('hidden');
        gameCanvas.classList.remove('hidden');
    });

    // Настройки
    languageBtn.addEventListener('click', () => {
        languageOptions.classList.toggle('hidden');
    });
    langEnBtn.addEventListener('click', () => {
        applyLanguage('en');
        languageOptions.classList.add('hidden');
    });
    langRuBtn.addEventListener('click', () => {
        applyLanguage('ru');
        languageOptions.classList.add('hidden');
    });
    closeSettingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.add('hidden');
        // Если игра запущена, показать игровой UI, иначе главное меню
        if (gameRunning) {
            topUi.classList.remove('hidden');
            bottomUi.classList.remove('hidden');
            gameCanvas.classList.remove('hidden');
        } else {
            showMainMenu();
        }
    });

    // Начальный выбор языка
    initialLangEnBtn.addEventListener('click', () => {
        applyLanguage('en');
        isFirstLaunchApp = false;
        saveGameData();
        showMainMenu();
    });
    initialLangRuBtn.addEventListener('click', () => {
        applyLanguage('ru');
        isFirstLaunchApp = false;
        saveGameData();
        showMainMenu();
    });

    // Напоминание о языке
    reminderCloseBtn.addEventListener('click', () => {
        languageReminder.classList.add('hidden');
    });

    // Кнопки в игре
    ultBtn.addEventListener('click', activateUltimate);
    settingsBtnIngame.addEventListener('click', () => {
        showOverlay(settingsOverlay);
        languageOptions.classList.add('hidden'); // Скрываем опции языка по умолчанию
    });
    endGameBtn.addEventListener('click', () => endGame('user'));

    // Закрытие статистики
    closeStatsBtn.addEventListener('click', showMainMenu);

    // Управление геймпадами
    window.addEventListener("gamepadconnected", (e) => {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);
        gamepads[e.gamepad.index] = e.gamepad;
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected from index %d: %s",
            e.gamepad.index, e.gamepad.id);
        delete gamepads[e.gamepad.index];
    });

    function updateGamepads() {
        // Запрашиваем актуальное состояние геймпадов
        const newGamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        for (let i = 0; i < newGamepads.length; i++) {
            if (newGamepads[i]) {
                gamepads[i] = newGamepads[i];
            }
        }
    }
});