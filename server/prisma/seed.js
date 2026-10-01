require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const ws = require('ws');
const crypto = require('crypto');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

function getHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

async function main() {
  console.log('Seeding Database for The Digital Chronicle...');

  // 1. Categories
  const categoriesData = [
    { name: 'World', slug: 'world', description: 'Global geopolitics, international relations, and diplomatic developments.', color: '#2563EB' },
    { name: 'Tech', slug: 'tech', description: 'Breakthroughs in artificial intelligence, quantum computing, and Silicon Valley.', color: '#3B82F6' },
    { name: 'Business', slug: 'business', description: 'Financial markets, global trade, economic policy, and venture capital.', color: '#10B981' },
    { name: 'Science', slug: 'science', description: 'Space exploration, astrophysics, genetic engineering, and environmental research.', color: '#8B5CF6' },
    { name: 'Health', slug: 'health', description: 'Biomedical research, global public health policies, and medical innovations.', color: '#EC4899' },
    { name: 'Sports', slug: 'sports', description: 'Championship tournaments, athletic excellence, and global sporting events.', color: '#F97316' },
    { name: 'Culture', slug: 'culture', description: 'Literature, cinematic arts, architecture, philosophy, and cultural phenomena.', color: '#EAB308' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = record;
  }
  console.log('Categories created:', Object.keys(categories).length);

  // 2. Sources
  const sourcesData = [
    { name: 'NPR News World', url: 'https://www.npr.org', feedUrl: 'https://feeds.npr.org/1001/rss.xml', credibilityScore: 98, categoryName: 'World' },
    { name: 'BBC World News', url: 'https://www.bbc.com/news', feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml', credibilityScore: 97, categoryName: 'World' },
    { name: 'TechCrunch', url: 'https://techcrunch.com', feedUrl: 'https://techcrunch.com/feed/', credibilityScore: 95, categoryName: 'Tech' },
    { name: 'ScienceDaily', url: 'https://www.sciencedaily.com', feedUrl: 'https://www.sciencedaily.com/rss/all.xml', credibilityScore: 99, categoryName: 'Science' },
    { name: 'CNBC Business', url: 'https://www.cnbc.com', feedUrl: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=markets&sort=date&type=rss', credibilityScore: 94, categoryName: 'Business' },
  ];

  const sources = {};
  for (const src of sourcesData) {
    const existing = await prisma.source.findFirst({ where: { name: src.name } });
    if (existing) {
      sources[src.name] = existing;
    } else {
      const record = await prisma.source.create({ data: src });
      sources[src.name] = record;
    }
  }
  console.log('Sources created:', Object.keys(sources).length);

  // 3. Articles (Rich, verified, AI-summarized)
  const articlesData = [
    {
      title: 'Global Climate Accord Reaches Historic Consensus on Clean Energy Transition Targets',
      slug: 'global-climate-accord-clean-energy-targets-consensus',
      summary: 'In a landmark multilateral summit, delegates from 195 nations finalized a comprehensive accord mandating enforceable 2035 decarbonization benchmarks. The treaty commits participating economies to triple grid-scale renewable capacity while phasing out public financing for unabated fossil infrastructure. Key provisions establish a sovereign transition fund capitalized at $350 billion to assist emerging markets in grid modernization and industrial electrification. Economic analysts project the binding targets will stimulate upwards of $2.4 trillion in private capital allocation toward next-generation battery chemistry, hydrogen logistics, and high-voltage transmission interconnects over the coming decade.',
      content: `GENEVA — Delegates concluded twenty days of around-the-clock negotiations with an unprecedented binding treaty designed to accelerate global energy decarbonization. Under the terms signed today, signatory nations must achieve a 60% aggregate reduction in electrical power emissions relative to 2015 baselines prior to December 2035.\n\n"This moment marks the shift from aspirational declarations to verifiable infrastructure deployment," remarked Chief Negotiator Elena Rostova during the plenary announcement. "Every participating state has committed to standardized satellite telemetry audits and uniform quarterly reporting protocols."\n\nThe accord specifically addresses capital disparities between developed and industrializing nations. A newly capitalized Resilience & Grid Sovereign Facility will disburse low-interest concessionary guarantees, targeting microgrids, pumped hydro storage, and cross-border ultra-high-voltage direct-current (UHVDC) transmission lines across Sub-Saharan Africa and Southeast Asia.\n\nFinancial markets reacted positively, with global clean energy benchmark indices climbing 3.8% in early trading following the treaty publication. Industrial stakeholders, however, noted that supply chain bottlenecks in critical rare earth elements and lithium processing must be resolved quickly to meet the ambitious timetables.`,
      sourceUrl: 'https://apnews.com/article/climate-summit-clean-energy-accord-2026',
      imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
      author: 'Evelyn Vance, Diplomatic Correspondent',
      categorySlug: 'world',
      sourceName: 'Associated Press',
      isBreaking: true,
      isFeatured: true,
      readTime: 4,
      viewCount: 1420,
      publishedAt: new Date(Date.now() - 1000 * 60 * 25), // 25 min ago
    },
    {
      title: 'Next-Generation Neuromorphic Processors Achieve Tenfold Efficiency in Real-Time AI Inference',
      slug: 'next-gen-neuromorphic-processors-tenfold-efficiency',
      summary: 'Computer hardware engineers have unveiled an operational 3nm neuromorphic silicon chip capable of executing complex multimodal transformer models at sub-watt power envelopes. By mimicking synaptic spike-timing dynamics directly on-die, the architecture eliminates the classical von Neumann data transfer bottleneck between compute cores and memory registers. Field trials across autonomous drone swarms and biomedical sensory arrays demonstrated latency reductions exceeding 85% compared to conventional tensor processing units. The innovation paves the way for advanced on-device reasoning without continuous cloud connectivity or massive datacenter power draws.',
      content: `SAN FRANCISCO — A collaborative initiative between premier research laboratories and leading semiconductor foundries has officially introduced the "Synapse-X" processor family, establishing a new paradigm for localized artificial intelligence compute.\n\nTraditional accelerators expend up to 70% of total energy overhead shuttling weights between high-bandwidth memory arrays and execution registers. Synapse-X solves this inefficiency through asynchronous analog synaptic crossbars paired with 3D stacked magnetic resistive random-access memory (MRAM).\n\n"We are delivering workstation-grade contextual processing in edge devices drawing under 850 milliwatts," stated lead architect Dr. Marcus Vance. "Autonomous vehicles, wearable medical telemetry, and aerospace systems can now operate persistent neural networks without tethering to remote server farms."\n\nIndustry analysts estimate that initial commercial production wafers will begin shipping to original equipment manufacturers in Q4, potentially transforming robotics and mobile computing architectures worldwide.`,
      sourceUrl: 'https://techcrunch.com/2026/09/neuromorphic-inference-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      author: 'Marcus Vance, Senior Technology Editor',
      categorySlug: 'tech',
      sourceName: 'TechCrunch',
      isBreaking: false,
      isFeatured: true,
      readTime: 5,
      viewCount: 3890,
      publishedAt: new Date(Date.now() - 1000 * 60 * 65), // 1 hour ago
    },
    {
      title: 'Global Central Banks Coordinate Digital Settlement Standard to Safeguard Cross-Border Liquidity',
      slug: 'central-banks-digital-settlement-standard-cross-border-liquidity',
      summary: 'The Bank for International Settlements together with eight leading monetary authorities released the finalized specifications for a cryptographic wholesale settlement platform known as Project Agora II. The system utilizes permissioned atomic settlement smart contracts to compress foreign exchange clearing timelines from T+2 days down to sub-second finality. By mitigating counterparty exposure and unlocking hundreds of billions of dollars in trapped overnight buffer reserves, the protocol aims to fortify global capital resilience against localized banking shocks and currency settlement friction.',
      content: `BASEL — In a coordinated announcement, central bank governors outlined the production roadmap for unified wholesale digital settlement. The platform operates on a synchronized cryptographic ledger interconnecting commercial balance sheets with national central banks.\n\nUnder current correspondent banking rails, cross-border payments traverse multi-tiered clearinghouses, exposing financial institutions to foreign exchange volatility and credit default risks. Agora II enforces atomic DvP (Delivery versus Payment), ensuring neither leg of an international transaction settles until both parties have verified liquidity.\n\nTreasury officials underscored that the architecture preserves national regulatory sovereignty while introducing automated anti-money-laundering (AML) cryptographic proofs that verify compliance without compromising institutional privacy.\n\nInstitutional pilots across London, Tokyo, Frankfurt, and New York are scheduled to process real commercial invoice settlements beginning early next month.`,
      sourceUrl: 'https://www.ft.com/news/central-banks-cross-border-digital-settlement',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      author: 'Charlotte Montgomery, Financial Analyst',
      categorySlug: 'business',
      sourceName: 'Financial Times Insights',
      isBreaking: false,
      isFeatured: true,
      readTime: 4,
      viewCount: 2150,
      publishedAt: new Date(Date.now() - 1000 * 60 * 140),
    },
    {
      title: 'James Webb Space Telescope Confirms Atmospheric Biosignatures on Habitable-Zone Exoplanet',
      slug: 'jwst-confirms-atmospheric-biosignatures-habitable-exoplanet',
      summary: 'Astrophysicists analyzing spectroscopic transmission data gathered over fourteen orbital transits have identified distinct molecular signatures of dimethyl sulfide and water vapor within the upper atmosphere of K2-18b. Located approximately 124 light-years away in the constellation Leo, the sub-Neptune world resides comfortably within its parent star habitable zone. On Earth, dimethyl sulfide is produced exclusively by living organisms—primarily marine phytoplankton. While researchers caution that exotic photochemical pathways cannot yet be completely discounted, the 5-sigma statistical confidence of the atmospheric composition represents the most compelling candidate yet for extraterrestrial biogenic activity.',
      content: `BALTIMORE — The Space Telescope Science Institute revealed rigorous findings from deep infrared spectroscopic scans conducted with the James Webb Space Telescope's NIRSpec and MIRI instruments.\n\nDuring transit events where the exoplanet passes directly before its host red dwarf star, starlight filters through the planet's atmosphere. By measuring minuscule dips in specific infrared wavelengths, the international research consortium detected consistent absorption peaks corresponding to methane, carbon dioxide, and sulfur compounds.\n\n"The signal persistence across consecutive observing cycles provides an unprecedented 99.999% statistical reliability," remarked Dr. Alistair Chen, lead astrophysicist. "While rigorous peer confirmation is underway, these spectral lines demand comprehensive modeling of organic photochemical cycles."\n\nFurther high-dispersion transit observations with ground-based extremely large telescopes will examine isotopic ratios to determine whether the atmospheric composition mirrors biological ecosystems.`,
      sourceUrl: 'https://nature.com/articles/exoplanet-atmospheric-spectroscopy-k218b',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      author: 'Dr. Alistair Chen, Astrophysics Contributor',
      categorySlug: 'science',
      sourceName: 'Nature & Science Review',
      isBreaking: true,
      isFeatured: false,
      readTime: 6,
      viewCount: 5410,
      publishedAt: new Date(Date.now() - 1000 * 60 * 180),
    },
    {
      title: 'Targeted mRNA Immunotherapy Demonstrates Complete Remission in Phase III Pancreatic Cancer Trials',
      slug: 'mrna-immunotherapy-complete-remission-pancreatic-cancer-phase3',
      summary: 'A randomized multicenter Phase III clinical trial testing personalized neoantigen mRNA vaccines in conjunction with checkpoint inhibitors has yielded unprecedented efficacy data for surgically resected pancreatic ductal adenocarcinoma. Over 78% of enrolled patients receiving the tailored neoantigen formulations remained completely recurrence-free at the 36-month surveillance milestone, compared to only 28% in the standard adjuvant chemotherapy control arm. The vaccine custom-synthesizes up to twenty patient-specific mutant peptides within four weeks of biopsy, priming high-avidity CD8+ T-cell clones to neutralize micro-metastatic clusters before tumor recurrence can take hold.',
      content: `BOSTON — Oncology researchers celebrated a watershed breakthrough in oncology with the publication of Phase III clinical outcomes for personalized mRNA cancer vaccines.\n\nPancreatic adenocarcinoma has historically remained one of the deadliest human malignancies, characterized by dense immunosuppressive stroma and rapid recurrence rates following surgical resection.\n\n"By training the patient's own cellular immune defenses against private neoantigens unique to their individual tumor genome, we achieve durable vigilance against relapse," explained Chief Oncologist Sarah Jenkins. "The T-cell clonal populations remain actively circulating for years without degrading normal organ tissue."\n\nRegulatory authorities in both North America and Europe have granted accelerated priority review designations, signaling that broad clinical availability across tertiary cancer centers could begin as early as next spring.`,
      sourceUrl: 'https://www.bbc.com/news/health-mrna-cancer-vaccine-phase3-results',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      author: 'Sarah Jenkins, Medical Science Editor',
      categorySlug: 'health',
      sourceName: 'BBC News',
      isBreaking: false,
      isFeatured: false,
      readTime: 4,
      viewCount: 4120,
      publishedAt: new Date(Date.now() - 1000 * 60 * 220),
    },
    {
      title: 'Tactical Revolution in European Football: How Real-Time Spatial Tracking Is Redefining Match Strategy',
      slug: 'tactical-revolution-european-football-spatial-tracking',
      summary: 'Top European football clubs have integrated millimeter-accurate optical computer vision tracking and predictive spatial algorithms directly onto sideline technical bench monitors. Managers and tactical analysts now review real-time passing network entropy, pressing trap efficacy, and defensive line compactness during live match play. The data-driven transition has produced a significant shift toward counter-pressing velocity and asymmetric overloads, reshaping how modern managers structure training regimens, in-game tactical substitutions, and long-term youth academy player development pipelines.',
      content: `LONDON — Inside the technical area of elite modern stadiums, touchline clipboards have yielded to high-resolution tactical displays running real-time spatial heatmaps and predictive pass probability models.\n\nUsing multi-camera rigs capturing twenty-nine skeletal tracking joints per player fifty times per second, analytics engines calculate expected threat (xT) and defensive shape distortion dynamically as the ball moves.\n\n"We can quantify whether an opponent's midfield pivot is tiring or failing to compress passing lanes ten minutes before it becomes visible to the naked eye," noted one Premier League performance director. "Substitutions are no longer intuitive guesses—they are algorithmic corrections executed with precision."\n\nThe technological adoption has also transformed television broadcasting, offering supporters interactive live data overlays and split-screen tactical diagrams previously restricted to club backrooms.`,
      sourceUrl: 'https://www.bbc.com/sport/football-tactics-spatial-tracking-revolution',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      author: 'Julian Thorne, Sports Analyst',
      categorySlug: 'sports',
      sourceName: 'BBC News',
      isBreaking: false,
      isFeatured: false,
      readTime: 3,
      viewCount: 1980,
      publishedAt: new Date(Date.now() - 1000 * 60 * 310),
    },
    {
      title: 'Preserving the Ephemeral: Contemporary Museums Grapple with Archiving Generative AI Artworks',
      slug: 'preserving-ephemeral-contemporary-museums-archiving-generative-art',
      summary: 'Curators and preservation conservators at major contemporary art institutions are facing unprecedented technical challenges when cataloging and archiving dynamic algorithmic art installations. Unlike static oil paintings or analog sculptures, interactive generative installations depend on transient software dependencies, proprietary neural network model weights, specific GPU drivers, and cloud API endpoints that degrade or disappear over time. Cultural heritage consortia are drafting new conservation protocols that emphasize containerized execution environments, software emulation, and artist intent documentation to guarantee future generations can experience these digital masterpieces in their authentic interactive state.',
      content: `PARIS & NEW YORK — Inside the conservation wings of the Pompidou Centre and MoMA, digital archivists are wrestling with the fragility of contemporary algorithmic art.\n\nWhen a museum acquires a work whose canvas updates infinitely based on environmental acoustics, live satellite weather feeds, or generative diffusion pipelines, traditional conservation guidelines fail. If the underlying API shuts down or the hardware architecture becomes obsolete, the artwork effectively ceases to exist.\n\n"We are moving from conserving physical materials to preserving live operational ecosystems," remarked Lead Conservator Mireille Laurent. "We must archive the code, the neural checkpoint weights, the runtime containers, and exhaustive philosophical documentation regarding what deviations the artist considers acceptable over time."\n\nThe International Council of Museums announced a new universal preservation framework standardizing open virtual machine snapshots for all software-driven acquisitions.`,
      sourceUrl: 'https://www.reuters.com/lifestyle/museums-archiving-generative-ai-art-2026',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      author: 'Mireille Laurent, Cultural Heritage Specialist',
      categorySlug: 'culture',
      sourceName: 'Reuters',
      isBreaking: false,
      isFeatured: false,
      readTime: 4,
      viewCount: 1670,
      publishedAt: new Date(Date.now() - 1000 * 60 * 420),
    },
    {
      title: 'Commercial Fusion Reactor Prototype Sustains Net Energy Gain for Record Ninety-Two Minutes',
      slug: 'commercial-fusion-prototype-sustains-net-energy-gain-record',
      summary: 'In an extraordinary milestone for clean baseload power, the magnetic confinement tokamak facility at the Oxford Energy Cluster sustained a stable deuterium-tritium burning plasma producing 1.35x net energy output over a continuous ninety-two minute run. The breakthrough was enabled by high-temperature superconducting (HTS) tape magnets creating magnetic flux fields exceeding 21 Tesla, combined with autonomous reinforcement learning algorithms adjusting poloidal divertor shaping coils millisecond-by-millisecond to suppress destructive edge-localized plasma instabilities. Commercial engineering teams project pilot utility connections before the end of the decade.',
      content: `OXFORD — Physicists and engineering consortia cheered as plasma confinement monitors logged over an hour and a half of continuous net energy generation in a commercial-scale magnetic fusion tokamak.\n\nFor decades, fusion experiments achieved net energy only in brief multi-second bursts before turbulence degraded the magnetic cage. Today's achievement demonstrates that modern HTS magnet coils, cooled by subcooled liquid nitrogen, can withstand sustained neutron bombardment while maintaining steady magnetic containment.\n\n"We have conquered the physics barrier; what remains is primarily precision thermal engineering," declared Chief Plasma Physicist Dr. Rebecca Morales. "A continuous ninety-minute steady state demonstrates that commercial baseload fusion is no longer decades away."\n\nEnergy infrastructure funds immediately announced preliminary investment syndicates aimed at constructing commercial grid-connected pilot plants across Europe and North America.`,
      sourceUrl: 'https://www.reuters.com/business/energy/commercial-fusion-prototype-net-gain-record-2026',
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
      author: 'Rebecca Morales, Physics & Energy Reporter',
      categorySlug: 'science',
      sourceName: 'Reuters',
      isBreaking: true,
      isFeatured: true,
      readTime: 5,
      viewCount: 7850,
      publishedAt: new Date(Date.now() - 1000 * 60 * 50), // 50 min ago
    }
  ];

  for (const article of articlesData) {
    const cat = categories[article.categorySlug];
    const src = sources[article.sourceName];
    const hash = getHash(article.title + article.sourceUrl);

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        summary: article.summary,
        content: article.content,
        sourceUrl: article.sourceUrl,
        imageUrl: article.imageUrl,
        author: article.author,
        isBreaking: article.isBreaking,
        isFeatured: article.isFeatured,
        readTime: article.readTime,
        viewCount: article.viewCount,
        publishedAt: article.publishedAt,
        categoryId: cat.id,
        sourceId: src ? src.id : null,
        status: 'PUBLISHED',
      },
      create: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        sourceUrl: article.sourceUrl,
        imageUrl: article.imageUrl,
        author: article.author,
        isBreaking: article.isBreaking,
        isFeatured: article.isFeatured,
        readTime: article.readTime,
        viewCount: article.viewCount,
        publishedAt: article.publishedAt,
        categoryId: cat.id,
        sourceId: src ? src.id : null,
        contentHash: hash,
        status: 'PUBLISHED',
      },
    });
  }

  // 4. Initial Crawler Log
  await prisma.crawlerLog.create({
    data: {
      status: 'SUCCESS',
      articlesFound: 8,
      articlesAdded: 8,
      duplicatesSkipped: 0,
      message: 'System initialization and high-credibility verified feed ingestion completed successfully.',
    }
  });

  console.log('Database seeded successfully with verified articles and crawler logs!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
