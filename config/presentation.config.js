/**
 * Farm Marshal — presentation configuration.
 *
 * Loaded as a classic script (not a module, not JSON) so it works identically over
 * http(s):// and over file:// from a USB stick. `fetch()` of a local JSON file is
 * blocked by the file:// origin policy, which is why this is a .js file.
 */
window.FM_CONFIG = {
  brand: {
    nameEn: 'Farm Marshal',
    nameAr: 'فارم مارشال',
    taglineEn: 'From Observation to Evidence',
    taglineAr: 'من الملاحظة إلى الدليل',
    partnersEn: 'Al Sarrani Group × Oriel Company',
    partnersAr: 'مجموعة السراني × أوريل كومباني',
  },

  meeting: {
    classificationEn: 'Confidential — for ministerial review',
    classificationAr: 'سري — للمراجعة الوزارية',
    audienceEn: 'MEWA · MOI · MOD',
    audienceAr: 'البيئة والمياه والزراعة · الداخلية · الدفاع',
  },

  features: {
    /** Set false to remove the access gate entirely (offline builds do this). */
    requireLogin: true,
    /** Minutes of inactivity before the session token is discarded. */
    sessionTimeoutMinutes: 180,
    /** Show the presenter timer overlay (toggle with T). */
    presenterTimer: true,
    /** Target speaking time, drives the timer colour bands. */
    targetMinutes: 20,
  },

  reveal: {
    width: 1920,
    height: 1080,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 1.5,
    transition: 'fade',
    transitionSpeed: 'slow',
    backgroundTransition: 'fade',
    controls: true,
    progress: true,
    slideNumber: 'c/t',
    hash: true,
    respondToHashChanges: true,
    history: false,
    center: false,
    overview: true,
    touch: true,
    fragmentInURL: true,
    pdfSeparateFragments: false,
    pdfMaxPagesPerSlide: 1,
    display: 'flex',
  },

  /**
   * Canonical slide manifest. scripts/validate-content.mjs asserts that every id
   * here exists in BOTH presentation-en.html and presentation-ar.html, which is
   * what stops the two language decks drifting apart.
   */
  slides: [
    { id: 'title', block: 0, en: 'Title', ar: 'الغلاف' },
    { id: 'video', block: 1, en: 'Concept film', ar: 'الفيلم التعريفي' },
    { id: 'reframe', block: 2, en: 'The information gap', ar: 'الفجوة المعلوماتية' },
    { id: 'cost', block: 2, en: 'What the gap costs', ar: 'كلفة الفجوة' },
    { id: 'evidence-chain', block: 3, en: 'One evidence chain', ar: 'سلسلة دليل واحدة' },
    { id: 'layers', block: 3, en: 'Three layers, three jobs', ar: 'ثلاث طبقات' },
    { id: 'demo-open', block: 4, en: 'Demo — case opens', ar: 'العرض — فتح الحالة' },
    { id: 'demo-expert', block: 4, en: 'Demo — expert and network', ar: 'العرض — الخبير والشبكة' },
    { id: 'demo-close', block: 4, en: 'Demo — task tracked to completion', ar: 'العرض — متابعة حتى الإنجاز' },
    { id: 'track-mewa', block: 5, en: 'Agriculture track', ar: 'مسار البيئة والمياه والزراعة' },
    { id: 'track-moi', block: 5, en: 'Interior track', ar: 'مسار الداخلية' },
    { id: 'track-mod', block: 5, en: 'Defense track', ar: 'مسار الدفاع' },
    { id: 'governance', block: 6, en: 'Who controls what', ar: 'من يرى ماذا' },
    { id: 'flight-chain', block: 6, en: 'Flight authorization chain', ar: 'سلسلة تصريح الطيران' },
    { id: 'not-asking', block: 6, en: 'What we are not asking for', ar: 'ما لا نطلبه' },
    { id: 'economics', block: 7, en: 'Unit economics', ar: 'الجدوى الاقتصادية' },
    { id: 'localization', block: 7, en: 'Built in the Kingdom', ar: 'التوطين' },
    { id: 'the-ask', block: 8, en: 'The specific request', ar: 'الطلب المحدد' },
    { id: 'close', block: 9, en: 'Close', ar: 'الختام' },
    { id: 'appendix', block: 10, en: 'Appendix', ar: 'الملاحق' },
  ],

  /**
   * Named slide selections offered by config.html. `slides: null` means the
   * whole deck. Every other entry lists slide keys from config/slide-index.js —
   * top-level slides by id, appendix slides by position (appendix/1 …).
   *
   * A key that no longer exists is ignored rather than treated as an error, so
   * removing a slide from the deck degrades a preset instead of breaking it.
   */
  presets: [
    {
      id: 'full',
      en: 'Full deck',
      ar: 'العرض الكامل',
      noteEn: 'Everything, including the appendix.',
      noteAr: 'كل الشرائح، بما فيها الملاحق.',
      slides: null,
    },
    {
      id: 'main',
      en: 'Main deck, no appendix',
      ar: 'العرض الرئيسي دون الملاحق',
      noteEn: 'The narrative only. Appendix stays out unless a question calls for it.',
      noteAr: 'السرد الأساسي فقط، وتبقى الملاحق للأسئلة.',
      slides: [
        'title', 'video', 'reframe', 'cost', 'evidence-chain', 'layers',
        'demo-open', 'demo-expert', 'demo-close',
        'track-mewa', 'track-moi', 'track-mod',
        'governance', 'flight-chain', 'not-asking',
        'economics', 'localization', 'the-ask', 'close',
      ],
    },
    {
      id: 'short',
      en: 'Cut to ten minutes',
      ar: 'اختصار إلى عشر دقائق',
      noteEn: 'For when the meeting runs late and you are asked to be brief.',
      noteAr: 'حين يتأخر الاجتماع ويُطلب منك الإيجاز.',
      slides: [
        'title', 'reframe', 'evidence-chain', 'demo-open', 'demo-close',
        'governance', 'the-ask', 'close',
      ],
    },
    {
      id: 'mewa',
      en: 'Agriculture focus',
      ar: 'تركيز على الزراعة',
      noteEn: 'Drops the Interior and Defense tracks.',
      noteAr: 'يحذف مسارَي الداخلية والدفاع.',
      slides: [
        'title', 'video', 'reframe', 'cost', 'evidence-chain', 'layers',
        'demo-open', 'demo-expert', 'demo-close', 'track-mewa',
        'governance', 'economics', 'localization', 'the-ask', 'close',
      ],
    },
    {
      id: 'moi',
      en: 'Interior focus',
      ar: 'تركيز على الداخلية',
      noteEn: 'Leads on airspace discipline and the authorization chain.',
      noteAr: 'يركّز على انضباط المجال الجوي وسلسلة التصاريح.',
      slides: [
        'title', 'reframe', 'evidence-chain', 'demo-open', 'demo-close',
        'track-moi', 'governance', 'flight-chain', 'not-asking',
        'localization', 'the-ask', 'close',
      ],
    },
    {
      id: 'mod',
      en: 'Defense focus',
      ar: 'تركيز على الدفاع',
      noteEn: 'Leads on data sovereignty and hosting.',
      noteAr: 'يركّز على سيادة البيانات والاستضافة.',
      slides: [
        'title', 'reframe', 'evidence-chain', 'demo-open', 'demo-close',
        'track-mod', 'governance', 'flight-chain', 'not-asking',
        'localization', 'the-ask', 'close',
      ],
    },
  ],

  /**
   * Claims that must be resolved before this deck is shown. Rendered live on the
   * verification slide so an unresolved item cannot be quietly forgotten.
   * status: 'blocking' | 'confirm' | 'resolved'
   */
  verification: [
    {
      id: 'production-value',
      status: 'blocking',
      claimEn: 'SAR 9.2bn date production value; SAR 1.5bn annual losses (16–17%)',
      claimAr: '9.2 مليار ريال قيمة إنتاج التمور؛ 1.5 مليار ريال خسائر سنوية (16–17%)',
      noteEn: 'Not locatable in public National Center for Palms and Dates material. Do not present unsourced.',
    },
    {
      id: 'coverage-rate',
      status: 'blocking',
      claimEn: 'Drone covers five acres per hour',
      claimAr: 'المسيّرة تمسح خمسة أفدنة في الساعة',
      noteEn: 'Depends on airframe, sensor, altitude, overlap and mission profile. Validate or reword.',
    },
    {
      id: 'regulatory-route',
      status: 'confirm',
      claimEn: 'GACA registration + remote-pilot certification + Public Security clearance',
      claimAr: 'تسجيل الطيران المدني + رخصة الطيار + التصريح الأمني',
      noteEn: 'Confirm exact current route and portal before naming it in front of the regulator.',
    },
    {
      id: 'economics-model',
      status: 'confirm',
      claimEn: 'SAR 1.68m expected annual value on 1,000 ha; 2.8× benefit-cost',
      claimAr: '1.68 مليون ريال قيمة سنوية متوقعة لكل 1000 هكتار',
      noteEn: 'Synthetic planning assumptions. Must be labelled as such on the slide.',
    },
    {
      id: 'vision-2030-logo',
      status: 'confirm',
      claimEn: 'Use of the Saudi Vision 2030 logo',
      claimAr: 'استخدام شعار رؤية السعودية 2030',
      noteEn: 'Only with formal permission and per its brand rules. Omitted from this build by default.',
    },
  ],
};
