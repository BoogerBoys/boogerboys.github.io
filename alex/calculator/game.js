
(function(){
    const enemyNames = ['hex goblin','carry ogre','decimal slime','fuzzy divider','pointless knight','backspace cat'];
    const enemyNotes = ['keeps licking the solar panel.','collects loose screws.','vaporizes fractions for fun.','obsessed with screensavers.','afraid of exact change.','thinks batteries are spicy.'];
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
    const abilityDefs = {
        powerSurge: {
            id: 'powerSurge',
            name: 'Power Surge',
            rarity: 'rare',
            cost: 4,
            desc: 'Next +/\u00d7 gains +2 damage but +0.2 hype.',
            activate({ state, log }) {
                state.activeEffects.powerSurge = true;
                state.hype = Math.min(5, state.hype + 0.2);
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
                state.hype = Math.min(5, state.hype + 0.1);
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
                state.enemy.hp -= 4;
                state.playerHp = clamp(state.playerHp + 2, 0, state.maxHp);
                state.abilityCharge = 0;
                log('Volt Drain zaps 4 and heals 2. Charge reset.');
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
                state.hype = Math.min(5, state.hype + 0.15);
                log('Panic Recharge throws up a buffer.');
            }
        }
    };
    const abilityOrder = Object.keys(abilityDefs);

    function init() {
        const refs = {
            stageEl: document.getElementById('stage-pill'),
            playerHpEl: document.getElementById('player-hp'),
            moodEl: document.getElementById('mood-value'),
            scoreEl: document.getElementById('score-value'),
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
            abilityListEl: document.getElementById('ability-list')
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
            shield: 0,
            playing: true,
            busy: false,
            awaitingPerk: false,
            awaitingPerkChoice: false,
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
            activeEffects: { powerSurge: false, bubbleWrap: false },
            unlockedAbilities: []
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
                    : 'Idle';
            const locked = !state.playing || state.awaitingPerkChoice;
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
            refs.stageEl.textContent = `Stage ${state.stage}`;
            updateMood();
            renderPerks();
            updateSkillsUI();
            updateAbilitiesUI();
            updateShieldDisplay();
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
        function applyPerk(perk) {
            if (state.perkEffects[perk.id]) return;
            state.perkEffects[perk.id] = true;
            if (typeof perk.onAcquire === 'function') {
                perk.onAcquire(state, { log, updateHud });
            } else if (perk.id === 'siphonDivide') {
                log('Siphon Divide learned. \u00f7 steals HP but adds hype.');
            } else {
                log(`Perk learned: ${perk.label}`);
            }
            finishRewardChoice();
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
        }
        function getLockedAbilities() {
            return abilityOrder.filter(id => !state.unlockedAbilities.includes(id));
        }
        function offerRewardsIfReady() {
            if (state.stage <= 1) return;
            if (state.stage % 2 !== 0) return;
            const availablePerks = perkPool.filter(perk => !state.perkEffects[perk.id]);
            const lockedAbilities = getLockedAbilities();
            const shouldOfferAbility = lockedAbilities.length && Math.random() < 0.25;
            if (shouldOfferAbility) {
                const pick = lockedAbilities[Math.floor(Math.random() * lockedAbilities.length)];
                renderAbilityReward([pick]);
            } else if (availablePerks.length) {
                const choices = shuffle(availablePerks).slice(0, Math.min(2, availablePerks.length));
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
            refs.enemyNameEl.textContent = state.enemy.name;
            refs.enemyNoteEl.textContent = state.enemy.note;
            updateEnemyBar();
            log(`${state.enemy.name} wobbles into view.`);
            if (state.awaitingPerk) {
                offerRewardsIfReady();
                state.awaitingPerk = false;
            }
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
            if (!state.playing || !state.enemy || state.enemy.hp <= 0) return;
            let dmg = 2 + Math.floor(state.stage * 0.4) + Math.floor(Math.random() * 3);
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
            const reward = 40 + state.stage * 12;
            state.score += reward;
            grantXP(35 + state.stage * 8);
            state.stage += 1;
            const hypeGain = state.perkEffects.zenMode ? 0.15 : 0.3;
            state.hype = Math.min(4.5, state.hype + hypeGain);
            state.maxHp = Math.min(26, state.maxHp + 1);
            const heal = state.perkEffects.batterySnacks ? 5 : 3;
            state.playerHp = Math.min(state.maxHp, state.playerHp + heal);
            gainCharge(1);
            if (state.perkEffects.chipRain) gainCharge(1);
            log(`${state.enemy.name} fizzles out. +${reward} pts, +${heal} HP.`);
            state.awaitingPerk = true;
            setTimeout(spawnEnemy, 800);
            return true;
        }
        function addAction() {
            if (!state.enemy) return;
            const swings = state.perkEffects.doubleTap ? 2 : 1;
            let extra = state.activeEffects.powerSurge ? 2 : 0;
            let total = 0;
            for (let i = 0; i < swings; i++) {
                const dmg = 2 + Math.floor(Math.random() * 3) + state.attackBonus + extra;
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
                state.enemy.hp -= siphon;
                state.hype = Math.min(5, state.hype + 0.3);
                log(`Siphoned ${siphon} HP from ${state.enemy.name} (+0.3 hype).`);
                updateEnemyBar();
                if (checkEnemyDefeat()) return;
            }
            log(`Dividing chores. +${heal} HP.`);
            updateHud();
        }
        function takeTurn(fn) {
            if (!state.playing || state.busy || state.awaitingPerkChoice) return;
            state.busy = true;
            Object.values(buttons).forEach(btn => btn.disabled = true);
            fn();
            gainCharge(1);
            updateHud();
            if (checkEnemyDefeat()) {
                state.busy = false;
                Object.values(buttons).forEach(btn => btn.disabled = !state.playing);
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
            state.shield = 0;
            state.playing = true;
            state.busy = false;
            state.awaitingPerk = false;
            state.awaitingPerkChoice = false;
            state.perkEffects = {};
            state.xp = 0;
            state.xpNeeded = 100;
            state.skillPoints = 0;
            state.attackBonus = 0;
            state.shieldBonus = 0;
            state.abilityCharge = 0;
            state.activeEffects.powerSurge = false;
            state.activeEffects.bubbleWrap = false;
            state.unlockedAbilities = [];
            state.skipNextEnemyTurn = false;
            refs.perkChoiceEl.hidden = true;
            refs.perkChoiceEl.innerHTML = '';
            refs.gameOverPanel.hidden = true;
            refs.logEl.innerHTML = '';
            Object.values(buttons).forEach(btn => btn.disabled = false);
            renderAbilityList();
            updateHud();
            spawnEnemy();
            log('fresh batteries installed.');
        }

        buttons.add.addEventListener('click', () => takeTurn(addAction));
        buttons.sub.addEventListener('click', () => takeTurn(subAction));
        buttons.mul.addEventListener('click', () => takeTurn(mulAction));
        buttons.div.addEventListener('click', () => takeTurn(divAction));
        document.getElementById('restart-btn').addEventListener('click', resetGame);
        skillButtons.hp.addEventListener('click', () => spendSkill('hp'));
        skillButtons.attack.addEventListener('click', () => spendSkill('attack'));
        skillButtons.shield.addEventListener('click', () => spendSkill('shield'));

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
