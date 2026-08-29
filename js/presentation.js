/**
 * Deck bootstrap: reveal.js initialisation, presenter timer, and the keyboard
 * affordances a presenter needs in a room they do not control.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  function isPrintMode() {
    return /print-pdf/gi.test(global.location.search);
  }

  function mobileRevealOptions() {
    if (!global.matchMedia('(max-width: 720px)').matches) return {};

    return {
      width: Math.max(global.innerWidth, 320),
      height: Math.max(global.innerHeight, 1600),
      margin: 0,
      minScale: 0.2,
      maxScale: 1,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Presenter timer                                                         */
  /* ---------------------------------------------------------------------- */

  function Timer(node, targetMinutes) {
    this.node = node;
    this.targetMs = targetMinutes * 60 * 1000;
    this.startedAt = null;
    this.interval = null;
    this.visible = false;
  }

  Timer.prototype.format = function (ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var mm = String(Math.floor(total / 60)).padStart(2, '0');
    var ss = String(total % 60).padStart(2, '0');
    return mm + ':' + ss;
  };

  Timer.prototype.tick = function () {
    if (!this.startedAt) return;
    var elapsed = Date.now() - this.startedAt;
    this.node.textContent = this.format(elapsed);

    this.node.classList.toggle('is-warn', elapsed >= this.targetMs * 0.8 && elapsed < this.targetMs);
    this.node.classList.toggle('is-over', elapsed >= this.targetMs);
  };

  Timer.prototype.toggle = function () {
    this.visible = !this.visible;
    this.node.hidden = !this.visible;

    if (this.visible) {
      if (!this.startedAt) this.startedAt = Date.now();
      this.tick();
      this.interval = global.setInterval(this.tick.bind(this), 1000);
    } else if (this.interval) {
      global.clearInterval(this.interval);
      this.interval = null;
    }
  };

  Timer.prototype.reset = function () {
    this.startedAt = Date.now();
    this.tick();
  };

  /* ---------------------------------------------------------------------- */
  /* Bootstrap                                                               */
  /* ---------------------------------------------------------------------- */

  var Presentation = {
    init: function (options) {
      options = options || {};

      if (!global.FMAuth.requireSession()) return; // redirecting to login

      // Before reveal indexes anything, so slide numbers and PDF export agree.
      var selection = global.FMSlides ? global.FMSlides.apply(doc) : null;

      var cfg = global.FM.get('reveal', {});
      var plugins = [];
      if (global.RevealNotes) plugins.push(global.RevealNotes);
      if (global.RevealZoom) plugins.push(global.RevealZoom);
      if (global.RevealSearch) plugins.push(global.RevealSearch);

      var revealOptions = Object.assign({}, cfg, mobileRevealOptions(), {
        rtl: options.rtl === true,
        plugins: plugins,
        keyboard: {
          // 84 = T, toggles the presenter timer.
          84: function () {
            if (Presentation.timer) Presentation.timer.toggle();
          },
          // 82 = R, restarts it.
          82: function () {
            if (Presentation.timer) Presentation.timer.reset();
          },
          // 76 = L, switches language, holding slide position.
          76: function () {
            global.FMLanguage.switchDeck();
          },
        },
      });

      // reveal's own PDF export path handles layout; forcing our options on top
      // of it produces clipped pages.
      if (isPrintMode()) {
        revealOptions.controls = false;
        revealOptions.progress = false;
        revealOptions.slideNumber = false;
      }

      global.Reveal.initialize(revealOptions).then(function () {
        Presentation.onReady(options, selection);
      });
    },

    onReady: function (options, selection) {
      this.setupTimer();
      this.setupClassification(options);
      this.setupCopyrightMark();
      global.FMLanguage.bindSwitcher();
      global.FMDemo.init();
      this.setupAccessibility();
      this.announceGateState();
      this.announceSelection(selection, options);
    },

    setupTimer: function () {
      if (!global.FM.get('features.presenterTimer', true) || isPrintMode()) return;

      var node = doc.createElement('div');
      node.className = 'fm-timer';
      node.hidden = true;
      node.setAttribute('aria-live', 'off');
      node.setAttribute('title', 'T toggles · R restarts');
      node.textContent = '00:00';
      doc.body.appendChild(node);

      this.timer = new Timer(node, global.FM.get('features.targetMinutes', 20));
    },

    /**
     * Injected in print mode too. A confidential deck exported to PDF and
     * handed round a ministry is exactly the artifact that most needs the
     * marking; print.css restyles it for paper rather than hiding it.
     */
    setupClassification: function (options) {
      var text = options.rtl
        ? global.FM.get('meeting.classificationAr', '')
        : global.FM.get('meeting.classificationEn', '');
      if (!text) return;

      var bar = doc.createElement('div');
      bar.className = 'fm-classification';
      bar.textContent = text;
      doc.body.appendChild(bar);
    },

    setupCopyrightMark: function () {
      var mark = doc.createElement('img');
      mark.className = 'fm-copyright-mark';
      mark.src = 'assets/logos/oriel.png';
      mark.alt = 'Oriel Company';
      mark.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(mark);
    },

    /**
     * reveal.js hides off-screen slides from the accessibility tree but leaves
     * their media focusable in some versions; and a deck with no landmark is
     * hostile to a screen reader. Both are cheap to fix.
     */
    setupAccessibility: function () {
      var slides = doc.querySelector('.reveal .slides');
      if (slides) {
        slides.setAttribute('role', 'region');
        slides.setAttribute('aria-label', doc.title);
      }

      var skip = doc.createElement('a');
      skip.className = 'fm-skip-link';
      skip.href = '#/0';
      skip.textContent = doc.documentElement.lang === 'ar' ? 'تخطٍ إلى المحتوى' : 'Skip to content';
      doc.body.insertBefore(skip, doc.body.firstChild);

      global.Reveal.on('slidechanged', function (event) {
        if (event.currentSlide) {
          var heading = event.currentSlide.querySelector('h1, h2, h3');
          if (heading) {
            event.currentSlide.setAttribute('aria-label', heading.textContent.trim());
          }
        }
      });
    },

    /**
     * A trimmed deck looks exactly like a full one until you reach the end and
     * find a slide missing. Say so on load, briefly, then get out of the way.
     */
    announceSelection: function (selection, options) {
      if (!selection || !selection.applied || isPrintMode()) return;

      var rtl = options.rtl === true;
      var preset = selection.preset && global.FMSlides.preset(selection.preset);
      var name = preset ? (rtl ? preset.ar : preset.en) : null;

      var text = rtl
        ? 'عرض ' + selection.shown + ' من ' + selection.total + ' شريحة'
        : 'Showing ' + selection.shown + ' of ' + selection.total + ' slides';
      if (name) text += (rtl ? ' · ' : ' · ') + name;

      var toast = doc.createElement('div');
      toast.className = 'fm-toast';
      toast.setAttribute('role', 'status');
      toast.textContent = text;
      doc.body.appendChild(toast);

      global.setTimeout(function () { toast.classList.add('is-out'); }, 5000);
      global.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 6200);
    },

    /**
     * When the gate is bypassed, say so in the console rather than letting a
     * presenter assume the deck is protected when it is not.
     */
    announceGateState: function () {
      var reason = global.FMAuth.disabledReason();
      if (reason) {
        global.console.info(
          '[Farm Marshal] Access gate inactive (' + reason + '). ' +
          'This deck is readable by anyone with the URL. See docs/SECURITY_LIMITATIONS.md.'
        );
      }
    },
  };

  global.FMPresentation = Presentation;
})(window);
