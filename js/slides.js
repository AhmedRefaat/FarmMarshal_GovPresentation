/**
 * Slide selection — lets a presenter choose which slides a deck shows.
 *
 * Two ministers in the same room want different things, and meetings get cut
 * short. Rather than maintaining several near-duplicate decks (which drift),
 * one deck carries every slide and a selection decides what is shown.
 *
 * A selection lives in two places, in this order of precedence:
 *   1. the `slides` query parameter — portable, survives being emailed or
 *      carried to another machine on a USB stick;
 *   2. localStorage — convenience, so the choice sticks between openings.
 *
 * Slides are removed from the DOM before Reveal.initialize() rather than hidden
 * with CSS, so the slide count, navigation, overview and PDF export all agree
 * with what is on screen.
 */
(function (global) {
  'use strict';

  var KEY = 'fm.slides.v1';
  var PARAM = 'slides';

  var Slides = {
    index: function () {
      return global.FM_SLIDE_INDEX || { fingerprint: '', groups: [], slides: [] };
    },

    allKeys: function () {
      return this.index().slides.map(function (s) { return s.key; });
    },

    presets: function () {
      return (global.FM && global.FM.get('presets', [])) || [];
    },

    preset: function (id) {
      var found = null;
      this.presets().forEach(function (p) { if (p.id === id) found = p; });
      return found;
    },

    /** Drops keys that no longer exist, so an edited deck degrades a selection rather than breaking it. */
    clean: function (keys) {
      var known = {};
      this.allKeys().forEach(function (k) { known[k] = true; });
      var seen = {};
      return (keys || []).filter(function (k) {
        if (!known[k] || seen[k]) return false;
        seen[k] = true;
        return true;
      });
    },

    fromUrl: function () {
      var m = new RegExp('[?&]' + PARAM + '=([^&#]*)').exec(global.location.search || '');
      if (!m) return null;

      var raw = decodeURIComponent(m[1] || '').trim();
      if (!raw || raw === 'all') return { keys: null }; // explicit "show everything"

      if (raw.indexOf('preset:') === 0) {
        var preset = this.preset(raw.slice('preset:'.length));
        if (!preset) return null;
        return { keys: preset.slides ? this.clean(preset.slides) : null, preset: preset.id };
      }
      return { keys: this.clean(raw.split(',')) };
    },

    fromStorage: function () {
      try {
        var raw = global.localStorage.getItem(KEY);
        if (!raw) return null;

        var saved = JSON.parse(raw);
        if (!saved || !saved.keys) return null;

        // The decks changed since this was saved; positional appendix keys can
        // no longer be trusted, so fall back to the full deck rather than
        // silently hiding the wrong slides.
        if (saved.fingerprint !== this.index().fingerprint) {
          this.clear();
          return null;
        }
        return { keys: this.clean(saved.keys), preset: saved.preset || null };
      } catch (err) {
        return null;
      }
    },

    save: function (keys, presetId) {
      try {
        if (!keys) {
          global.localStorage.removeItem(KEY);
          return;
        }
        global.localStorage.setItem(KEY, JSON.stringify({
          fingerprint: this.index().fingerprint,
          preset: presetId || null,
          keys: this.clean(keys),
        }));
      } catch (err) {
        /* storage unavailable — the ?slides= link still works */
      }
    },

    clear: function () {
      try {
        global.localStorage.removeItem(KEY);
      } catch (err) {
        /* nothing to clear */
      }
    },

    /**
     * The selection in force. `keys: null` means the full deck.
     */
    current: function () {
      var fromUrl = this.fromUrl();
      if (fromUrl) {
        return { keys: fromUrl.keys, preset: fromUrl.preset || null, source: 'link' };
      }

      var stored = this.fromStorage();
      if (stored && stored.keys && stored.keys.length) {
        return { keys: stored.keys, preset: stored.preset, source: 'saved' };
      }
      return { keys: null, preset: null, source: 'default' };
    },

    /** Which preset a set of keys corresponds to, if any. */
    matchPreset: function (keys) {
      var target = (keys || this.allKeys()).slice().sort().join(',');
      var all = this.allKeys().slice().sort().join(',');
      var match = null;

      this.presets().forEach(function (p) {
        if (match) return;
        var candidate = p.slides ? Slides.clean(p.slides).slice().sort().join(',') : all;
        if (candidate === target) match = p.id;
      });
      return match;
    },

    /** Builds a deck URL carrying the given selection. */
    link: function (file, keys, hash) {
      var query = '';
      if (keys) {
        var preset = this.matchPreset(keys);
        query = '?' + PARAM + '=' + encodeURIComponent(preset ? 'preset:' + preset : keys.join(','));
      }
      return file + query + (hash || '');
    },

    /** The `slides` parameter of the current URL, for carrying across a language switch. */
    currentParam: function () {
      var m = new RegExp('[?&]' + PARAM + '=([^&#]*)').exec(global.location.search || '');
      return m ? PARAM + '=' + m[1] : '';
    },

    /**
     * Removes unselected slides. Must run before Reveal.initialize().
     * Returns what happened so the deck can tell the presenter.
     */
    apply: function (doc) {
      var total = this.allKeys().length;
      var selection = this.current();
      var result = { applied: false, shown: total, total: total, source: selection.source, preset: selection.preset };

      if (!selection.keys || !selection.keys.length) return result;

      var keep = {};
      selection.keys.forEach(function (k) { keep[k] = true; });

      var root = doc.querySelector('.reveal .slides');
      if (!root) return result;

      var tops = Array.prototype.filter.call(root.children, function (el) {
        return el.tagName === 'SECTION';
      });

      // Refuse to empty the deck — a mistyped link should not blank the screen
      // in front of a minister.
      var remaining = 0;
      tops.forEach(function (top, h) {
        var kids = Array.prototype.filter.call(top.children, function (el) { return el.tagName === 'SECTION'; });
        if (kids.length) {
          var stackId = top.id || 'stack' + h;
          kids.forEach(function (kid, v) { if (keep[stackId + '/' + (v + 1)]) remaining++; });
        } else if (keep[top.id || 'slide' + h]) {
          remaining++;
        }
      });
      if (remaining === 0) return result;

      tops.forEach(function (top, h) {
        var kids = Array.prototype.filter.call(top.children, function (el) { return el.tagName === 'SECTION'; });

        if (kids.length) {
          var stackId = top.id || 'stack' + h;
          kids.forEach(function (kid, v) {
            if (!keep[stackId + '/' + (v + 1)]) top.removeChild(kid);
          });
          if (!top.querySelector('section')) root.removeChild(top);
          return;
        }
        if (!keep[top.id || 'slide' + h]) root.removeChild(top);
      });

      result.applied = true;
      result.shown = remaining;
      return result;
    },
  };

  global.FMSlides = Slides;
})(window);
