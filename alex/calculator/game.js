
(function(){
    const enemyNames = ['hex goblin','carry ogre','decimal slime','fuzzy divider','pointless knight','backspace cat','ratio hawk','binary gremlin','dusty abacus','vector crab'];
    const enemyNotes = ['keeps licking the solar panel.','collects loose screws.','vaporizes fractions for fun.','obsessed with screensavers.','afraid of exact change.','thinks batteries are spicy.','hoards cold coins.','stuck in a loop.','smells like chalk.','hates round numbers.'];
    const moods = [
        { cap: 1, label: 'chill' },
        { cap: 2.5, label: 'amped' },
        { cap: 4, label: 'buzzing' },
        { cap: Infinity, label: 'turbo' }
    ];
    const RARITIES = {
        common: { chip: 'perk-chip--common', ability: 'ability-btn--common', card: 'reward-card--common' },
        rare: { chip: 'perk-chip--rare', ability: 'ability-btn--rare', card: 'reward-card--rare' },
        epic: { chip: 'perk-chip--epic', ability: 'ability-btn--epic', card: 'reward-card--epic' },
        legendary: { chip: 'perk-chip--legendary', ability: 'ability-btn--legendary', card: 'reward-card--legendary' }
    };
    const DIFFICULTY_SETTINGS = {
        easy: { damageTaken: 0.75 },
        normal: { damageTaken: 1 },
        hard: { damageTaken: 1.35 }
    };

    function getDamageTakenMultiplier(state) {
        const config = DIFFICULTY_SETTINGS[state.difficulty] || DIFFICULTY_SETTINGS.normal;
        return config.damageTaken;
    }

    function getDamageMultiplier(state) {
        const base = Math.max(0.5, state.damageMultiplier || 1);
        return base;
    }

    function applyPlayerDamage(state, baseDamage) {
        const mult = getDamageMultiplier(state);
        return Math.max(1, Math.round(baseDamage * mult));
    }
    const perkPool = [
        { id: 'sugarShields', label: 'Sugar Shields', desc: '\u2212 grants +2 extra shield.', rarity: 'common' },
        { id: 'laserLemonade', label: 'Laser Lemonade', desc: '\u00f7 heals +1 and dumps more hype.', rarity: 'rare' },
        { id: 'doubleTap', label: 'Double Tap +', desc: '+ swings twice for small hits.', rarity: 'rare' },
        { id: 'wildMultiplier', label: 'Wild Multiplier', desc: '\u00d7 hits +2 but recoil becomes 2.', rarity: 'rare' },
        { id: 'batterySnacks', label: 'Battery Snacks', desc: 'Stage clears restore +5 HP.', rarity: 'common' },
        { id: 'luckyDigits', label: 'Lucky Digits', desc: '5% chance to skip enemy turns.', rarity: 'rare' },
        { id: 'chipRain', label: 'Chip Rain', desc: 'Stage clears drop extra charge.', rarity: 'rare' },
        { id: 'zenMode', label: 'Zen Mode', desc: 'Hype gain halves and stays chill.', rarity: 'epic' },
        { id: 'juiceBox', label: 'Juice Box', desc: '\u00f7 also grants +1 charge.', rarity: 'rare' },
        { id: 'spikyShield', label: 'Spiky Shield', desc: 'Shield reflects 1 damage when hit.', rarity: 'rare' },
        { id: 'stickyKeys', label: 'Sticky Keys', desc: '+ adds +1 damage when hype is chill.', rarity: 'common' },
        { id: 'cleanDigits', label: 'Clean Digits', desc: 'Stage clears restore +2 extra HP.', rarity: 'common' },
        { id: 'refundPolicy', label: 'Refund Policy', desc: 'Shop items cost 10% less.', rarity: 'rare' },
        { id: 'chargeSaver', label: 'Charge Saver', desc: 'End turns with +1 charge if below 2.', rarity: 'rare' },
        { id: 'overclock', label: 'Overclock', desc: 'Hype cap increases to 5.2 (+0.2 hype on stage clear).', rarity: 'epic' },
        { id: 'extraPocket', label: 'Extra Pocket', desc: 'Inventory slots +2.', rarity: 'rare' },
        {
            id: 'precisionRacks',
            label: 'Precision Racks',
            desc: 'Multiply crits gain +1 damage.',
            rarity: 'rare'
        },
        {
            id: 'tripleBuffers',
            label: 'Triple Buffers',
            desc: 'Start each stage with +2 shield.',
            rarity: 'common'
        },
        {
            id: 'ampCircuit',
            label: 'Amp Circuit',
            desc: 'Damage multiplier +0.1.',
            rarity: 'rare',
            onAcquire(state, helpers) {
                state.damageMultiplier = Math.min(3, state.damageMultiplier + 0.1);
                helpers.log('Amp Circuit boosts your multiplier.');
                helpers.updateHud();
            }
        },
        {
            id: 'overdriveCoil',
            label: 'Overdrive Coil',
            desc: 'Damage multiplier +0.2.',
            rarity: 'epic',
            onAcquire(state, helpers) {
                state.damageMultiplier = Math.min(3, state.damageMultiplier + 0.2);
                helpers.log('Overdrive Coil surges damage output.');
                helpers.updateHud();
            }
        },
        {
            id: 'temperedArmor',
            label: 'Tempered Armor',
            desc: 'Reduce incoming damage by 1.',
            rarity: 'rare',
            onAcquire(state, helpers) {
                state.armorReduction = Math.min(6, state.armorReduction + 1);
                helpers.log('Tempered armor reinforces the case.');
                helpers.updateHud();
            }
        },
        {
            id: 'bulkBattery',
            label: 'Bulk Battery',
            desc: 'Max charge +1.',
            rarity: 'rare',
            onAcquire(state, helpers) {
                state.abilityMax = Math.min(10, state.abilityMax + 1);
                helpers.log('Bulk battery extends charge capacity.');
                helpers.updateHud();
            }
        },
        {
            id: 'titanPlating',
            label: 'Titan Plating',
            desc: 'Reduce incoming damage by 2.',
            rarity: 'epic',
            onAcquire(state, helpers) {
                state.armorReduction = Math.min(6, state.armorReduction + 2);
                helpers.log('Titan plating absorbs heavier hits.');
                helpers.updateHud();
            }
        },
        {
            id: 'glassCannon',
            label: 'Glass Cannon',
            desc: 'Epic: +1 attack bonus but \u22122 max HP immediately.',
            rarity: 'epic',
            onAcquire(state, helpers) {
                state.attackBonus += 1;
                state.maxHp = Math.max(8, state.maxHp - 2);
                state.playerHp = Math.min(state.playerHp, state.maxHp);
                helpers.log('Glass Cannon engaged (+1 dmg, \u22122 max HP).');
                helpers.updateHud();
            }
        },
        {
            id: 'siphonDivide',
            label: 'Siphon Divide',
            desc: 'Legendary: \u00f7 steals healed HP from foes but adds +0.3 hype.',
            rarity: 'legendary'
        }
    ];
    const itemDefs = {
        medkit: {
            id: 'medkit',
            name: 'Med Kit',
            cost: 70,
            desc: 'Restore 6 HP.',
            use({ state, log, clamp, updateHud }) {
                state.playerHp = clamp(state.playerHp + 6, 0, state.maxHp);
                log('Med Kit applied (+6 HP).');
                updateHud();
            }
        },
        battery: {
            id: 'battery',
            name: 'Battery Pack',
            cost: 55,
            desc: 'Gain +2 charge.',
            use({ state, log, updateAbilitiesUI }) {
                state.abilityCharge = Math.min(state.abilityMax, state.abilityCharge + 2);
                log('Battery pack charged (+2).');
                updateAbilitiesUI();
            }
        },
        shieldCap: {
            id: 'shieldCap',
            name: 'Shield Cap',
            cost: 60,
            desc: 'Add +4 shield.',
            use({ state, log, updateShieldDisplay }) {
                state.shield += 4;
                log('Shield cap fitted (+4 shield).');
                updateShieldDisplay();
            }
        },
        sparkBomb: {
            id: 'sparkBomb',
            name: 'Spark Bomb',
            cost: 85,
            desc: 'Deal 5 damage.',
            use({ state, log, updateEnemyBar, checkEnemyDefeat }) {
                if (!state.enemy || state.enemyDefeated) return;
                const dmg = applyPlayerDamage(state, 5);
                state.enemy.hp -= dmg;
                log(`Spark bomb pops for ${dmg}.`);
                updateEnemyBar();
                checkEnemyDefeat();
            }
        },
        chillSpray: {
            id: 'chillSpray',
            name: 'Chill Spray',
            cost: 65,
            desc: 'Reduce hype by 0.6 and heal 2.',
            use({ state, log, clamp, updateHud }) {
                state.hype = Math.max(1, state.hype - 0.6);
                state.playerHp = clamp(state.playerHp + 2, 0, state.maxHp);
                log('Chill spray cools the circuits.');
                updateHud();
            }
        },
        coinMagnet: {
            id: 'coinMagnet',
            name: 'Coin Magnet',
            cost: 95,
            desc: 'Next stage reward +40 chips.',
            use({ state, log }) {
                state.activeEffects.coinMagnet = true;
                log('Coin magnet armed for the next win.');
            }
        },
        wrenchBlade: {
            id: 'wrenchBlade',
            name: 'Wrench Blade',
            cost: 120,
            desc: '+1 attack bonus.',
            use({ state, log, updateHud }) {
                state.attackBonus += 1;
                log('Wrench Blade equipped (+1 dmg).');
                updateHud();
            }
        },
        chromePlating: {
            id: 'chromePlating',
            name: 'Chrome Plating',
            cost: 130,
            desc: 'Reduce incoming damage by 1.',
            use({ state, log }) {
                state.armorReduction = Math.min(6, state.armorReduction + 1);
                log('Chrome plating installed (-1 dmg).');
            }
        },
        shieldModule: {
            id: 'shieldModule',
            name: 'Shield Module',
            cost: 105,
            desc: '+2 shield bonus.',
            use({ state, log, updateHud }) {
                state.shieldBonus += 2;
                log('Shield module boosted (+2 shield).');
                updateHud();
            }
        },
        megaPotion: {
            id: 'megaPotion',
            name: 'Mega Potion',
            cost: 140,
            desc: 'Restore 10 HP and reduce hype by 0.4.',
            use({ state, log, clamp, updateHud }) {
                state.playerHp = clamp(state.playerHp + 10, 0, state.maxHp);
                state.hype = Math.max(1, state.hype - 0.4);
                log('Mega potion online (+10 HP).');
                updateHud();
            }
        },
        shockCharge: {
            id: 'shockCharge',
            name: 'Shock Charge',
            cost: 110,
            desc: 'Deal 8 damage.',
            use({ state, log, updateEnemyBar, checkEnemyDefeat }) {
                if (!state.enemy || state.enemyDefeated) return;
                const dmg = applyPlayerDamage(state, 8);
                state.enemy.hp -= dmg;
                log(`Shock charge hits for ${dmg}.`);
                updateEnemyBar();
                checkEnemyDefeat();
            }
        },
        smallPotion: {
            id: 'smallPotion',
            name: 'Small Potion',
            cost: 40,
            desc: 'Restore 4 HP.',
            use({ state, log, clamp, updateHud }) {
                state.playerHp = clamp(state.playerHp + 4, 0, state.maxHp);
                log('Small potion +4 HP.');
                updateHud();
            }
        },
        shieldTonic: {
            id: 'shieldTonic',
            name: 'Shield Tonic',
            cost: 75,
            desc: 'Add +6 shield.',
            use({ state, log, updateShieldDisplay }) {
                state.shield += 6;
                log('Shield tonic surges (+6 shield).');
                updateShieldDisplay();
            }
        },
        armorPatch: {
            id: 'armorPatch',
            name: 'Armor Patch',
            cost: 95,
            desc: 'Reduce incoming damage by 1.',
            use({ state, log }) {
                state.armorReduction = Math.min(6, state.armorReduction + 1);
                log('Armor patch applied (-1 dmg).');
            }
        },
        bladeKit: {
            id: 'bladeKit',
            name: 'Blade Kit',
            cost: 180,
            desc: '+2 attack bonus.',
            use({ state, log, updateHud }) {
                state.attackBonus += 2;
                log('Blade kit installed (+2 dmg).');
                updateHud();
            }
        },
        chargeCell: {
            id: 'chargeCell',
            name: 'Charge Cell',
            cost: 90,
            desc: 'Gain +3 charge.',
            use({ state, log, updateAbilitiesUI }) {
                state.abilityCharge = Math.min(state.abilityMax, state.abilityCharge + 3);
                log('Charge cell filled (+3).');
                updateAbilitiesUI();
            }
        },
        nanoShield: {
            id: 'nanoShield',
            name: 'Nano Shield',
            cost: 150,
            desc: 'Add +10 shield.',
            use({ state, log, updateShieldDisplay }) {
                state.shield += 10;
                log('Nano shield deployed (+10 shield).');
                updateShieldDisplay();
            }
        },
        repairKit: {
            id: 'repairKit',
            name: 'Repair Kit',
            cost: 125,
            desc: 'Restore 6 HP and +1 max HP.',
            use({ state, log, clamp, updateHud }) {
                state.maxHp = Math.min(30, state.maxHp + 1);
                state.playerHp = clamp(state.playerHp + 6, 0, state.maxHp);
                log('Repair kit installs (+1 max HP, +6 HP).');
                updateHud();
            }
        },
        magnetBoots: {
            id: 'magnetBoots',
            name: 'Magnet Boots',
            cost: 135,
            desc: 'Next 2 stage rewards +25 chips.',
            use({ state, log }) {
                state.activeEffects.magnetBoots = 2;
                log('Magnet boots ready for two wins.');
            }
        }
    };
    const abilityDefs = {
        powerSurge: {
            id: 'powerSurge',
            name: 'Power Surge',
            rarity: 'rare',
            cost: 4,
            desc: 'Next +/\u00d7 gains +2 damage but +0.2 hype.',
            activate({ state, log }) {
                state.activeEffects.powerSurge = true;
                const hypeCap = state.perkEffects.overclock ? 5.2 : 5;
                state.hype = Math.min(hypeCap, state.hype + 0.2);
                log('Power Surge humming (+0.2 hype).');
            }
        },
        bubbleWrap: {
            id: 'bubbleWrap',
            name: 'Bubble Wrap',
            rarity: 'rare',
            cost: 3,
            desc: 'Skip the next hit and add +4 shield.',
            activate({ state, log, updateAbilitiesUI }) {
                state.activeEffects.bubbleWrap = true;
                state.shield = Math.max(state.shield, 4 + state.shieldBonus);
                log('Bubble Wrap ready.');
                updateAbilitiesUI();
            }
        },
        chronoSkip: {
            id: 'chronoSkip',
            name: 'Chrono Skip',
            rarity: 'epic',
            cost: 5,
            desc: 'Erase the enemy\u2019s next turn (adds +0.1 hype).',
            activate({ state, log }) {
                state.skipNextEnemyTurn = true;
                const hypeCap = state.perkEffects.overclock ? 5.2 : 5;
                state.hype = Math.min(hypeCap, state.hype + 0.1);
                log('Chrono Skip queued.');
            }
        },
        voltDrain: {
            id: 'voltDrain',
            name: 'Volt Drain',
            rarity: 'legendary',
            cost: 4,
            desc: 'Deal 4 dmg & heal 2 HP but wipes remaining charge.',
            activate({ state, log, clamp, updateEnemyBar, checkEnemyDefeat }) {
                if (!state.enemy) return;
                const dmg = applyPlayerDamage(state, 4);
                state.enemy.hp -= dmg;
                state.playerHp = clamp(state.playerHp + 2, 0, state.maxHp);
                state.abilityCharge = 0;
                log(`Volt Drain zaps ${dmg} and heals 2. Charge reset.`);
                updateEnemyBar();
                checkEnemyDefeat();
            }
        },
        panicRecharge: {
            id: 'panicRecharge',
            name: 'Panic Recharge',
            rarity: 'common',
            cost: 2,
            desc: 'Gain +1 charge and +3 shield but +0.15 hype.',
            activate({ state, log, gainCharge }) {
                gainCharge(1);
                state.shield += 3;
                const hypeCap = state.perkEffects.overclock ? 5.2 : 5;
                state.hype = Math.min(hypeCap, state.hype + 0.15);
                log('Panic Recharge throws up a buffer.');
            }
        },
        glitchStep: {
            id: 'glitchStep',
            name: 'Glitch Step',
            rarity: 'rare',
            cost: 3,
            desc: 'Next enemy turn is skipped + gain +1 charge.',
            activate({ state, log, gainCharge }) {
                state.skipNextEnemyTurn = true;
                gainCharge(1);
                log('Glitch Step queued.');
            }
        },
        firewall: {
            id: 'firewall',
            name: 'Firewall',
            rarity: 'epic',
            cost: 4,
            desc: 'Gain +6 shield and reduce hype by 0.3.',
            activate({ state, log }) {
                state.shield += 6;
                state.hype = Math.max(1, state.hype - 0.3);
                log('Firewall raised.');
            }
        },
        surgeStrike: {
            id: 'surgeStrike',
            name: 'Surge Strike',
            rarity: 'legendary',
            cost: 5,
            desc: 'Deal 7 damage and heal 3.',
            activate({ state, log, clamp, updateEnemyBar, checkEnemyDefeat }) {
                if (!state.enemy || state.enemyDefeated) return;
                const dmg = applyPlayerDamage(state, 7);
                state.enemy.hp -= dmg;
                state.playerHp = clamp(state.playerHp + 3, 0, state.maxHp);
                log(`Surge Strike detonates for ${dmg}, +3 HP.`);
                updateEnemyBar();
                checkEnemyDefeat();
            }
        }
    };
    const abilityOrder = Object.keys(abilityDefs);
    const DESKTOP_URL = '../WoahItsMyReallyCoolSiteThatYouShouldStayOnForAReallyReallyLongTimeFromJustHowAwesomeItIs.html';

    function setupWindowControls() {
        const minimizeBtn = document.getElementById('minimize-btn');
        const closeBtn = document.getElementById('close-btn');
        const content = document.querySelector('.window-content');
        if (minimizeBtn && content) {
            minimizeBtn.addEventListener('click', () => {
                const isMinimized = content.classList.toggle('is-minimized');
                minimizeBtn.setAttribute('aria-pressed', isMinimized ? 'true' : 'false');
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.location.href = DESKTOP_URL;
            });
        }
    }

    function init() {
        setupWindowControls();
        const refs = {
            stageEl: document.getElementById('stage-pill'),
            playerHpEl: document.getElementById('player-hp'),
            moodEl: document.getElementById('mood-value'),
            scoreEl: document.getElementById('score-value'),
            coinsEl: document.getElementById('coins-value'),
            shieldEl: document.getElementById('shield-value'),
            enemyNameEl: document.getElementById('enemy-name'),
            enemyNoteEl: document.getElementById('enemy-note'),
            enemyHpBar: document.getElementById('enemy-hp-bar'),
            logEl: document.getElementById('log'),
            gameOverPanel: document.getElementById('game-over'),
            perkListEl: document.getElementById('perk-list'),
            perkChoiceEl: document.getElementById('perk-choice'),
            xpEl: document.getElementById('xp-value'),
            skillPtsEl: document.getElementById('skill-points'),
            chargeEl: document.getElementById('charge-value'),
            abilityStatusEl: document.getElementById('ability-status'),
            abilityListEl: document.getElementById('ability-list'),
            inventoryListEl: document.getElementById('inventory-list'),
            shopPanel: document.getElementById('shop-panel'),
            shopListEl: document.getElementById('shop-list'),
            shopExitBtn: document.getElementById('shop-exit-btn'),
            difficultySelect: document.getElementById('difficulty-select'),
            debugPanel: document.getElementById('debug-panel'),
            debugStage: document.getElementById('debug-stage'),
            debugHp: document.getElementById('debug-hp'),
            debugMaxHp: document.getElementById('debug-maxhp'),
            debugCoins: document.getElementById('debug-coins'),
            debugScore: document.getElementById('debug-score'),
            debugHype: document.getElementById('debug-hype'),
            debugAttack: document.getElementById('debug-attack'),
            debugShield: document.getElementById('debug-shield'),
            debugShieldValue: document.getElementById('debug-shieldval'),
            debugCharge: document.getElementById('debug-charge'),
            debugChargeMax: document.getElementById('debug-chargemax'),
            debugDamageMult: document.getElementById('debug-dmgmult'),
            debugArmor: document.getElementById('debug-armor'),
            debugDifficulty: document.getElementById('debug-difficulty'),
            debugApply: document.getElementById('debug-apply'),
            debugSpawn: document.getElementById('debug-spawn'),
            debugKill: document.getElementById('debug-kill'),
            debugShop: document.getElementById('debug-shop'),
            debugPerk: document.getElementById('debug-perk'),
            debugAbility: document.getElementById('debug-ability'),
            debugItem: document.getElementById('debug-item'),
            debugClear: document.getElementById('debug-clear'),
            debugClose: document.getElementById('debug-close')
        };
        const buttons = {
            add: document.getElementById('btn-add'),
            sub: document.getElementById('btn-sub'),
            mul: document.getElementById('btn-mul'),
            div: document.getElementById('btn-div')
        };
        const skillButtons = {
            hp: document.getElementById('skill-hp'),
            attack: document.getElementById('skill-attack'),
            shield: document.getElementById('skill-shield')
        };
        const state = {
            stage: 1,
            playerHp: 14,
            maxHp: 14,
            hype: 1,
            score: 0,
            coins: 0,
            difficulty: 'normal',
            damageMultiplier: 1,
            shield: 0,
            armorReduction: 0,
            playing: true,
            busy: false,
            enemyDefeated: false,
            awaitingPerk: false,
            awaitingPerkChoice: false,
            awaitingShop: false,
            pendingShop: false,
            skipNextEnemyTurn: false,
            enemy: null,
            perkEffects: {},
            xp: 0,
            xpNeeded: 100,
            skillPoints: 0,
            attackBonus: 0,
            shieldBonus: 0,
            abilityCharge: 0,
            abilityMax: 6,
            activeEffects: { powerSurge: false, bubbleWrap: false, coinMagnet: false, magnetBoots: 0 },
            unlockedAbilities: [],
            inventory: [],
            inventoryLimit: 4,
            shopStock: [],
            konamiIndex: 0
        };
        const helpers = {
            log,
            updateHud,
            updateEnemyBar,
            updateAbilitiesUI,
            updateShieldDisplay,
            clamp,
            gainCharge,
            checkEnemyDefeat
        };

        function log(message) {
            const p = document.createElement('p');
            p.textContent = message;
            refs.logEl.prepend(p);
            while (refs.logEl.children.length > 6) {
                refs.logEl.removeChild(refs.logEl.lastChild);
            }
        }
        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }
        function updateShieldDisplay() {
            refs.shieldEl.textContent = String(state.shield);
        }
        function updateMood() {
            const entry = moods.find(m => state.hype <= m.cap) || moods[moods.length - 1];
            refs.moodEl.textContent = entry.label;
        }
        function renderPerks() {
            refs.perkListEl.innerHTML = '';
            const active = Object.keys(state.perkEffects).filter(id => state.perkEffects[id]);
            if (!active.length) {
                refs.perkListEl.innerHTML = '<span class="perk-chip">None yet</span>';
                return;
            }
            active.forEach(id => {
                const perk = perkPool.find(p => p.id === id);
                if (!perk) return;
                const meta = RARITIES[perk.rarity] || {};
                const span = document.createElement('span');
                span.className = `perk-chip ${meta.chip || ''}`.trim();
                span.textContent = perk.label;
                refs.perkListEl.appendChild(span);
            });
        }
        function renderAbilityList() {
            refs.abilityListEl.innerHTML = '';
            if (!state.unlockedAbilities.length) {
                const p = document.createElement('p');
                p.className = 'ability-empty';
                p.textContent = 'No abilities unlocked yet.';
                refs.abilityListEl.appendChild(p);
                return;
            }
            state.unlockedAbilities.forEach(id => {
                const ability = abilityDefs[id];
                if (!ability) return;
                const meta = RARITIES[ability.rarity] || {};
                const btn = document.createElement('button');
                btn.className = `ability-btn ${meta.ability || ''}`.trim();
                btn.dataset.abilityId = ability.id;
                btn.innerHTML = `<strong>${ability.name} (${ability.cost})</strong><br>${ability.desc}`;
                btn.addEventListener('click', () => activateAbility(ability.id));
                refs.abilityListEl.appendChild(btn);
            });
            updateAbilitiesUI();
        }
        function renderInventory() {
            if (!refs.inventoryListEl) return;
            refs.inventoryListEl.innerHTML = '';
            if (!state.inventory.length) {
                const p = document.createElement('p');
                p.className = 'ability-empty';
                p.textContent = 'No items yet.';
                refs.inventoryListEl.appendChild(p);
                return;
            }
            state.inventory.forEach((id, index) => {
                const item = itemDefs[id];
                if (!item) return;
                const card = document.createElement('div');
                card.className = 'item-card';
                const info = document.createElement('div');
                info.className = 'item-info';
                info.innerHTML = `<span class="item-name">${item.name}</span><span>${item.desc}</span>`;
                const actions = document.createElement('div');
                actions.className = 'item-actions';
                const useBtn = document.createElement('button');
                useBtn.className = 'item-btn';
                useBtn.type = 'button';
                useBtn.textContent = 'Use';
                useBtn.disabled = !state.playing || state.awaitingPerkChoice || state.awaitingShop;
                useBtn.addEventListener('click', () => useItem(index));
                actions.appendChild(useBtn);
                card.appendChild(info);
                card.appendChild(actions);
                refs.inventoryListEl.appendChild(card);
            });
        }
        function renderShop() {
            if (!refs.shopListEl) return;
            refs.shopListEl.innerHTML = '';
            if (!state.shopStock.length) {
                refs.shopListEl.innerHTML = '<p class="ability-empty">Shop is empty.</p>';
                return;
            }
            state.shopStock.forEach((id, index) => {
                const item = itemDefs[id];
                if (!item) return;
                const card = document.createElement('div');
                card.className = 'item-card';
                const info = document.createElement('div');
                info.className = 'item-info';
                info.innerHTML = `<span class="item-name">${item.name}</span><span>${item.desc}</span>`;
                const actions = document.createElement('div');
                actions.className = 'item-actions';
                const price = Math.round(item.cost * (state.perkEffects.refundPolicy ? 0.9 : 1));
                const buyBtn = document.createElement('button');
                buyBtn.className = 'item-btn';
                buyBtn.type = 'button';
                buyBtn.textContent = `Buy (${price})`;
                buyBtn.disabled = state.coins < price || state.inventory.length >= state.inventoryLimit;
                buyBtn.addEventListener('click', () => buyItem(index, price));
                actions.appendChild(buyBtn);
                card.appendChild(info);
                card.appendChild(actions);
                refs.shopListEl.appendChild(card);
            });
        }
        function openShop() {
            if (!refs.shopPanel) return;
            state.awaitingShop = true;
            state.shopStock = getShopStock();
            refs.shopPanel.hidden = false;
            renderShop();
            Object.values(buttons).forEach(btn => btn.disabled = true);
            updateAbilitiesUI();
            renderInventory();
        }
        function closeShop() {
            if (!refs.shopPanel) return;
            refs.shopPanel.hidden = true;
            state.awaitingShop = false;
            state.shopStock = [];
            state.pendingShop = false;
            if (refs.shopListEl) refs.shopListEl.innerHTML = '';
            Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
            maybeSpawnAfterRewards();
        }
        function getShopStock() {
            const pool = Object.keys(itemDefs);
            const pick = shuffle(pool).slice(0, 3);
            return pick;
        }
        function addItem(id) {
            if (!itemDefs[id]) return false;
            if (state.inventory.length >= state.inventoryLimit) {
                log('Inventory full. Skip or use an item first.');
                return false;
            }
            state.inventory.push(id);
            renderInventory();
            return true;
        }
        function buyItem(index, price) {
            const id = state.shopStock[index];
            if (!id) return;
            if (state.coins < price) return;
            if (!addItem(id)) return;
            state.coins -= price;
            state.shopStock.splice(index, 1);
            log(`Bought ${itemDefs[id].name} for ${price} chips.`);
            updateHud();
            renderShop();
        }
        function useItem(index) {
            const id = state.inventory[index];
            const item = itemDefs[id];
            if (!item) return;
            item.use({ state, log, clamp, updateHud, updateAbilitiesUI, updateShieldDisplay, updateEnemyBar, checkEnemyDefeat });
            state.inventory.splice(index, 1);
            renderInventory();
            updateHud();
        }
        function maybeSpawnAfterRewards() {
            if (!state.awaitingPerkChoice && !state.awaitingShop && state.enemyDefeated) {
                setTimeout(spawnEnemy, 700);
            }
        }
        function updateSkillsUI() {
            refs.xpEl.textContent = `XP ${state.xp.toString().padStart(3, '0')} / ${state.xpNeeded}`;
            refs.skillPtsEl.textContent = `Skill Pts: ${state.skillPoints}`;
            const available = state.skillPoints > 0 && state.playing && !state.awaitingPerkChoice;
            Object.values(skillButtons).forEach(btn => btn.disabled = !available);
        }
        function updateAbilitiesUI() {
            refs.chargeEl.textContent = `Charge: ${state.abilityCharge} / ${state.abilityMax}`;
            refs.abilityStatusEl.textContent = state.activeEffects.powerSurge
                ? 'Power Surge primed'
                : state.activeEffects.bubbleWrap
                    ? 'Bubble primed'
                    : state.activeEffects.coinMagnet
                        ? 'Coin magnet armed'
                        : 'Idle';
            const locked = !state.playing || state.awaitingPerkChoice || state.awaitingShop;
            refs.abilityListEl.querySelectorAll('.ability-btn').forEach(btn => {
                const ability = abilityDefs[btn.dataset.abilityId];
                if (!ability) {
                    btn.disabled = true;
                    return;
                }
                btn.disabled = locked || state.abilityCharge < ability.cost;
            });
        }
        function updateHud() {
            refs.playerHpEl.textContent = `${state.playerHp} / ${state.maxHp}`;
            refs.scoreEl.textContent = state.score.toString().padStart(4, '0');
            if (refs.coinsEl) {
                refs.coinsEl.textContent = state.coins.toString().padStart(4, '0');
            }
            refs.stageEl.textContent = `Stage ${state.stage}`;
            if (refs.difficultySelect) {
                refs.difficultySelect.value = state.difficulty;
            }
            updateMood();
            renderPerks();
            updateSkillsUI();
            updateAbilitiesUI();
            updateShieldDisplay();
            renderInventory();
            renderShop();
            syncDebugPanel();
        }

        function setDifficulty(value) {
            if (!DIFFICULTY_SETTINGS[value]) return;
            state.difficulty = value;
            updateHud();
        }

        function syncDebugPanel() {
            if (!refs.debugPanel || !refs.debugPanel.classList.contains('active')) return;
            if (refs.debugStage) refs.debugStage.value = state.stage;
            if (refs.debugHp) refs.debugHp.value = state.playerHp;
            if (refs.debugMaxHp) refs.debugMaxHp.value = state.maxHp;
            if (refs.debugCoins) refs.debugCoins.value = state.coins;
            if (refs.debugScore) refs.debugScore.value = state.score;
            if (refs.debugHype) refs.debugHype.value = state.hype.toFixed(1);
            if (refs.debugAttack) refs.debugAttack.value = state.attackBonus;
            if (refs.debugShield) refs.debugShield.value = state.shieldBonus;
            if (refs.debugShieldValue) refs.debugShieldValue.value = state.shield;
            if (refs.debugCharge) refs.debugCharge.value = state.abilityCharge;
            if (refs.debugChargeMax) refs.debugChargeMax.value = state.abilityMax;
            if (refs.debugDamageMult) refs.debugDamageMult.value = state.damageMultiplier.toFixed(2);
            if (refs.debugArmor) refs.debugArmor.value = state.armorReduction;
            if (refs.debugDifficulty) refs.debugDifficulty.value = state.difficulty;
        }

        function openDebugPanel() {
            if (!refs.debugPanel) return;
            refs.debugPanel.classList.add('active');
            syncDebugPanel();
        }

        function closeDebugPanel() {
            if (!refs.debugPanel) return;
            refs.debugPanel.classList.remove('active');
        }

        function applyDebugValues() {
            state.stage = Math.max(1, parseInt(refs.debugStage.value, 10) || state.stage);
            state.playerHp = Math.max(0, parseInt(refs.debugHp.value, 10) || state.playerHp);
            state.maxHp = Math.max(1, parseInt(refs.debugMaxHp.value, 10) || state.maxHp);
            state.coins = Math.max(0, parseInt(refs.debugCoins.value, 10) || state.coins);
            state.score = Math.max(0, parseInt(refs.debugScore.value, 10) || state.score);
            state.hype = Math.max(1, parseFloat(refs.debugHype.value) || state.hype);
            state.attackBonus = Math.max(0, parseInt(refs.debugAttack.value, 10) || state.attackBonus);
            state.shieldBonus = Math.max(0, parseInt(refs.debugShield.value, 10) || state.shieldBonus);
            state.shield = Math.max(0, parseInt(refs.debugShieldValue.value, 10) || state.shield);
            state.abilityCharge = Math.max(0, parseInt(refs.debugCharge.value, 10) || state.abilityCharge);
            state.abilityMax = Math.max(1, parseInt(refs.debugChargeMax.value, 10) || state.abilityMax);
            state.damageMultiplier = Math.max(0.5, parseFloat(refs.debugDamageMult.value) || state.damageMultiplier);
            state.armorReduction = Math.max(0, parseInt(refs.debugArmor.value, 10) || state.armorReduction);
            setDifficulty(refs.debugDifficulty.value);
            state.abilityCharge = Math.min(state.abilityCharge, state.abilityMax);
            updateHud();
        }
        function spendSkill(type) {
            if (state.skillPoints <= 0) return;
            state.skillPoints -= 1;
            if (type === 'hp') {
                state.maxHp += 1;
                state.playerHp = Math.min(state.maxHp, state.playerHp + 1);
                log('Max HP +1.');
            } else if (type === 'attack') {
                state.attackBonus += 1;
                log('Damage feels snappier.');
            } else {
                state.shieldBonus += 1;
                log('Shield buffer upgraded.');
            }
            updateHud();
        }
        function grantXP(amount) {
            state.xp += amount;
            while (state.xp >= state.xpNeeded) {
                state.xp -= state.xpNeeded;
                state.skillPoints += 1;
                state.xpNeeded = Math.min(220, state.xpNeeded + 20);
                log('Skill point earned!');
            }
            updateSkillsUI();
        }
        function gainCharge(amount = 1) {
            state.abilityCharge = Math.min(state.abilityMax, state.abilityCharge + amount);
            updateAbilitiesUI();
        }
        function activateAbility(id) {
            if (state.awaitingPerkChoice || !state.playing) return;
            const ability = abilityDefs[id];
            if (!ability) return;
            if (state.abilityCharge < ability.cost) return;
            state.abilityCharge -= ability.cost;
            ability.activate({ state, log, gainCharge, updateEnemyBar, updateAbilitiesUI, checkEnemyDefeat, clamp });
            updateAbilitiesUI();
            updateHud();
        }
        function unlockAbility(id) {
            if (!abilityDefs[id]) return;
            if (state.unlockedAbilities.includes(id)) return;
            state.unlockedAbilities.push(id);
            log(`Ability learned: ${abilityDefs[id].name}`);
            renderAbilityList();
        }
        function renderAbilityReward(ids) {
            refs.perkChoiceEl.innerHTML = '';
            const heading = document.createElement('p');
            heading.className = 'reward-heading';
            heading.textContent = 'Choose an ability upgrade';
            refs.perkChoiceEl.appendChild(heading);
            ids.forEach(id => {
                const ability = abilityDefs[id];
                if (!ability) return;
                const meta = RARITIES[ability.rarity] || {};
                const btn = document.createElement('button');
                btn.className = `reward-card ${meta.card || ''}`.trim();
                btn.innerHTML = `<strong>${ability.name}</strong> \u00b7 Cost ${ability.cost}<br>${ability.desc}`;
                btn.addEventListener('click', () => {
                    unlockAbility(id);
                    finishRewardChoice();
                });
                refs.perkChoiceEl.appendChild(btn);
            });
            refs.perkChoiceEl.hidden = false;
            state.awaitingPerkChoice = true;
            Object.values(buttons).forEach(btn => btn.disabled = true);
        }
        function applyPerk(perk, fromReward = true) {
            if (state.perkEffects[perk.id]) return;
            state.perkEffects[perk.id] = true;
            if (typeof perk.onAcquire === 'function') {
                perk.onAcquire(state, { log, updateHud });
            } else if (perk.id === 'siphonDivide') {
                log('Siphon Divide learned. \u00f7 steals HP but adds hype.');
            } else if (perk.id === 'extraPocket') {
                state.inventoryLimit += 2;
                log('Extra pockets stitched (+2 slots).');
            } else if (perk.id === 'tripleBuffers') {
                state.shield += 2;
                log('Buffer shield boots +2 shield.');
                updateShieldDisplay();
            } else {
                log(`Perk learned: ${perk.label}`);
            }
            if (fromReward) finishRewardChoice();
            updateHud();
        }
        function renderPerkReward(cards) {
            refs.perkChoiceEl.innerHTML = '';
            const heading = document.createElement('p');
            heading.className = 'reward-heading';
            heading.textContent = 'Choose a perk';
            refs.perkChoiceEl.appendChild(heading);
            cards.forEach(perk => {
                const meta = RARITIES[perk.rarity] || {};
                const btn = document.createElement('button');
                btn.className = `reward-card ${meta.card || ''}`.trim();
                btn.innerHTML = `<strong>${perk.label}</strong><br>${perk.desc}`;
                btn.addEventListener('click', () => applyPerk(perk));
                refs.perkChoiceEl.appendChild(btn);
            });
            refs.perkChoiceEl.hidden = false;
            state.awaitingPerkChoice = true;
            Object.values(buttons).forEach(btn => btn.disabled = true);
        }
        function finishRewardChoice() {
            state.awaitingPerkChoice = false;
            refs.perkChoiceEl.hidden = true;
            refs.perkChoiceEl.innerHTML = '';
            Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
            if (state.pendingShop) {
                openShop();
                return;
            }
            maybeSpawnAfterRewards();
        }
        function getLockedAbilities() {
            return abilityOrder.filter(id => !state.unlockedAbilities.includes(id));
        }
        function offerRewardsIfReady() {
            if (state.stage <= 1) return;
            if (state.stage % 2 !== 0) return;
            const availablePerks = perkPool.filter(perk => !state.perkEffects[perk.id]);
            const lockedAbilities = getLockedAbilities();
            const shouldOfferAbility = lockedAbilities.length && Math.random() < 0.35;
            if (shouldOfferAbility) {
                const picks = shuffle(lockedAbilities).slice(0, Math.min(2, lockedAbilities.length));
                renderAbilityReward(picks);
            } else if (availablePerks.length) {
                const choices = shuffle(availablePerks).slice(0, Math.min(3, availablePerks.length));
                renderPerkReward(choices);
            }
        }
        function shuffle(arr) {
            return arr.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
        }
        function spawnEnemy() {
            const baseHp = 8 + state.stage * 2;
            state.enemy = {
                name: enemyNames[Math.floor(Math.random() * enemyNames.length)],
                note: enemyNotes[Math.floor(Math.random() * enemyNotes.length)],
                hp: baseHp,
                maxHp: baseHp
            };
            state.enemyDefeated = false;
            refs.enemyNameEl.textContent = state.enemy.name;
            refs.enemyNoteEl.textContent = state.enemy.note;
            updateEnemyBar();
            log(`${state.enemy.name} wobbles into view.`);
            state.awaitingPerk = false;
            if (state.perkEffects.tripleBuffers) {
                state.shield += 2;
                updateShieldDisplay();
            }
            Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
        }
        function updateEnemyBar() {
            if (!state.enemy) return;
            const pct = Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100);
            refs.enemyHpBar.style.width = `${pct}%`;
        }
        function playerHit(amount) {
            state.playerHp = clamp(state.playerHp - amount, 0, state.maxHp);
            updateHud();
            if (state.playerHp <= 0) endGame();
        }
        function queueEnemyTurn() {
            setTimeout(() => {
                if (state.enemyDefeated || !state.enemy) {
                    state.busy = false;
                    return;
                }
                if (state.skipNextEnemyTurn) {
                    log('Chrono skip wipes the enemy action.');
                    state.skipNextEnemyTurn = false;
                    state.busy = false;
                    Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
                    return;
                }
                if (state.activeEffects.bubbleWrap) {
                    log('Bubble absorbs the next attack.');
                    state.activeEffects.bubbleWrap = false;
                    updateAbilitiesUI();
                    state.busy = false;
                    Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
                    return;
                }
                if (state.perkEffects.luckyDigits && Math.random() < 0.05) {
                    log('Lucky digits! Enemy turn skipped.');
                    state.busy = false;
                    Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
                    return;
                }
                enemyTurn();
                state.busy = false;
                Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
            }, 600);
        }
        function enemyTurn() {
            if (!state.playing || !state.enemy || state.enemy.hp <= 0 || state.enemyDefeated) return;
            let dmg = 2 + Math.floor(state.stage * 0.4) + Math.floor(Math.random() * 3);
            dmg = Math.ceil(dmg * getDamageTakenMultiplier(state));
            dmg = Math.max(0, dmg - state.armorReduction);
            if (state.shield > 0) {
                const blocked = Math.min(dmg, state.shield);
                dmg -= blocked;
                log(`Shield eats ${blocked} damage.`);
                state.shield = 0;
                updateShieldDisplay();
                if (blocked > 0 && state.perkEffects.spikyShield) {
                    state.enemy.hp -= 1;
                    updateEnemyBar();
                    log('Spiky shield zaps 1 damage back.');
                }
            }
            if (dmg <= 0) {
                log(`${state.enemy.name} whiffs completely.`);
            } else {
                playerHit(dmg);
                log(`${state.enemy.name} bonks you for ${dmg}.`);
            }
        }
        function checkEnemyDefeat() {
            if (!state.enemy || state.enemy.hp > 0) return false;
            if (state.enemyDefeated) return true;
            state.enemyDefeated = true;
            Object.values(buttons).forEach(btn => btn.disabled = true);
            const reward = 40 + state.stage * 12;
            state.score += reward;
            state.coins += reward;
            grantXP(35 + state.stage * 8);
            state.stage += 1;
            const hypeGain = state.perkEffects.zenMode ? 0.15 : 0.3;
            const hypeCap = state.perkEffects.overclock ? 5.2 : 4.5;
            state.hype = Math.min(hypeCap, state.hype + hypeGain + (state.perkEffects.overclock ? 0.2 : 0));
            state.maxHp = Math.min(26, state.maxHp + 1);
            const bonusHeal = state.perkEffects.cleanDigits ? 2 : 0;
            const heal = (state.perkEffects.batterySnacks ? 5 : 3) + bonusHeal;
            state.playerHp = Math.min(state.maxHp, state.playerHp + heal);
            gainCharge(1);
            if (state.perkEffects.chipRain) gainCharge(1);
            if (state.activeEffects.coinMagnet) {
                state.coins += 40;
                state.activeEffects.coinMagnet = false;
                log('Coin magnet pays out +40 chips.');
            }
            if (state.activeEffects.magnetBoots) {
                state.coins += 25;
                state.activeEffects.magnetBoots = Math.max(0, state.activeEffects.magnetBoots - 1);
                log('Magnet boots bonus +25 chips.');
            }
            log(`${state.enemy.name} fizzles out. +${reward} pts, +${heal} HP.`);
            state.awaitingPerk = true;
            offerRewardsIfReady();
            const shouldShop = state.stage % 3 === 0;
            if (state.awaitingPerkChoice && shouldShop) {
                state.pendingShop = true;
            } else if (shouldShop) {
                openShop();
            }
            maybeSpawnAfterRewards();
            return true;
        }
        function addAction() {
            if (!state.enemy) return;
            const swings = state.perkEffects.doubleTap ? 2 : 1;
            let extra = state.activeEffects.powerSurge ? 2 : 0;
            let total = 0;
            for (let i = 0; i < swings; i++) {
                const bonus = state.perkEffects.stickyKeys && state.hype <= 1.2 ? 1 : 0;
                const base = 2 + Math.floor(Math.random() * 3) + state.attackBonus + extra + bonus;
                const dmg = applyPlayerDamage(state, base);
                total += dmg;
                state.enemy.hp -= dmg;
                extra = 0;
            }
            state.activeEffects.powerSurge = false;
            updateEnemyBar();
            log(`You add ${total} polite damage.`);
        }
        function subAction() {
            let base = 3 + Math.floor(Math.random() * 2) + state.shieldBonus;
            if (state.perkEffects.sugarShields) base += 2;
            state.shield = base;
            log(`Shield dial set to ${state.shield}.`);
            updateShieldDisplay();
        }
        function mulAction() {
            if (!state.enemy) return;
            let dmg = 4 + Math.floor(Math.random() * 3) + state.attackBonus;
            if (state.activeEffects.powerSurge) {
                dmg += 2;
                state.activeEffects.powerSurge = false;
            }
            if (state.perkEffects.wildMultiplier) dmg += 2;
            if (state.perkEffects.precisionRacks && Math.random() < 0.35) dmg += 1;
            dmg = applyPlayerDamage(state, dmg);
            state.enemy.hp -= dmg;
            updateEnemyBar();
            log(`Multiplied drama for ${dmg}!`);
            playerHit(state.perkEffects.wildMultiplier ? 2 : 1);
        }
        function divAction() {
            if (!state.enemy) return;
            let heal = 2 + Math.floor(Math.random() * 2);
            if (state.perkEffects.laserLemonade) heal += 1;
            state.playerHp = clamp(state.playerHp + heal, 0, state.maxHp);
            const hypeDrop = state.perkEffects.laserLemonade ? 0.4 : 0.2;
            state.hype = Math.max(1, state.hype - hypeDrop);
            if (state.perkEffects.juiceBox) gainCharge(1);
            if (state.perkEffects.siphonDivide) {
                const siphon = Math.min(state.enemy.hp, heal);
                const siphonDmg = applyPlayerDamage(state, siphon);
                state.enemy.hp -= siphonDmg;
                state.hype = Math.min(5, state.hype + 0.3);
                log(`Siphoned ${siphonDmg} HP from ${state.enemy.name} (+0.3 hype).`);
                updateEnemyBar();
                if (checkEnemyDefeat()) return;
            }
            log(`Dividing chores. +${heal} HP.`);
            updateHud();
        }
        function takeTurn(fn) {
            if (!state.playing || state.busy || state.awaitingPerkChoice || state.awaitingShop || state.enemyDefeated) return;
            state.busy = true;
            Object.values(buttons).forEach(btn => btn.disabled = true);
            fn();
            if (state.perkEffects.chargeSaver && state.abilityCharge < 2) {
                gainCharge(1);
            }
            gainCharge(1);
            updateHud();
            if (checkEnemyDefeat()) {
                state.busy = false;
            } else {
                queueEnemyTurn();
            }
        }
        function endGame() {
            state.playing = false;
            refs.gameOverPanel.hidden = false;
            Object.values(buttons).forEach(btn => btn.disabled = true);
            log('calculator needs a juice break.');
        }
        function resetGame() {
            state.stage = 1;
            state.playerHp = 14;
            state.maxHp = 14;
            state.hype = 1;
            state.score = 0;
            state.coins = 0;
            state.shield = 0;
            state.difficulty = 'normal';
            state.damageMultiplier = 1;
            state.armorReduction = 0;
            state.playing = true;
            state.busy = false;
            state.enemyDefeated = false;
            state.awaitingPerk = false;
            state.awaitingPerkChoice = false;
            state.awaitingShop = false;
            state.pendingShop = false;
            state.perkEffects = {};
            state.xp = 0;
            state.xpNeeded = 100;
            state.skillPoints = 0;
            state.attackBonus = 0;
            state.shieldBonus = 0;
            state.abilityCharge = 0;
            state.abilityMax = 6;
            state.activeEffects.powerSurge = false;
            state.activeEffects.bubbleWrap = false;
            state.activeEffects.coinMagnet = false;
            state.activeEffects.magnetBoots = 0;
            state.unlockedAbilities = [];
            state.inventory = [];
            state.inventoryLimit = 4;
            state.shopStock = [];
            state.skipNextEnemyTurn = false;
            refs.perkChoiceEl.hidden = true;
            refs.perkChoiceEl.innerHTML = '';
            refs.gameOverPanel.hidden = true;
            if (refs.shopPanel) refs.shopPanel.hidden = true;
            refs.logEl.innerHTML = '';
            Object.values(buttons).forEach(btn => btn.disabled = false);
            renderAbilityList();
            updateHud();
            spawnEnemy();
            log('fresh batteries installed.');
        }

        function resetRewardFlow() {
            state.awaitingPerk = false;
            state.awaitingPerkChoice = false;
            state.awaitingShop = false;
            state.pendingShop = false;
            refs.perkChoiceEl.hidden = true;
            refs.perkChoiceEl.innerHTML = '';
            if (refs.shopPanel) refs.shopPanel.hidden = true;
            Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
        }

        function handleKonamiInput(event) {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
                return;
            }
            const sequence = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a','s'];
            const key = event.key.toLowerCase();
            if (key === sequence[state.konamiIndex]) {
                state.konamiIndex += 1;
                if (state.konamiIndex >= sequence.length) {
                    state.konamiIndex = 0;
                    openDebugPanel();
                }
                return;
            }
            state.konamiIndex = key === sequence[0] ? 1 : 0;
        }

        function grantRandomPerk() {
            const available = perkPool.filter(perk => !state.perkEffects[perk.id]);
            if (!available.length) {
                log('No perks left to grant.');
                return;
            }
            const perk = shuffle(available)[0];
            applyPerk(perk, false);
        }

        function grantRandomAbility() {
            const locked = getLockedAbilities();
            if (!locked.length) {
                log('All abilities already unlocked.');
                return;
            }
            unlockAbility(shuffle(locked)[0]);
        }

        function grantRandomItem() {
            const items = Object.keys(itemDefs);
            const pick = shuffle(items)[0];
            if (addItem(pick)) {
                log(`Debug item delivered: ${itemDefs[pick].name}`);
            }
        }

        function clearPerksAndAbilities() {
            state.perkEffects = {};
            state.unlockedAbilities = [];
            state.inventoryLimit = 4;
            state.damageMultiplier = 1;
            state.armorReduction = 0;
            state.abilityMax = 6;
            state.abilityCharge = Math.min(state.abilityCharge, state.abilityMax);
            state.activeEffects.powerSurge = false;
            state.activeEffects.bubbleWrap = false;
            state.activeEffects.coinMagnet = false;
            state.activeEffects.magnetBoots = 0;
            renderAbilityList();
            updateHud();
            log('Perks and abilities cleared.');
        }

        buttons.add.addEventListener('click', () => takeTurn(addAction));
        buttons.sub.addEventListener('click', () => takeTurn(subAction));
        buttons.mul.addEventListener('click', () => takeTurn(mulAction));
        buttons.div.addEventListener('click', () => takeTurn(divAction));
        document.getElementById('restart-btn').addEventListener('click', resetGame);
        skillButtons.hp.addEventListener('click', () => spendSkill('hp'));
        skillButtons.attack.addEventListener('click', () => spendSkill('attack'));
        skillButtons.shield.addEventListener('click', () => spendSkill('shield'));
        if (refs.shopExitBtn) {
            refs.shopExitBtn.addEventListener('click', closeShop);
        }
        if (refs.difficultySelect) {
            refs.difficultySelect.addEventListener('change', event => {
                setDifficulty(event.target.value);
            });
        }
        if (refs.debugApply) refs.debugApply.addEventListener('click', applyDebugValues);
        if (refs.debugSpawn) refs.debugSpawn.addEventListener('click', () => {
            resetRewardFlow();
            spawnEnemy();
            updateHud();
        });
        if (refs.debugKill) refs.debugKill.addEventListener('click', () => {
            if (!state.enemy) return;
            state.enemy.hp = 0;
            updateEnemyBar();
            checkEnemyDefeat();
        });
        if (refs.debugShop) refs.debugShop.addEventListener('click', () => {
            if (refs.shopPanel && !refs.shopPanel.hidden) {
                closeShop();
            } else {
                openShop();
            }
        });
        if (refs.debugPerk) refs.debugPerk.addEventListener('click', grantRandomPerk);
        if (refs.debugAbility) refs.debugAbility.addEventListener('click', grantRandomAbility);
        if (refs.debugItem) refs.debugItem.addEventListener('click', grantRandomItem);
        if (refs.debugClear) refs.debugClear.addEventListener('click', clearPerksAndAbilities);
        if (refs.debugClose) refs.debugClose.addEventListener('click', closeDebugPanel);
        document.addEventListener('keydown', handleKonamiInput);

        log('warming up the calculator...');
        renderAbilityList();
        updateHud();
        spawnEnemy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
