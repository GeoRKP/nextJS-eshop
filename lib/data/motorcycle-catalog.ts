// ============================================================================
// Motorcycle Brake Parts Catalog
// Supplementary data for AVL motorcycle brake components
// Can be imported into the main seed data when ready
// ============================================================================

export type MotorcycleCatalogCategory = {
  name: string
  slug: string
  description: string
  image: string | null
  parentSlug: string | null
  sortOrder: number
}

export type MotorcycleCatalogProduct = {
  name: string
  slug: string
  category: string
  categorySlug: string
  description: string
  images: string[]
  price: number
  brand: string
  rating: number
  numReviews: number
  stock: number
  isFeatured: boolean
  banner: string | null
  specs: Record<string, string | number | string[]>
}

// ── Categories ────────────────────────────────────────────────────────────────

export const motorcycleCategories: MotorcycleCatalogCategory[] = [
  // ── Parent Category ───────────────────────────────────────────────────────
  {
    name: 'Ανταλλακτικά Μοτοσυκλέτας',
    slug: 'antallaktika-motosykletas',
    description:
      'Ανταλλακτικά φρένων για μοτοσυκλέτες — δισκόπλακες, τακάκια, μαρκούτσια και ρακόρ',
    image: '/images/categories/antallaktika-motosykletas.jpg',
    parentSlug: null,
    sortOrder: 6,
  },

  // ── Subcategories ─────────────────────────────────────────────────────────
  {
    name: 'Δισκόπλακες Μοτοσυκλέτας',
    slug: 'diskoplakes-motosykletas',
    description:
      'Δισκόπλακες φρένων (εμπρός & πίσω) για sport, touring και naked μοτοσυκλέτες',
    image: null,
    parentSlug: 'antallaktika-motosykletas',
    sortOrder: 1,
  },
  {
    name: 'Τακάκια Μοτοσυκλέτας',
    slug: 'takakia-motosykletas',
    description:
      'Τακάκια φρένων ημιμεταλλικά, sintered και οργανικά για κάθε τύπο μοτοσυκλέτας',
    image: null,
    parentSlug: 'antallaktika-motosykletas',
    sortOrder: 2,
  },
  {
    name: 'Μαρκούτσια Φρένων Μοτοσυκλέτας',
    slug: 'markoutsia-frenon-motosykletas',
    description:
      'Ενισχυμένα μαρκούτσια φρένων inox πλεξούδα και Teflon για μοτοσυκλέτες',
    image: null,
    parentSlug: 'antallaktika-motosykletas',
    sortOrder: 3,
  },
  {
    name: 'Ρακόρ Μοτοσυκλέτας',
    slug: 'rakor-motosykletas',
    description:
      'Λαδοβίδες banjo, ροδέλες χαλκού και εξαρτήματα σύνδεσης φρένων μοτοσυκλέτας',
    image: null,
    parentSlug: 'antallaktika-motosykletas',
    sortOrder: 4,
  },
]

// ── Products ──────────────────────────────────────────────────────────────────

export const motorcycleProducts: MotorcycleCatalogProduct[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ΔΙΣΚΟΠΛΑΚΕΣ ΜΟΤΟΣΥΚΛΕΤΑΣ
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Δισκόπλακα εμπρός Honda CBR600RR / CBR1000RR 296mm',
    slug: 'diskoplaka-empros-honda-cbr600-1000-296mm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'diskoplakes-motosykletas',
    description:
      'Δισκόπλακα εμπρόσθιου φρένου 296mm για Honda CBR600RR (2003–2018) και CBR1000RR (2004–2019). Κατασκευή από ανοξείδωτο χάλυβα με αεριζόμενη σχεδίαση wave-cut για βέλτιστη απαγωγή θερμότητας. Ισορροπημένη δυναμικά για μηδενικούς κραδασμούς σε υψηλές ταχύτητες.',
    images: ['/images/placeholder.jpg'],
    price: 78.0,
    brand: 'AVL',
    rating: 4.7,
    numReviews: 14,
    stock: 12,
    isFeatured: true,
    banner: null,
    specs: {
      diameter: '296mm',
      thickness: '4.5mm',
      material: 'Stainless Steel',
      type: 'Wave-cut floating',
      compatibleModels: ['Honda CBR600RR', 'Honda CBR1000RR'],
      position: 'Εμπρός',
    },
  },
  {
    name: 'Δισκόπλακα εμπρός Yamaha YZF-R1 / R6 298mm',
    slug: 'diskoplaka-empros-yamaha-yzf-r1-r6-298mm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'diskoplakes-motosykletas',
    description:
      'Δισκόπλακα εμπρόσθιου φρένου 298mm για Yamaha YZF-R1 (2004–2014) και YZF-R6 (2003–2016). Σχεδίαση wave με κρεμαστούς πείρους (floating) για ομοιόμορφη κατανομή πίεσης. Ανθεκτική σε fading ακόμα και σε παρατεταμένη επιθετική οδήγηση πίστας.',
    images: ['/images/placeholder.jpg'],
    price: 75.0,
    brand: 'AVL',
    rating: 4.6,
    numReviews: 11,
    stock: 10,
    isFeatured: false,
    banner: null,
    specs: {
      diameter: '298mm',
      thickness: '4.5mm',
      material: 'Stainless Steel',
      type: 'Wave-cut floating',
      compatibleModels: ['Yamaha YZF-R1', 'Yamaha YZF-R6'],
      position: 'Εμπρός',
    },
  },
  {
    name: 'Δισκόπλακα πίσω universal 220mm',
    slug: 'diskoplaka-piso-universal-220mm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'diskoplakes-motosykletas',
    description:
      'Οπίσθια δισκόπλακα 220mm universal εφαρμογής με 4 οπές στερέωσης. Κατάλληλη για τις περισσότερες ιαπωνικές sport και naked μοτοσυκλέτες 400cc–1000cc. Ατσάλι υψηλής αντοχής με επιφανειακή λείανση για γρήγορο «δέσιμο» με τα τακάκια.',
    images: ['/images/placeholder.jpg'],
    price: 38.0,
    brand: 'AVL',
    rating: 4.3,
    numReviews: 9,
    stock: 30,
    isFeatured: false,
    banner: null,
    specs: {
      diameter: '220mm',
      thickness: '4.0mm',
      material: 'High-Carbon Steel',
      type: 'Solid fixed',
      mountingHoles: 4,
      position: 'Πίσω',
    },
  },
  {
    name: 'Δισκόπλακα εμπρός Kawasaki ZX-6R / ZX-10R 300mm',
    slug: 'diskoplaka-empros-kawasaki-zx6r-zx10r-300mm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'diskoplakes-motosykletas',
    description:
      'Δισκόπλακα εμπρόσθιου φρένου 300mm για Kawasaki ZX-6R (2005–2016) και ZX-10R (2004–2015). Petal design με εσωτερικές αυλακώσεις αυτοκαθαρισμού. Πλωτή κατασκευή (floating) με ορειχάλκινους πείρους για μειωμένο βάρος και άμεση απόκριση.',
    images: ['/images/placeholder.jpg'],
    price: 80.0,
    brand: 'AVL',
    rating: 4.8,
    numReviews: 7,
    stock: 8,
    isFeatured: true,
    banner: null,
    specs: {
      diameter: '300mm',
      thickness: '5.0mm',
      material: 'Stainless Steel',
      type: 'Petal floating',
      compatibleModels: ['Kawasaki ZX-6R', 'Kawasaki ZX-10R'],
      position: 'Εμπρός',
    },
  },
  {
    name: 'Δισκόπλακα εμπρός Suzuki GSX-R600 / GSX-R750 310mm',
    slug: 'diskoplaka-empros-suzuki-gsxr600-750-310mm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'diskoplakes-motosykletas',
    description:
      'Δισκόπλακα εμπρόσθιου φρένου 310mm για Suzuki GSX-R600 (2004–2016) και GSX-R750 (2004–2016). Ενισχυμένη wave-cut κατασκευή για αγωνιστική χρήση. Θερμική σταθερότητα σε θερμοκρασίες πάνω από 500°C — ιδανική για track days.',
    images: ['/images/placeholder.jpg'],
    price: 76.0,
    brand: 'AVL',
    rating: 4.5,
    numReviews: 6,
    stock: 10,
    isFeatured: false,
    banner: null,
    specs: {
      diameter: '310mm',
      thickness: '5.0mm',
      material: 'Stainless Steel',
      type: 'Wave-cut floating',
      compatibleModels: ['Suzuki GSX-R600', 'Suzuki GSX-R750'],
      position: 'Εμπρός',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ΤΑΚΑΚΙΑ ΜΟΤΟΣΥΚΛΕΤΑΣ
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Τακάκια ημιμεταλλικά εμπρός Honda CBR / CB',
    slug: 'takakia-imimetallika-empros-honda-cbr-cb',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'takakia-motosykletas',
    description:
      'Ημιμεταλλικά τακάκια εμπρόσθιου φρένου για Honda CBR600RR, CBR1000RR, CB650F και CB1000R. Σύνθεση χαλκού-σιδήρου με κεραμικά σωματίδια για σταθερό συντελεστή τριβής σε υγρές και στεγνές συνθήκες. Χαμηλή φθορά δίσκου.',
    images: ['/images/placeholder.jpg'],
    price: 28.0,
    brand: 'AVL',
    rating: 4.4,
    numReviews: 18,
    stock: 40,
    isFeatured: false,
    banner: null,
    specs: {
      type: 'Semi-metallic',
      position: 'Εμπρός',
      compatibleModels: [
        'Honda CBR600RR',
        'Honda CBR1000RR',
        'Honda CB650F',
        'Honda CB1000R',
      ],
      frictionCoefficient: '0.42–0.48',
      maxTemperature: '400°C',
    },
  },
  {
    name: 'Τακάκια sintered εμπρός Yamaha YZF / MT',
    slug: 'takakia-sintered-empros-yamaha-yzf-mt',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'takakia-motosykletas',
    description:
      'Sintered (χαλκοκεραμικά) τακάκια εμπρόσθιου φρένου για Yamaha YZF-R1, YZF-R6, MT-07 και MT-09. Εξαιρετική πέδηση σε υψηλές θερμοκρασίες, ιδανικά για αγωνιστική και σκληρή χρήση. Γρήγορο «δέσιμο» από το πρώτο φρενάρισμα.',
    images: ['/images/placeholder.jpg'],
    price: 35.0,
    brand: 'AVL',
    rating: 4.6,
    numReviews: 13,
    stock: 35,
    isFeatured: false,
    banner: null,
    specs: {
      type: 'Sintered',
      position: 'Εμπρός',
      compatibleModels: [
        'Yamaha YZF-R1',
        'Yamaha YZF-R6',
        'Yamaha MT-07',
        'Yamaha MT-09',
      ],
      frictionCoefficient: '0.45–0.52',
      maxTemperature: '550°C',
    },
  },
  {
    name: 'Τακάκια οργανικά universal εμπρός/πίσω',
    slug: 'takakia-organika-universal',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'takakia-motosykletas',
    description:
      'Οργανικά τακάκια γενικής χρήσης για εμπρός ή πίσω δαγκάνα. Κατάλληλα για καθημερινή αστική οδήγηση — χαμηλός θόρυβος, ομαλή πέδηση και μεγάλη διάρκεια ζωής δίσκου. Σύνθεση με kevlar και ρητίνη υψηλής θερμοκρασίας.',
    images: ['/images/placeholder.jpg'],
    price: 18.0,
    brand: 'AVL',
    rating: 4.2,
    numReviews: 22,
    stock: 60,
    isFeatured: false,
    banner: null,
    specs: {
      type: 'Organic',
      position: 'Universal εμπρός/πίσω',
      composition: 'Kevlar / Resin',
      frictionCoefficient: '0.38–0.42',
      maxTemperature: '300°C',
    },
  },
  {
    name: 'Τακάκια racing sintered εμπρός — αγωνιστικά',
    slug: 'takakia-racing-sintered-empros',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'takakia-motosykletas',
    description:
      'Αγωνιστικά sintered τακάκια εμπρόσθιου φρένου υψηλής απόδοσης. Σχεδιασμένα για πίστα (track-only), με κράμα χαλκού-κεραμικών και γραφίτη για μέγιστο συντελεστή τριβής σε θερμοκρασίες 200–650°C. Απαιτούν προθέρμανση για βέλτιστη λειτουργία.',
    images: ['/images/placeholder.jpg'],
    price: 52.0,
    brand: 'AVL',
    rating: 4.9,
    numReviews: 5,
    stock: 15,
    isFeatured: true,
    banner: null,
    specs: {
      type: 'Sintered Racing',
      position: 'Εμπρός',
      composition: 'Copper-Ceramic / Graphite',
      frictionCoefficient: '0.50–0.58',
      maxTemperature: '650°C',
      note: 'Track use only — requires warm-up',
    },
  },
  {
    name: 'Τακάκια πίσω universal μοτοσυκλέτας',
    slug: 'takakia-piso-universal-motosykletas',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'takakia-motosykletas',
    description:
      'Τακάκια οπίσθιου φρένου universal εφαρμογής για ιαπωνικές μοτοσυκλέτες 250cc–1000cc. Ημιμεταλλική σύνθεση με ελεγχόμενη φθορά — αντοχή 15.000–20.000 χλμ. σε κανονική χρήση. Εύκολη τοποθέτηση χωρίς εργαλεία ρύθμισης.',
    images: ['/images/placeholder.jpg'],
    price: 15.0,
    brand: 'AVL',
    rating: 4.3,
    numReviews: 27,
    stock: 50,
    isFeatured: false,
    banner: null,
    specs: {
      type: 'Semi-metallic',
      position: 'Πίσω',
      lifespan: '15.000–20.000 km',
      compatibleModels: [
        'Honda CBR/CB',
        'Yamaha YZF/MT',
        'Kawasaki ZX/Z',
        'Suzuki GSX-R/SV',
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ΜΑΡΚΟΥΤΣΙΑ ΦΡΕΝΩΝ ΜΟΤΟΣΥΚΛΕΤΑΣ
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Μαρκούτσι φρένου εμπρός inox πλεξούδα 90cm',
    slug: 'markoutsi-frenou-empros-inox-pleksouda-90cm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'markoutsia-frenon-motosykletas',
    description:
      'Ενισχυμένο μαρκούτσι εμπρόσθιου φρένου 90cm με πλεξούδα ανοξείδωτου χάλυβα (stainless steel braided). Εσωτερικός σωλήνας Teflon PTFE υψηλής πίεσης. Εξαλείφει τη διόγκωση του λάστιχου και παρέχει άμεση αίσθηση φρένου — σημαντική αναβάθμιση έναντι OEM.',
    images: ['/images/placeholder.jpg'],
    price: 42.0,
    brand: 'AVL',
    rating: 4.7,
    numReviews: 16,
    stock: 20,
    isFeatured: false,
    banner: null,
    specs: {
      length: '90cm',
      innerDiameter: '3.2mm',
      burstPressure: '350 bar',
      material: 'PTFE / Stainless Steel Braid',
      fittings: 'Banjo 10mm — εκατέρωθεν',
      position: 'Εμπρός',
    },
  },
  {
    name: 'Μαρκούτσι φρένου πίσω inox πλεξούδα 55cm',
    slug: 'markoutsi-frenou-piso-inox-pleksouda-55cm',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'markoutsia-frenon-motosykletas',
    description:
      'Ενισχυμένο μαρκούτσι οπίσθιου φρένου 55cm με πλεξούδα inox και εσωτερικό Teflon PTFE. Κατάλληλο για sport, naked και touring μοτοσυκλέτες. Αντοχή σε θερμοκρασίες –40°C έως +230°C και πίεση λειτουργίας 200 bar.',
    images: ['/images/placeholder.jpg'],
    price: 35.0,
    brand: 'AVL',
    rating: 4.5,
    numReviews: 10,
    stock: 25,
    isFeatured: false,
    banner: null,
    specs: {
      length: '55cm',
      innerDiameter: '3.2mm',
      burstPressure: '350 bar',
      material: 'PTFE / Stainless Steel Braid',
      fittings: 'Banjo 10mm — εκατέρωθεν',
      position: 'Πίσω',
    },
  },
  {
    name: 'Κιτ μαρκούτσια Teflon εμπρός + πίσω',
    slug: 'kit-markoutsia-teflon-empros-piso-motosykletas',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'markoutsia-frenon-motosykletas',
    description:
      'Πλήρες κιτ μαρκούτσια φρένων Teflon (εμπρός 90cm + πίσω 55cm) με όλα τα ρακόρ banjo και ροδέλες χαλκού. Κατασκευή AVL με διπλή πλεξούδα inox για μέγιστη ασφάλεια. Προσυναρμολογημένα — έτοιμα για τοποθέτηση. Εξοικονομήστε 15% σε σχέση με μεμονωμένη αγορά.',
    images: ['/images/placeholder.jpg'],
    price: 65.0,
    brand: 'AVL',
    rating: 4.8,
    numReviews: 8,
    stock: 12,
    isFeatured: true,
    banner: null,
    specs: {
      contents: 'Εμπρός 90cm + Πίσω 55cm + 4x Banjo bolts + 8x Copper washers',
      innerDiameter: '3.2mm',
      burstPressure: '350 bar',
      material: 'PTFE / Double Stainless Steel Braid',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ΡΑΚΟΡ ΜΟΤΟΣΥΚΛΕΤΑΣ
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: 'Λαδοβίδα banjo M10x1.0 ανοξείδωτη',
    slug: 'ladovida-banjo-m10x1-0-anokseidoti',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'rakor-motosykletas',
    description:
      'Λαδοβίδα (banjo bolt) M10x1.0 από ανοξείδωτο χάλυβα A2-70 για σύνδεση μαρκούτσιου φρένου σε δαγκάνα ή αντλία. Κατάλληλη για Honda, Suzuki και Kawasaki. Μονή διέλευση (single) με εσωτερική τρύπα φιλτραρίσματος.',
    images: ['/images/placeholder.jpg'],
    price: 5.5,
    brand: 'AVL',
    rating: 4.5,
    numReviews: 30,
    stock: 100,
    isFeatured: false,
    banner: null,
    specs: {
      thread: 'M10x1.0',
      material: 'Stainless Steel A2-70',
      type: 'Single banjo bolt',
      compatibleBrands: ['Honda', 'Suzuki', 'Kawasaki'],
    },
  },
  {
    name: 'Λαδοβίδα banjo M10x1.25 ανοξείδωτη',
    slug: 'ladovida-banjo-m10x1-25-anokseidoti',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'rakor-motosykletas',
    description:
      'Λαδοβίδα (banjo bolt) M10x1.25 από ανοξείδωτο χάλυβα A2-70 για σύνδεση μαρκούτσιου φρένου. Βήμα 1.25mm — κατάλληλη κυρίως για Yamaha και ορισμένα μοντέλα Ducati. Μονή διέλευση με εσωτερικό φίλτρο.',
    images: ['/images/placeholder.jpg'],
    price: 5.5,
    brand: 'AVL',
    rating: 4.4,
    numReviews: 24,
    stock: 100,
    isFeatured: false,
    banner: null,
    specs: {
      thread: 'M10x1.25',
      material: 'Stainless Steel A2-70',
      type: 'Single banjo bolt',
      compatibleBrands: ['Yamaha', 'Ducati'],
    },
  },
  {
    name: 'Σετ ροδέλες χαλκού M10 φρένων (10 τεμ.)',
    slug: 'set-rodeles-xalkou-m10-frenon-10tem',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'rakor-motosykletas',
    description:
      'Σετ 10 τεμαχίων ροδέλες σύνθλιψης χαλκού (crush washers) M10 για λαδοβίδες banjo φρένων μοτοσυκλέτας. Απαραίτητες κατά την αντικατάσταση μαρκούτσιου ή αλλαγή υγρού φρένων — χρησιμοποιούνται πάντα καινούργιες για στεγανότητα.',
    images: ['/images/placeholder.jpg'],
    price: 6.0,
    brand: 'AVL',
    rating: 4.6,
    numReviews: 35,
    stock: 150,
    isFeatured: false,
    banner: null,
    specs: {
      innerDiameter: '10mm',
      outerDiameter: '14mm',
      thickness: '1.0mm',
      material: 'Copper (ανοπτημένος χαλκός)',
      quantity: 10,
    },
  },
  {
    name: 'Κιτ προσαρμογής γραμμής φρένου μοτοσυκλέτας',
    slug: 'kit-prosarmogis-grammis-frenou-motosykletas',
    category: 'Ανταλλακτικά Μοτοσυκλέτας',
    categorySlug: 'rakor-motosykletas',
    description:
      'Κιτ προσαρμογής (adapter kit) για σύνδεση aftermarket μαρκούτσιου φρένου σε OEM δαγκάνες και αντλίες. Περιέχει: 2x banjo M10x1.0, 2x banjo M10x1.25, 8x ροδέλες χαλκού, 1x αντάπτορας M10→M12 και 1x βίδα εξαέρωσης M8. Καλύπτει όλες τις ιαπωνικές και ευρωπαϊκές μοτοσυκλέτες.',
    images: ['/images/placeholder.jpg'],
    price: 22.0,
    brand: 'AVL',
    rating: 4.7,
    numReviews: 12,
    stock: 20,
    isFeatured: false,
    banner: null,
    specs: {
      contents:
        '2x Banjo M10x1.0, 2x Banjo M10x1.25, 8x Copper washers, 1x M10→M12 adapter, 1x M8 bleeder',
      material: 'Stainless Steel / Copper',
      compatibility: 'Universal ιαπωνικές & ευρωπαϊκές',
    },
  },
]

// ── Full catalog export ───────────────────────────────────────────────────────

const motorcycleCatalog = {
  categories: motorcycleCategories,
  products: motorcycleProducts,
}

export default motorcycleCatalog
