// --- WEB APPLICATION STATE ---
const state = {
  // Calculator Mode: 'bill' (INR amount) or 'units' (kWh consumed)
  calcMode: 'bill',
  bill: 5000,
  units: 600,
  sunlight: 5.0,
  roof: 'shingle',

  // Configurator Options
  selectedPackage: 'premium', // starter, premium, elite
  addons: {
    battery: false,
    charger: false,
    smartpanel: false
  },

  // Active Visualizer State
  visState: 'peak-sun', // peak-sun, night-battery, grid-backup, net-metering

  // Checkout Steps
  currentStep: 1,

  // Prices Definition (in INR)
  prices: {
    packages: {
      starter: 190000, // 3 kW
      premium: 300000, // 5 kW
      elite: 580000    // 10 kW
    },
    addons: {
      battery: 220000,
      charger: 45000,
      smartpanel: 18000
    }
  }
};

// --- DOM ELEMENTS ---
const dom = {
  // Calculator
  calcToggleBill: document.getElementById('calc-toggle-bill'),
  calcToggleUnits: document.getElementById('calc-toggle-units'),
  groupBill: document.getElementById('group-bill'),
  groupUnits: document.getElementById('group-units'),
  billSlider: document.getElementById('bill-slider'),
  billDisplay: document.getElementById('bill-display'),
  unitsSlider: document.getElementById('units-slider'),
  unitsDisplay: document.getElementById('units-display'),
  sunlightSlider: document.getElementById('sunlight-slider'),
  sunlightDisplay: document.getElementById('sunlight-display'),
  roofShingle: document.getElementById('roof-shingle'),
  roofMetal: document.getElementById('roof-metal'),
  roofTile: document.getElementById('roof-tile'),
  estSize: document.getElementById('est-size'),
  estSavings: document.getElementById('est-savings'),
  estPayback: document.getElementById('est-payback'),
  estOffset: document.getElementById('est-offset'),
  calcCtaBtn: document.getElementById('calc-cta-btn'),

  // Configurator
  packStarter: document.getElementById('package-starter'),
  packPremium: document.getElementById('package-premium'),
  packElite: document.getElementById('package-elite'),
  addonBattery: document.getElementById('addon-battery'),
  addonCharger: document.getElementById('addon-charger'),
  addonSmartPanel: document.getElementById('addon-smartpanel'),
  totalSystemPrice: document.getElementById('total-system-price'),
  checkoutTriggerBtn: document.getElementById('checkout-trigger-btn'),

  // Hero status dial (Index page)
  heroDialFill: document.getElementById('hero-dial-fill'),
  heroDialVal: document.getElementById('hero-dial-val'),
  peakSunToggle: document.getElementById('peak-sun-toggle'),
  batteryToggle: document.getElementById('battery-toggle'),
  heroStatusBadge: document.getElementById('hero-status-badge'),
  heroHelperTxt: document.getElementById('hero-helper-txt'),

  // Checkout Page
  checkoutProgressBar: document.getElementById('checkout-progress-bar'),
  stepNode1: document.getElementById('step-node-1'),
  stepNode2: document.getElementById('step-node-2'),
  stepNode3: document.getElementById('step-node-3'),
  stepContent1: document.getElementById('step-content-1'),
  stepContent2: document.getElementById('step-content-2'),
  stepContent3: document.getElementById('step-content-3'),
  summaryItemsList: document.getElementById('summary-items-list'),
  summaryTotalPrice: document.getElementById('summary-total-price'),
  checkoutForm: document.getElementById('step-content-2'),
  cRoof: document.getElementById('c-roof'),

  // Checkout Confirmation Screen
  successOrderId: document.getElementById('success-order-id'),
  successSystemName: document.getElementById('success-system-name'),
  successTotalPrice: document.getElementById('success-total-price'),
  successSavings: document.getElementById('success-savings'),
  revAddonBattery: document.getElementById('rev-addon-battery'),
  revAddonCharger: document.getElementById('rev-addon-charger'),
  revAddonSmartpanel: document.getElementById('rev-addon-smartpanel'),
  summaryPackTitle: document.getElementById('summary-pack-title'),
  summaryPackDesc: document.getElementById('summary-pack-desc'),
  summaryPackPrice: document.getElementById('summary-pack-price')
};

// Helper for formatting Indian Rupees locale (INR)
function formatINR(number) {
  return '\u20B9' + Math.round(number).toLocaleString('en-IN');
}

// --- LOCALSTORAGE PORTABILITY ---
function loadPersistedState() {
  if (localStorage.getItem('ss_calcMode')) state.calcMode = localStorage.getItem('ss_calcMode');
  if (localStorage.getItem('ss_bill')) state.bill = parseInt(localStorage.getItem('ss_bill'));
  if (localStorage.getItem('ss_units')) state.units = parseInt(localStorage.getItem('ss_units'));
  if (localStorage.getItem('ss_sunlight')) state.sunlight = parseFloat(localStorage.getItem('ss_sunlight'));
  if (localStorage.getItem('ss_roof')) state.roof = localStorage.getItem('ss_roof');
  if (localStorage.getItem('ss_selectedPackage')) state.selectedPackage = localStorage.getItem('ss_selectedPackage');
  
  if (localStorage.getItem('ss_addon_battery')) state.addons.battery = localStorage.getItem('ss_addon_battery') === 'true';
  if (localStorage.getItem('ss_addon_charger')) state.addons.charger = localStorage.getItem('ss_addon_charger') === 'true';
  if (localStorage.getItem('ss_addon_smartpanel')) state.addons.smartpanel = localStorage.getItem('ss_addon_smartpanel') === 'true';

  // Bounding check to validate and reset any legacy USD state values
  if (state.bill < 1000 || state.bill > 25000) state.bill = 5000;
  if (state.units < 100 || state.units > 3000) state.units = 600;
  if (state.sunlight < 3.0 || state.sunlight > 8.0) state.sunlight = 5.0;
}

function persistState() {
  localStorage.setItem('ss_calcMode', state.calcMode);
  localStorage.setItem('ss_bill', state.bill);
  localStorage.setItem('ss_units', state.units);
  localStorage.setItem('ss_sunlight', state.sunlight);
  localStorage.setItem('ss_roof', state.roof);
  localStorage.setItem('ss_selectedPackage', state.selectedPackage);
  localStorage.setItem('ss_addon_battery', state.addons.battery);
  localStorage.setItem('ss_addon_charger', state.addons.charger);
  localStorage.setItem('ss_addon_smartpanel', state.addons.smartpanel);
}

// --- INITIALIZE & EVENT LISTENERS ---
window.addEventListener('DOMContentLoaded', () => {
  // Load prior selections
  loadPersistedState();

  // 1. Savings Calculator Listeners (only if on calculator.html)
  if (dom.billSlider) {
    dom.billSlider.value = state.bill;
    dom.billDisplay.textContent = formatINR(state.bill);
    dom.billSlider.addEventListener('input', (e) => {
      state.bill = parseInt(e.target.value);
      dom.billDisplay.textContent = formatINR(state.bill);
      persistState();
      calculateSolar();
    });
  }

  if (dom.unitsSlider) {
    dom.unitsSlider.value = state.units;
    dom.unitsDisplay.textContent = `${state.units} kWh`;
    dom.unitsSlider.addEventListener('input', (e) => {
      state.units = parseInt(e.target.value);
      dom.unitsDisplay.textContent = `${state.units} kWh`;
      persistState();
      calculateSolar();
    });
  }

  if (dom.sunlightSlider) {
    dom.sunlightSlider.value = state.sunlight;
    dom.sunlightDisplay.textContent = `${state.sunlight.toFixed(1)} Hrs`;
    dom.sunlightSlider.addEventListener('input', (e) => {
      state.sunlight = parseFloat(e.target.value);
      dom.sunlightDisplay.textContent = `${state.sunlight.toFixed(1)} Hrs`;
      persistState();
      calculateSolar();
    });
  }

  // Roof radio selectors
  const roofCards = [
    { element: dom.roofShingle, val: 'shingle' },
    { element: dom.roofMetal, val: 'metal' },
    { element: dom.roofTile, val: 'tile' }
  ];

  roofCards.forEach(card => {
    if (card.element) {
      if (state.roof === card.val) {
        roofCards.forEach(c => c.element && c.element.classList.remove('active'));
        card.element.classList.add('active');
      }
      card.element.addEventListener('click', () => {
        roofCards.forEach(c => c.element && c.element.classList.remove('active'));
        card.element.classList.add('active');
        state.roof = card.val;
        persistState();
        calculateSolar();
      });
    }
  });

  // Switch initial layout of mode switchers in calculator
  if (dom.calcToggleBill && dom.calcToggleUnits) {
    if (state.calcMode === 'bill') {
      dom.calcToggleBill.classList.add('active');
      dom.calcToggleUnits.classList.remove('active');
      dom.groupBill.style.display = 'block';
      dom.groupUnits.style.display = 'none';
    } else {
      dom.calcToggleBill.classList.remove('active');
      dom.calcToggleUnits.classList.add('active');
      dom.groupBill.style.display = 'none';
      dom.groupUnits.style.display = 'block';
    }
  }

  if (dom.calcCtaBtn) {
    dom.calcCtaBtn.addEventListener('click', () => {
      // Auto-choose package based on recommended system size
      const currentSize = parseFloat(dom.estSize.textContent);
      if (currentSize <= 4.0) {
        state.selectedPackage = 'starter';
      } else if (currentSize <= 7.5) {
        state.selectedPackage = 'premium';
      } else {
        state.selectedPackage = 'elite';
      }
      persistState();
      
      // Navigate to configurator page
      window.location.href = 'configurator.html?v=2.0';
    });
  }

  // 2. Hero Toggles (only if on index.html)
  if (dom.peakSunToggle) {
    dom.peakSunToggle.addEventListener('change', updateHeroDial);
  }
  if (dom.batteryToggle) {
    dom.batteryToggle.addEventListener('change', updateHeroDial);
  }

  // 3. Configurator Checkout Redirect (only if on configurator.html)
  if (dom.checkoutTriggerBtn) {
    dom.checkoutTriggerBtn.addEventListener('click', () => {
      window.location.href = 'checkout.html?v=2.0';
    });
  }

  // 4. FAQ Accordions (only if on faq.html)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 5. Checkout Submit Listener (only if on checkout.html)
  if (dom.checkoutForm) {
    dom.checkoutForm.addEventListener('submit', submitCheckout);
    if (dom.cRoof) dom.cRoof.value = state.roof;
    buildOrderSummary();
    nextStep(1); // Start checkout at step 1
  }

  // Initial runs
  if (dom.estSize) calculateSolar();
  if (dom.heroDialVal) updateHeroDial();
  if (dom.packStarter) selectPackage(state.selectedPackage);
  if (dom.totalSystemPrice) updatePriceDisplay();
  if (document.querySelector('.vis-flow-svg')) setVisState(state.visState);
});

// --- CALCULATOR CALCULATION MODE SWITCHER ---
function switchCalcMode(mode) {
  state.calcMode = mode;
  persistState();
  
  if (dom.calcToggleBill && dom.calcToggleUnits && dom.groupBill && dom.groupUnits) {
    if (mode === 'bill') {
      dom.calcToggleBill.classList.add('active');
      dom.calcToggleUnits.classList.remove('active');
      dom.groupBill.style.display = 'block';
      dom.groupUnits.style.display = 'none';

      // Sync bill based on units
      state.bill = Math.round(state.units * 8);
      state.bill = Math.max(1000, Math.min(25000, state.bill));
      persistState();
      if (dom.billSlider) dom.billSlider.value = state.bill;
      if (dom.billDisplay) dom.billDisplay.textContent = formatINR(state.bill);
    } else {
      dom.calcToggleBill.classList.remove('active');
      dom.calcToggleUnits.classList.add('active');
      dom.groupBill.style.display = 'none';
      dom.groupUnits.style.display = 'block';

      // Sync units based on bill amount
      state.units = Math.round(state.bill / 8);
      state.units = Math.max(100, Math.min(3000, state.units));
      persistState();
      if (dom.unitsSlider) dom.unitsSlider.value = state.units;
      if (dom.unitsDisplay) dom.unitsDisplay.textContent = `${state.units} kWh`;
    }
  }

  calculateSolar();
}

// --- SOLAR CALCULATOR MATH (INR BASED) ---
function calculateSolar() {
  // 1. Calculate recommended solar system size in kW
  const monthlyUnits = state.calcMode === 'bill' ? (state.bill / 8) : state.units;
  let capacity = (monthlyUnits / 166.6) * (5 / state.sunlight);
  
  // Roof factors
  if (state.roof === 'metal') capacity *= 0.95;
  if (state.roof === 'tile') capacity *= 1.05;
  
  capacity = Math.max(1.0, Math.min(15.0, capacity));
  
  // 2. Calculate savings
  let sunlightOffset = 1.0 + (state.sunlight - 5.0) * 0.08;
  const monthlyCost = state.calcMode === 'bill' ? state.bill : state.units * 8;
  let annualSavings = monthlyCost * 12 * 0.90 * Math.min(1.2, Math.max(0.7, sunlightOffset));
  
  // 3. Payback Period
  // Average setup cost: based on user rates
  // 3kW upfront ₹1,90,000 => ₹63,333/kW.
  // 5kW upfront ₹3,00,000 => ₹60,000/kW.
  // Let's use ₹60,000 per kW as the standard cost index for cost estimations.
  const costPerKw = 60000;
  const grossCost = capacity * costPerKw;
  const subsidy = Math.min(78000, capacity >= 3.0 ? 78000 : (capacity >= 2.0 ? 60000 : 30000));
  const netCost = grossCost - subsidy;
  let payback = netCost / annualSavings;
  payback = Math.max(3.0, Math.min(9.0, payback));
  
  // 4. Carbon offset
  const carbonOffset = capacity * 0.78;
  const treesEquivalent = Math.round(carbonOffset * 25.6);
  
  // Render results
  if (dom.estSize) dom.estSize.textContent = `${capacity.toFixed(1)} kW`;
  if (dom.estSavings) dom.estSavings.textContent = formatINR(annualSavings);
  if (dom.estPayback) dom.estPayback.textContent = `${payback.toFixed(1)} Yrs`;
  if (dom.estOffset) dom.estOffset.textContent = `${carbonOffset.toFixed(1)} Tons`;
  
  const numPanels = Math.round(capacity * 1000 / 400);
  const sizeSubText = dom.estSize.nextElementSibling;
  if (sizeSubText) sizeSubText.textContent = `approx. ${numPanels} Premium Panels`;
  
  const savingsSubText = dom.estSavings.nextElementSibling;
  if (savingsSubText) {
    const totalSavingsVal = annualSavings * 25;
    const lakhsFormatted = (totalSavingsVal / 100000).toFixed(1);
    savingsSubText.textContent = `over 25 years: ${formatINR(totalSavingsVal)} (${lakhsFormatted} Lakhs)`;
  }
  
  const offsetSubText = dom.estOffset.nextElementSibling;
  if (offsetSubText) offsetSubText.textContent = `equivalent to ${treesEquivalent} trees planted / yr`;
}

// --- DYNAMIC HERO DIAL SIMULATOR ---
function updateHeroDial() {
  const isPeak = dom.peakSunToggle ? dom.peakSunToggle.checked : true;
  const isBat = dom.batteryToggle ? dom.batteryToggle.checked : true;
  
  let output = 0;
  let labelTxt = "";
  let badgeColor = "#10b981";
  let badgeText = "Active";
  
  if (isPeak) {
    output = isBat ? 7.6 : 5.8;
    labelTxt = isBat ? "Array + Battery Charge" : "Solar Peak Output";
  } else {
    output = isBat ? 3.2 : 0.0;
    labelTxt = isBat ? "Battery Discharge" : "System Off / Grid Only";
    if (!isBat) {
      badgeColor = "#ef4444";
      badgeText = "Standby";
    }
  }

  const pct = Math.min(10, output) / 10;
  const offset = 440 - (440 * pct);
  
  if (dom.heroDialFill) {
    dom.heroDialFill.style.strokeDashoffset = offset;
    dom.heroDialFill.style.stroke = isPeak ? "url(#emerald-grad)" : (isBat ? "#10b981" : "rgba(255,255,255,0.1)");
  }
  
  if (dom.heroDialVal) dom.heroDialVal.textContent = output.toFixed(1);
  if (dom.heroStatusBadge) {
    dom.heroStatusBadge.textContent = badgeText;
    dom.heroStatusBadge.style.backgroundColor = badgeColor + "20";
    dom.heroStatusBadge.style.color = badgeColor;
  }
  
  if (dom.heroHelperTxt) {
    if (isPeak && isBat) {
      dom.heroHelperTxt.textContent = "Peak sunlight. Generating maximum power and charging battery storage.";
    } else if (isPeak && !isBat) {
      dom.heroHelperTxt.textContent = "Peak sunlight. Supplying immediate home load. Extra flows back to grid.";
    } else if (!isPeak && isBat) {
      dom.heroHelperTxt.textContent = "Night simulation. House is powered purely by stored SphereCell energy.";
    } else {
      dom.heroHelperTxt.textContent = "No solar generation and battery disengaged. Running fully on grid power.";
    }
  }
}

// --- CONFIGURATOR CONTROLLER ---
function selectPackage(tier) {
  state.selectedPackage = tier;
  persistState();
  
  // UI Toggles
  const cards = [
    { el: dom.packStarter, key: 'starter' },
    { el: dom.packPremium, key: 'premium' },
    { el: dom.packElite, key: 'elite' }
  ];
  
  cards.forEach(card => {
    if (card.el) {
      if (card.key === tier) {
        card.el.classList.add('popular');
        const btn = card.el.querySelector('.btn-card');
        if (btn) {
          btn.className = "btn btn-primary btn-card";
          btn.textContent = "Selected";
        }
      } else {
        card.el.classList.remove('popular');
        const btn = card.el.querySelector('.btn-card');
        if (btn) {
          btn.className = "btn btn-secondary btn-card";
          btn.textContent = "Select Package";
        }
      }
    }
  });

  updatePriceDisplay();
}

function toggleAddon(addonKey) {
  state.addons[addonKey] = !state.addons[addonKey];
  persistState();
  
  const addonCards = {
    battery: dom.addonBattery,
    charger: dom.addonCharger,
    smartpanel: dom.addonSmartPanel
  };

  const card = addonCards[addonKey];
  if (card) {
    if (state.addons[addonKey]) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  }

  updatePriceDisplay();
}

function updatePriceDisplay() {
  const basePrice = state.prices.packages[state.selectedPackage];
  let addonPrice = 0;
  
  Object.keys(state.addons).forEach(key => {
    if (state.addons[key]) {
      addonPrice += state.prices.addons[key];
    }
  });
  
  const total = basePrice + addonPrice;
  const formattedPrice = formatINR(total);
  
  if (dom.totalSystemPrice) dom.totalSystemPrice.textContent = formattedPrice;

  // Update sticky summary bar details
  const stickyPackName = document.getElementById('sticky-package-name');
  const stickySubsidySaving = document.getElementById('sticky-subsidy-saving');
  if (stickyPackName) {
    const packNames = {
      starter: 'Sphere Starter (3 kW)',
      premium: 'Sphere Premium (5 kW)',
      elite: 'Sphere Elite Off-Grid (10 kW)'
    };
    stickyPackName.textContent = packNames[state.selectedPackage] || state.selectedPackage;
  }
  if (stickySubsidySaving) {
    const packCapacities = {
      starter: 3.0,
      premium: 5.0,
      elite: 10.0
    };
    const cap = packCapacities[state.selectedPackage] || 3.0;
    const sub = Math.min(78000, cap >= 3.0 ? 78000 : (cap >= 2.0 ? 60000 : 30000));
    stickySubsidySaving.textContent = formatINR(sub);
  }
}

// --- SVG ENERGY VISUALIZER STATE MACHINE ---
function setVisState(visKey) {
  state.visState = visKey;
  persistState();
  
  const buttons = document.querySelectorAll('.vis-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(visKey.replace('-', ' ').split(' ')[0])) {
      btn.classList.add('active');
    }
  });

  const flows = {
    sunPanels: document.getElementById('flow-sun-panels'),
    panelsInverter: document.getElementById('flow-panels-inverter'),
    inverterHouse: document.getElementById('flow-inverter-house'),
    inverterBattery: document.getElementById('flow-inverter-battery'),
    batteryInverter: document.getElementById('flow-battery-inverter'),
    gridHouse: document.getElementById('flow-grid-house'),
    houseGrid: document.getElementById('flow-house-grid')
  };

  const invStatusLed = document.getElementById('inv-status-led');
  const batCells = [
    document.getElementById('bat-cell-1'),
    document.getElementById('bat-cell-2'),
    document.getElementById('bat-cell-3')
  ];

  Object.values(flows).forEach(flow => {
    if (flow) flow.style.display = 'none';
  });

  if (invStatusLed) invStatusLed.setAttribute('fill', '#10b981');

  switch(visKey) {
    case 'peak-sun':
      if (flows.sunPanels) flows.sunPanels.style.display = 'block';
      if (flows.panelsInverter) flows.panelsInverter.style.display = 'block';
      if (flows.inverterHouse) flows.inverterHouse.style.display = 'block';
      if (flows.inverterBattery) flows.inverterBattery.style.display = 'block';
      
      batCells.forEach((cell, idx) => {
        if (cell) {
          cell.style.animation = `pulse 1.5s infinite ease-in-out ${idx * 0.3}s`;
          cell.setAttribute('fill', '#10b981');
        }
      });
      break;

    case 'night-battery':
      if (flows.batteryInverter) flows.batteryInverter.style.display = 'block';
      if (flows.inverterHouse) flows.inverterHouse.style.display = 'block';
      
      batCells.forEach((cell, idx) => {
        if (cell) {
          cell.style.animation = 'none';
          cell.setAttribute('fill', '#10b981');
        }
      });
      if (batCells[2]) batCells[2].setAttribute('fill', '#1e293b');
      break;

    case 'grid-backup':
      if (flows.gridHouse) flows.gridHouse.style.display = 'block';
      if (invStatusLed) invStatusLed.setAttribute('fill', '#f59e0b');
      
      batCells.forEach(cell => {
        if (cell) {
          cell.style.animation = 'none';
          cell.setAttribute('fill', '#1e293b');
        }
      });
      break;

    case 'net-metering':
      if (flows.sunPanels) flows.sunPanels.style.display = 'block';
      if (flows.panelsInverter) flows.panelsInverter.style.display = 'block';
      if (flows.inverterHouse) flows.inverterHouse.style.display = 'block';
      if (flows.houseGrid) flows.houseGrid.style.display = 'block';
      
      batCells.forEach(cell => {
        if (cell) {
          cell.style.animation = 'none';
          cell.setAttribute('fill', '#10b981');
        }
      });
      break;
  }
}

// Inject Keyframe CSS for pulses dynamically
const styleNode = document.createElement('style');
styleNode.textContent = `
  @keyframes pulse {
    0% { opacity: 0.3; }
    50% { opacity: 1; }
    100% { opacity: 0.3; }
  }
`;
document.head.appendChild(styleNode);

// --- CHECKOUT WIZARD PROCESSORS ---
function buildOrderSummary() {
  if (!dom.summaryItemsList) return;
  
  dom.summaryItemsList.innerHTML = '';
  
  const basePrice = state.prices.packages[state.selectedPackage];
  const packNames = {
    starter: 'Sphere Starter (3 kW)',
    premium: 'Sphere Premium (5 kW)',
    elite: 'Sphere Elite Off-Grid (10 kW)'
  };
  const packDescs = {
    starter: '8 high-output panels, hybrid inverter',
    premium: '12 monocrystalline panels, smart inverter',
    elite: '25 premium panels, dual smart hybrid inverters'
  };

  if (dom.summaryPackTitle) dom.summaryPackTitle.textContent = packNames[state.selectedPackage];
  if (dom.summaryPackDesc) dom.summaryPackDesc.textContent = packDescs[state.selectedPackage];
  if (dom.summaryPackPrice) dom.summaryPackPrice.textContent = formatINR(basePrice);

  const item1 = document.createElement('div');
  item1.className = 'summary-item';
  item1.innerHTML = `
    <span class="item-name">${packNames[state.selectedPackage]}</span>
    <span class="item-val">${formatINR(basePrice)}</span>
  `;
  dom.summaryItemsList.appendChild(item1);

  const addonNames = {
    battery: 'SphereCell Battery (10kWh)',
    charger: 'EV Smart Charger',
    smartpanel: 'Smart Energy Hub'
  };

  if (dom.revAddonBattery) dom.revAddonBattery.style.display = state.addons.battery ? 'flex' : 'none';
  if (dom.revAddonCharger) dom.revAddonCharger.style.display = state.addons.charger ? 'flex' : 'none';
  if (dom.revAddonSmartpanel) dom.revAddonSmartpanel.style.display = state.addons.smartpanel ? 'flex' : 'none';

  Object.keys(state.addons).forEach(key => {
    if (state.addons[key]) {
      const addPrice = state.prices.addons[key];
      const item = document.createElement('div');
      item.className = 'summary-item';
      item.innerHTML = `
        <span class="item-name">+ ${addonNames[key]}</span>
        <span class="item-val">+${formatINR(addPrice)}</span>
      `;
      dom.summaryItemsList.appendChild(item);
    }
  });

  // Calculate PM Surya Ghar Subsidy
  const monthlyUnits = state.calcMode === 'bill' ? (state.bill / 8) : state.units;
  const capacity = (monthlyUnits / 166.6) * (5 / state.sunlight);
  const subsidy = Math.min(78000, capacity >= 3.0 ? 78000 : (capacity >= 2.0 ? 60000 : 30000));
  
  const itemITC = document.createElement('div');
  itemITC.className = 'summary-item';
  itemITC.style.color = '#10b981';
  itemITC.innerHTML = `
    <span class="item-name">Est. PM Surya Ghar Subsidy</span>
    <span class="item-val">-${formatINR(subsidy)}</span>
  `;
  dom.summaryItemsList.appendChild(itemITC);

  let total = basePrice;
  Object.keys(state.addons).forEach(key => {
    if (state.addons[key]) total += state.prices.addons[key];
  });

  if (dom.summaryTotalPrice) dom.summaryTotalPrice.textContent = formatINR(total);
}

function nextStep(stepNum) {
  state.currentStep = stepNum;

  const nodes = [dom.stepNode1, dom.stepNode2, dom.stepNode3];
  nodes.forEach((node, idx) => {
    if (node) {
      node.classList.remove('active', 'completed');
      if (idx + 1 < stepNum) {
        node.classList.add('completed');
      } else if (idx + 1 === stepNum) {
        node.classList.add('active');
      }
    }
  });

  if (dom.checkoutProgressBar) {
    const pct = ((stepNum - 1) / 2) * 100;
    dom.checkoutProgressBar.style.width = `${pct}%`;
  }

  const contents = [dom.stepContent1, dom.stepContent2, dom.stepContent3];
  contents.forEach((content, idx) => {
    if (content) {
      if (idx + 1 === stepNum) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    }
  });
}

function submitCheckout(event) {
  event.preventDefault();
  
  const basePrice = state.prices.packages[state.selectedPackage];
  let addonPrice = 0;
  Object.keys(state.addons).forEach(key => {
    if (state.addons[key]) addonPrice += state.prices.addons[key];
  });
  const total = basePrice + addonPrice;

  const randomOrderId = `#SP-${Math.floor(10000 + Math.random() * 90000)}`;
  const systemNames = {
    starter: 'Sphere Starter (3 kW)',
    premium: 'Sphere Premium (5 kW)',
    elite: 'Sphere Elite Off-Grid (10 kW)'
  };

  if (dom.successOrderId) dom.successOrderId.textContent = randomOrderId;
  if (dom.successSystemName) dom.successSystemName.textContent = systemNames[state.selectedPackage];
  if (dom.successTotalPrice) dom.successTotalPrice.textContent = formatINR(total);
  
  const monthlyUnits = state.calcMode === 'bill' ? (state.bill / 8) : state.units;
  const estAnnualSavings = monthlyUnits * 8 * 12 * 0.90 * Math.min(1.2, Math.max(0.7, 1.0 + (state.sunlight - 5.0) * 0.08));
  if (dom.successSavings) dom.successSavings.textContent = `${formatINR(estAnnualSavings)} / Yr`;

  // Advance to step 3
  nextStep(3);
}
