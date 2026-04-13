/**
 * ============================================================================
 * Little Leaps — Milestone Screener Interactive Logic
 * by WellCare & Nurture Pediatric Therapy
 * 
 * ARCHITECTURE:
 *   - SliderManager: age slider with snap-to-nearest
 *   - FlowManager: guides user through disciplines one at a time
 *   - ChecklistManager: renders milestone checkboxes
 *   - ResultsManager: computes scores, screening recs, data pass-through
 *   - Celebrations: confetti and sparkle effects
 *   - ViewManager: handles view transitions
 * 
 * FLOW: Age Select → Speech → Movement → Thinking → Social → Results
 * ============================================================================
 */

(function () {
  'use strict';

  const DATA = window.LITTLE_LEAPS_DATA;
  const SCREENING_URL = window.SCREENING_URL;
  if (!DATA) { console.error('Little Leaps: No data found.'); return; }

  // ── Constants ──
  const DISCIPLINES = ['speech', 'physical', 'cognitive', 'social'];
  const DISC_COLORS = {
    speech: '#5eb6d9', physical: '#e8735a', cognitive: '#9b6fcf', social: '#e8b84d'
  };
  const DISC_NEXT_LABELS = {
    0: 'Next: Movement 🏃 →',
    1: 'Next: Thinking 🧩 →',
    2: 'Next: Social 💛 →',
    3: 'See My Results 🎉'
  };

  // ── State ──
  let currentAgeId = null;
  let currentStep = 0; // 0=speech, 1=physical, 2=cognitive, 3=social
  let checkedMilestones = {};

  // ── Age slider snap logic ──
  const AGE_STOPS = [2, 4, 6, 9, 12, 15, 18, 24, 36, 48, 60];
  const AGE_ID_MAP = {
    2: '2-months', 4: '4-months', 6: '6-months', 9: '9-months',
    12: '12-months', 15: '15-months', 18: '18-months', 24: '2-years',
    36: '3-years', 48: '4-years', 60: '5-years'
  };

  function findNearestAgeStop(months) {
    let nearest = AGE_STOPS[0];
    let minDiff = Math.abs(months - nearest);
    for (let i = 1; i < AGE_STOPS.length; i++) {
      const diff = Math.abs(months - AGE_STOPS[i]);
      if (diff < minDiff) { minDiff = diff; nearest = AGE_STOPS[i]; }
    }
    return nearest;
  }

  function formatAge(months) {
    if (months < 12) return months + ' Month' + (months !== 1 ? 's' : '');
    if (months === 12) return '1 Year';
    if (months < 24) return months + ' Months';
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    if (remaining === 0) return years + ' Year' + (years !== 1 ? 's' : '');
    return years + 'yr ' + remaining + 'mo';
  }

  // =========================================================================
  // VIEW MANAGER
  // =========================================================================
  const ViewManager = {
    show(viewId) {
      document.querySelectorAll('.ll-view').forEach(v => v.classList.remove('active'));
      const view = document.getElementById(viewId);
      if (view) {
        requestAnimationFrame(() => view.classList.add('active'));
        const app = document.getElementById('little-leaps-app');
        if (app) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // =========================================================================
  // SLIDER MANAGER
  // =========================================================================
  // Slider index → month mapping (0-24 = months 0-24, then jumps)
  const SLIDER_MAP = [];
  for (let i = 0; i <= 24; i++) SLIDER_MAP.push(i);
  SLIDER_MAP.push(36, 48, 60); // indices 25, 26, 27

  // Label indices (which slider positions have labels)
  const LABEL_INDICES = [2, 6, 12, 18, 24, 25, 27];

  const SliderManager = {
    slider: null,
    tooltip: null,
    selectedAgeId: null,

    init() {
      this.slider = document.getElementById('ll-age-slider');
      this.tooltip = document.getElementById('ll-slider-tooltip');
      if (!this.slider || !this.tooltip) return;
      this.update();
      this.slider.addEventListener('input', () => this.update());
    },

    update() {
      const index = parseInt(this.slider.value);
      const months = SLIDER_MAP[index] || 0;
      const nearestStop = findNearestAgeStop(months);
      const ageData = DATA.ageRanges.find(a => a.id === AGE_ID_MAP[nearestStop]);

      // Tooltip shows exact month or CDC label
      if (months === nearestStop && ageData) {
        this.tooltip.textContent = ageData.label;
      } else {
        this.tooltip.textContent = formatAge(months);
      }

      // Position tooltip to follow thumb
      const pct = index / 27;
      const sliderWidth = this.slider.offsetWidth;
      const thumbOffset = 15;
      this.tooltip.style.left = (thumbOffset + pct * (sliderWidth - 2 * thumbOffset)) + 'px';

      this.selectedAgeId = AGE_ID_MAP[nearestStop];
    },

    getSelectedAgeId() { return this.selectedAgeId; }
  };

  // =========================================================================
  // FLOW MANAGER — guides through disciplines one at a time
  // =========================================================================
  const FlowManager = {
    start(ageId) {
      currentAgeId = ageId;
      currentStep = 0;
      checkedMilestones = {};
      this.renderStep();
      ViewManager.show('ll-checklist');
    },

    renderStep() {
      const discipline = DISCIPLINES[currentStep];
      const discInfo = DATA.disciplines[discipline];
      const ageData = DATA.ageRanges.find(a => a.id === currentAgeId);
      if (!ageData || !discInfo) return;

      // Update step bar
      document.querySelectorAll('.ll-step').forEach((step, i) => {
        step.classList.remove('active', 'completed');
        step.style.setProperty('--step-color', DISC_COLORS[DISCIPLINES[i]]);
        if (i === currentStep) step.classList.add('active');
        else if (i < currentStep) step.classList.add('completed');
      });

      // Update step lines
      document.querySelectorAll('.ll-step-line').forEach((line, i) => {
        line.classList.toggle('completed', i < currentStep);
      });

      // Update header
      const titleEl = document.getElementById('ll-discipline-title');
      if (titleEl) titleEl.textContent = discInfo.icon + ' ' + discInfo.label;

      const subtitleEl = document.getElementById('ll-discipline-subtitle');
      if (subtitleEl) {
        subtitleEl.textContent = 'Step ' + (currentStep + 1) + ' of 4 • ' + ageData.label;
      }

      // Render milestones for this discipline
      ChecklistManager.render(discipline);

      // Update Next button
      const nextBtn = document.getElementById('ll-next-btn');
      if (nextBtn) {
        nextBtn.textContent = DISC_NEXT_LABELS[currentStep];
        nextBtn.style.background = '';
      }
    },

    nextStep() {
      if (currentStep < 3) {
        currentStep++;
        this.renderStep();
        // Scroll to top of checklist
        const app = document.getElementById('little-leaps-app');
        if (app) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // All done — show results
        const results = ResultsManager.computeResults();
        ResultsManager.show(results);
      }
    },

    prevStep() {
      if (currentStep > 0) {
        currentStep--;
        this.renderStep();
      } else {
        // Go back to age selection
        ViewManager.show('ll-welcome');
      }
    }
  };

  // =========================================================================
  // CHECKLIST MANAGER
  // =========================================================================
  const ChecklistManager = {
    render(discipline) {
      const listEl = document.getElementById('ll-milestones-list');
      if (!listEl) return;

      const ageData = DATA.ageRanges.find(a => a.id === currentAgeId);
      if (!ageData) return;

      const milestones = ageData.milestones[discipline] || [];
      const discColor = DISC_COLORS[discipline] || '#5eb6d9';

      listEl.innerHTML = milestones.map(m => {
        const isChecked = checkedMilestones[m.id] ? ' checked' : '';
        return '<div class="ll-milestone-item' + isChecked + '" data-id="' + m.id + '" style="--disc-color: ' + discColor + ';">' +
          '<div class="ll-checkbox"><span class="ll-checkbox-mark">✓</span></div>' +
          '<span class="ll-milestone-text">' + m.text + '</span>' +
          '</div>';
      }).join('');

      listEl.querySelectorAll('.ll-milestone-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          checkedMilestones[id] = !checkedMilestones[id];
          item.classList.toggle('checked', checkedMilestones[id]);
          if (checkedMilestones[id]) {
            Celebrations.sparkle(item.querySelector('.ll-checkbox'));
          }
        });
      });
    }
  };

  // =========================================================================
  // RESULTS MANAGER — scoring, recommendations, data pass-through
  // =========================================================================
  const ResultsManager = {
    computeResults() {
      const ageData = DATA.ageRanges.find(a => a.id === currentAgeId);
      if (!ageData) return null;

      let total = 0, checked = 0;
      const perDiscipline = {};

      DISCIPLINES.forEach(disc => {
        const items = ageData.milestones[disc] || [];
        const discChecked = items.filter(m => checkedMilestones[m.id]).length;
        perDiscipline[disc] = { total: items.length, checked: discChecked };
        total += items.length;
        checked += discChecked;
      });

      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

      let tier;
      if (pct >= DATA.scoring.soaring.min) tier = DATA.scoring.soaring;
      else if (pct >= DATA.scoring.growing.min) tier = DATA.scoring.growing;
      else tier = DATA.scoring.blooming;

      return { total, checked, pct, tier, perDiscipline, ageId: currentAgeId, ageLabel: ageData.label };
    },

    /** Build a human-readable summary for clipboard */
    buildClipboardSummary(results) {
      const discLabels = { speech: 'Speech & Language', physical: 'Movement & Motor', cognitive: 'Thinking & Learning', social: 'Social & Emotional' };
      let summary = '--- Little Leaps Milestone Results ---\n';
      summary += 'Age Range: ' + results.ageLabel + '\n';
      summary += 'Overall Score: ' + results.pct + '%\n\n';
      DISCIPLINES.forEach(disc => {
        const d = results.perDiscipline[disc];
        const pct = d.total > 0 ? Math.round((d.checked / d.total) * 100) : 0;
        summary += (discLabels[disc] || disc) + ': ' + pct + '% (' + d.checked + '/' + d.total + ')\n';
      });
      summary += '\nSource: Little Leaps by WellCare & Nurture';
      return summary;
    },

    /** Copy text to clipboard with fallback for non-HTTPS */
    copyToClipboard(text) {
      // Fallback copy using a hidden textarea (works everywhere)
      function fallbackCopy(t) {
        try {
          var ta = document.createElement('textarea');
          ta.value = t;
          ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          return ok;
        } catch (e) {
          return false;
        }
      }

      // Try modern API first, fallback to textarea
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function() { return true; }).catch(function() { return fallbackCopy(text); });
      }
      return Promise.resolve(fallbackCopy(text));
    },

    /** Show toast notification */
    showToast(message) {
      var toast = document.createElement('div');
      toast.className = 'll-clipboard-toast';
      toast.innerHTML = message;
      document.body.appendChild(toast);
      // Force reflow then animate in
      void toast.offsetHeight;
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 400);
      }, 4000);
    },

    /** Copy results to clipboard, show toast, then open Weave form */
    copyAndOpenScreening(results) {
      var summary = this.buildClipboardSummary(results);
      var url = SCREENING_URL || '#';
      var self = this;

      this.copyToClipboard(summary).then(function(ok) {
        if (ok) {
          self.showToast('✅ <strong>Results copied!</strong> Paste them into the Notes field on the next page.');
        } else {
          self.showToast('📋 Opening screening form — you can manually share your results with us.');
        }
        // Open Weave form after a brief delay so toast is visible
        setTimeout(function() { window.open(url, '_blank', 'noopener'); }, 800);
      }).catch(function() {
        // If everything fails, still open the form
        window.open(url, '_blank', 'noopener');
      });
    },

    show(results) {
      if (!results) return;

      const DONUT_R = 33; // radius for mini donuts
      const DONUT_C = 2 * Math.PI * DONUT_R; // circumference

      // Header
      const emojiEl = document.getElementById('ll-results-emoji');
      const labelEl = document.getElementById('ll-results-label');
      const subtitleEl = document.getElementById('ll-results-subtitle');

      if (emojiEl) emojiEl.textContent = results.tier.emoji;
      if (labelEl) { labelEl.textContent = results.tier.label; labelEl.style.color = results.tier.color; }
      if (subtitleEl) subtitleEl.textContent = results.checked + ' of ' + results.total + ' milestones checked';

      // Screening recommendation (compact)
      const recEl = document.getElementById('ll-screening-rec');
      if (recEl) {
        if (results.pct < 50) {
          recEl.className = 'll-screening-rec strongly-recommend';
          recEl.innerHTML = '<p class="ll-screening-rec-title">🌻 We Recommend a Free Screening</p>' +
            '<p class="ll-screening-rec-text">Early support can make a big difference. Our free screening is friendly and no-pressure!</p>';
        } else if (results.pct < 80) {
          recEl.className = 'll-screening-rec recommend';
          recEl.innerHTML = '<p class="ll-screening-rec-title">🌱 A Free Check-In Could Be Helpful</p>' +
            '<p class="ll-screening-rec-text">Some milestones are still on their way — a quick check-in can help!</p>';
        } else {
          recEl.className = 'll-screening-rec no-concern';
          recEl.innerHTML = '<p class="ll-screening-rec-title">🌟 Looking Great!</p>' +
            '<p class="ll-screening-rec-text">No screening needed right now — but we\'re always here for you.</p>';
        }
      }

      // 2×2 Mini Donut Grid
      const gridEl = document.getElementById('ll-donut-grid');
      if (gridEl) {
        gridEl.innerHTML = DISCIPLINES.map(disc => {
          const d = results.perDiscipline[disc];
          const info = DATA.disciplines[disc];
          const pct = d.total > 0 ? Math.round((d.checked / d.total) * 100) : 0;
          const offset = DONUT_C * (1 - pct / 100);

          return '<div class="ll-donut-item">' +
            '<div class="ll-donut-svg-wrap">' +
              '<svg class="ll-donut-svg" viewBox="0 0 80 80">' +
                '<circle class="ll-donut-bg" cx="40" cy="40" r="' + DONUT_R + '"/>' +
                '<circle class="ll-donut-fill" cx="40" cy="40" r="' + DONUT_R + '" ' +
                  'stroke="' + info.color + '" ' +
                  'stroke-dasharray="' + DONUT_C + '" ' +
                  'stroke-dashoffset="' + DONUT_C + '" ' +
                  'data-target-offset="' + offset + '"/>' +
              '</svg>' +
              '<span class="ll-donut-pct" data-target="' + pct + '">0%</span>' +
            '</div>' +
            '<span class="ll-donut-label"><span class="ll-donut-emoji">' + info.icon + '</span> ' + info.shortLabel + '</span>' +
          '</div>';
        }).join('');

        // Animate the donut fills and count up percentages after pop-in
        setTimeout(() => {
          gridEl.querySelectorAll('.ll-donut-fill').forEach(circle => {
            circle.style.strokeDashoffset = circle.dataset.targetOffset;
          });
          gridEl.querySelectorAll('.ll-donut-pct').forEach(el => {
            const target = parseInt(el.dataset.target);
            this.countUp(el, 0, target, 800);
          });
        }, 600);
      }

      // Action buttons
      const actionsEl = document.getElementById('ll-results-actions');
      if (actionsEl) {
        let html = '';

        // Activity Ideas button (only if there are unchecked milestones with activities)
        const hasUnchecked = results.pct < 100;
        if (hasUnchecked) {
          html += '<button class="ll-btn-primary" id="ll-activity-ideas">🌱 Activity Ideas</button>';
        }

        // Screening CTA (copies results to clipboard, then opens Weave)
        if (results.pct < 80) {
          html += '<button class="ll-btn-primary ll-btn-screening" id="ll-screening-cta">' +
            '📋 Schedule Your Free Screening' +
            '<span class="ll-btn-subtext">Results copied to clipboard</span></button>';
        } else {
          html += '<button class="ll-btn-secondary" id="ll-screening-cta">' +
            '📋 Schedule a Free Screening Anyway</button>';
        }
        html += '<button class="ll-btn-secondary" id="ll-start-over">🔄 Start Over</button>';
        actionsEl.innerHTML = html;

        // Activity Ideas click handler
        document.getElementById('ll-activity-ideas')?.addEventListener('click', () => {
          ActivitiesView.render(results);
        });

        // Screening click handler — copy results to clipboard, then open Weave
        document.getElementById('ll-screening-cta')?.addEventListener('click', () => {
          ResultsManager.copyAndOpenScreening(results);
        });

        document.getElementById('ll-start-over')?.addEventListener('click', () => {
          currentAgeId = null;
          currentStep = 0;
          checkedMilestones = {};
          ViewManager.show('ll-welcome');
        });
      }

      // Confetti for high scores
      if (results.pct >= DATA.scoring.soaring.min) {
        setTimeout(() => Celebrations.confetti(), 300);
      }

      ViewManager.show('ll-results');
    },

    /** Animate number counting up: 0% → 75% */
    countUp(el, from, to, duration) {
      const start = performance.now();
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(from + (to - from) * progress);
        el.textContent = value + '%';
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  };

  // =========================================================================
  // CELEBRATIONS
  // =========================================================================
  const Celebrations = {
    sparkle(element) {
      if (!element) return;
      const sparkle = document.createElement('span');
      sparkle.className = 'll-sparkle';
      sparkle.textContent = '✨';
      sparkle.style.left = (element.offsetWidth / 2 - 8) + 'px';
      sparkle.style.top = '-10px';
      element.style.position = 'relative';
      element.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 600);
    },

    confetti() {
      const colors = ['#5eb6d9', '#e8735a', '#9b6fcf', '#e8b84d', '#38a169'];
      for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'll-confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        piece.style.width = (6 + Math.random() * 8) + 'px';
        piece.style.height = (6 + Math.random() * 8) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4000);
      }
    }
  };

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  function initEvents() {
    // Disclaimer toggle
    const disclaimerToggle = document.getElementById('ll-disclaimer-toggle');
    const disclaimerFull = document.getElementById('ll-disclaimer-full');
    if (disclaimerToggle && disclaimerFull) {
      disclaimerToggle.addEventListener('click', () => {
        const isOpen = disclaimerFull.classList.toggle('open');
        disclaimerToggle.textContent = isOpen ? 'Show less' : 'Read more';
        disclaimerToggle.setAttribute('aria-expanded', isOpen);
      });
    }

    // Slider
    SliderManager.init();

    // "Let's Go!" button
    const goBtn = document.getElementById('ll-go-btn');
    if (goBtn) {
      goBtn.addEventListener('click', () => {
        const ageId = SliderManager.getSelectedAgeId();
        if (ageId) FlowManager.start(ageId);
      });
    }

    // Back button (goes to previous discipline or back to age select)
    const backBtn = document.getElementById('ll-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => FlowManager.prevStep());
    }

    // Next button (advances discipline or shows results)
    const nextBtn = document.getElementById('ll-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => FlowManager.nextStep());
    }

    // Activities back button
    const activitiesBackBtn = document.getElementById('ll-activities-back');
    if (activitiesBackBtn) {
      activitiesBackBtn.addEventListener('click', () => {
        ViewManager.show('ll-results');
        const app = document.getElementById('little-leaps-app');
        if (app) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  // ===========================================================================
  // ACTIVITIES VIEW
  // ===========================================================================
  const ActivitiesView = {
    render(results) {
      const contentEl = document.getElementById('ll-activities-content');
      if (!contentEl) return;

      const ageData = DATA.ageRanges.find(a => a.id === currentAgeId);
      if (!ageData) return;

      let html = '<div class="ll-activities-header">';
      html += '<h2 class="ll-activities-title">🌱 Activity Ideas</h2>';
      html += '<p class="ll-activities-subtitle">for ' + ageData.label + '</p>';
      html += '</div>';

      let hasActivities = false;

      DISCIPLINES.forEach(disc => {
        const info = DATA.disciplines[disc];
        const milestones = ageData.milestones[disc] || [];

        // Get unchecked milestones (keyed by m.id in checkedMilestones object)
        const unchecked = milestones.filter(m => !checkedMilestones[m.id]);
        // Only show disciplines with unchecked milestones that have activities
        const withActivities = unchecked.filter(m => m.activities && m.activities.length > 0);

        if (withActivities.length === 0) return;
        hasActivities = true;

        html += '<div class="ll-disc-group">';
        html += '<div class="ll-disc-group-title">';
        html += '<span>' + info.icon + '</span> ' + info.label;
        html += ' <span class="ll-disc-count">(' + withActivities.length + ' to explore)</span>';
        html += '</div>';

        withActivities.forEach((milestone, idx) => {
          const uniqueId = disc + '-' + idx;
          html += '<div class="ll-unchecked-item">';
          html += '<div class="ll-unchecked-text" data-toggle="' + uniqueId + '">';
          html += '<span class="ll-unchecked-dot">○</span> ' + milestone.text;
          html += '<span class="ll-toggle-arrow">▾</span>';
          html += '</div>';

          html += '<div class="ll-activity-cards" id="ll-act-' + uniqueId + '">';
          milestone.activities.forEach(act => {
            html += '<div class="ll-activity-card">';
            html += '<div class="ll-activity-card-header">';
            html += '<span class="ll-activity-emoji">' + act.emoji + '</span>';
            html += '<span class="ll-activity-title">' + act.title + '</span>';
            html += '</div>';
            html += '<p class="ll-activity-desc">' + act.desc + '</p>';
            html += '<div class="ll-activity-meta">';
            html += '<span>📦 ' + act.materials + '</span>';
            html += '<span>⏱️ ' + act.time + '</span>';
            html += '<span>📖 ' + act.source + '</span>';
            html += '</div>';
            html += '</div>';
          });
          html += '</div>';
          html += '</div>';
        });

        html += '</div>';
      });

      if (!hasActivities) {
        html += '<p class="ll-no-activities">🌟 All milestones checked — no activities needed right now!</p>';
      }

      html += '<div class="ll-activities-footer">';
      html += '<p>🌱 from Little Leaps by WellCare & Nurture</p>';
      html += '</div>';

      contentEl.innerHTML = html;

      // Wire up accordion toggles
      contentEl.querySelectorAll('.ll-unchecked-text').forEach(el => {
        el.addEventListener('click', () => {
          const targetId = 'll-act-' + el.dataset.toggle;
          const target = document.getElementById(targetId);
          if (target) {
            const isOpen = target.classList.contains('open');
            // Close all others
            contentEl.querySelectorAll('.ll-activity-cards.open').forEach(c => c.classList.remove('open'));
            contentEl.querySelectorAll('.ll-unchecked-text.active').forEach(t => t.classList.remove('active'));
            if (!isOpen) {
              target.classList.add('open');
              el.classList.add('active');
            }
          }
        });
      });

      ViewManager.show('ll-activities');
      const app = document.getElementById('little-leaps-app');
      if (app) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    initEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
