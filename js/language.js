/**
 * Language selection and cross-deck switching.
 *
 * The two decks are separate documents rather than one document with swapped
 * strings. That is deliberate: RTL is a layout concern as much as a text
 * concern, and a single-document approach forces every slide to carry both
 * layouts. Separate documents keep each one honest.
 *
 * This module keeps the two in sync — remembering the preferred language, and
 * preserving slide position when switching mid-presentation.
 */
(function (global) {
  'use strict';

  var PREF_KEY = 'fm.lang.v1';

  var DECKS = {
    en: { file: 'presentation-en.html', dir: 'ltr', label: 'English' },
    ar: { file: 'presentation-ar.html', dir: 'rtl', label: 'العربية' },
  };

  var Language = {
    decks: DECKS,

    get: function () {
      try {
        var stored = global.localStorage.getItem(PREF_KEY);
        return DECKS[stored] ? stored : null;
      } catch (err) {
        return null;
      }
    },

    set: function (lang) {
      if (!DECKS[lang]) return;
      try {
        global.localStorage.setItem(PREF_KEY, lang);
      } catch (err) {
        /* storage unavailable — preference simply is not remembered */
      }
    },

    current: function () {
      var file = global.location.pathname.split('/').pop();
      return file === DECKS.ar.file ? 'ar' : file === DECKS.en.file ? 'en' : null;
    },

    other: function () {
      return this.current() === 'ar' ? 'en' : 'ar';
    },

    /**
     * Switches deck while holding position. reveal.js writes the current slide
     * to location.hash, and both decks use the same slide ids, so carrying the
     * hash across lands the viewer on the same slide in the other language.
     *
     * The slide selection is carried too — switching language mid-meeting must
     * not quietly restore slides the presenter chose to drop.
     */
    switchDeck: function () {
      var target = this.other();
      this.set(target);

      var hash = global.location.hash || '';
      var param = global.FMSlides ? global.FMSlides.currentParam() : '';
      global.location.href = DECKS[target].file + (param ? '?' + param : '') + hash;
    },

    /** Wires up any element with [data-fm-lang-switch]. */
    bindSwitcher: function () {
      var nodes = global.document.querySelectorAll('[data-fm-lang-switch]');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].addEventListener('click', function (event) {
          event.preventDefault();
          Language.switchDeck();
        });
      }
    },
  };

  global.FMLanguage = Language;
})(window);
