// ---------------------------------------------------------------------------
// Everything about you lives in this one file. Edit it and the whole site
// updates. No component changes required.
// ---------------------------------------------------------------------------

export const site = {
  /** Shown in the browser tab and in the header. */
  name: 'Jiaming Deng',
  /** Used for <title> and SEO. */
  title: 'Jiaming Deng',
  description:
    'Jiaming Deng — software engineer at TikTok in Dublin, building distributed storage infrastructure for the video platform and the AI agents that keep it on its feet.',
  /** Big heading on the home page. */
  heading: "Hi, I'm Jiaming!",
  /** Absolute URL of the deployed site (also set in astro.config.mjs). */
  url: 'https://djm-xjtu.github.io/homepage/',
  /** Where /cv/ redirects to. Set to null to hide the CV link entirely. */
  cv: '/files/cv.pdf',
};

/** Intro paragraphs on the home page. Plain strings, one per paragraph. */
export const intro: string[] = [
  "I'm a software engineer at TikTok in Dublin, building distributed storage infrastructure for the video platform. Most of what I do falls into three buckets: object caching, edge storage, and cache addressing — figuring out where a video byte lives and how to hand it back quickly without asking anyone for permission.",
  "More recently I've been building the on-call side of that too: a supervisor-based multi-agent system that does root cause analysis and self-recovery for five products on the platform, plus a pile of MCP tools it uses to do the job.",
  "Before TikTok I was a research assistant at the Gillan Lab in Trinity College Dublin, where I also did my MSc in Computer Science. Before that I studied Computer Science at Xi'an Jiaotong University.",
  "I like problems where correctness, latency and scale all pull in different directions. Caches are a good example: every performance win is also a new way to serve the wrong bytes.",
];

/** Short, human bullet points. Delete the section by emptying this array. */
export const funFacts: string[] = [
  'I work on caches that serve 10M+ QPS of video frame downloads, which means a bad day is measurable in percent.',
  'I built a centralised cache addressing service, ran it for a year, then designed the decentralised architecture that replaced it. Both were the right call at the time.',
  'I moved from Xi\u2019an to Dublin for grad school in 2022 and never left.',
  'Go is my daily driver; I also write Python, Java, JavaScript and C++ depending on who is asking.',
  'My Grafana MCP tools shipped to TikTok\u2019s internal MCP marketplace and are now used well beyond my own team.',
];

export type Link = { label: string; href: string };

/** "Let's connect" section. */
export const links: Link[] = [
  { label: 'GitHub', href: 'https://github.com/djm-xjtu' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jiaming-deng-60050a238/' },
];

/** Written out longhand so scrapers have to work for it. */
export const email = {
  display: 'jiamingdeng7 at gmail dot com',
  href: 'mailto:jiamingdeng7@gmail.com',
};

export type WorkItem = {
  from: string;
  to: string;
  company: string;
  role: string;
  location: string;
  /** One or two sentences on the home page / work page. */
  summary: string;
  /** Optional bullet points, only rendered on /work/. */
  highlights?: string[];
  href?: string;
};

/** Newest first. The home page shows the first four. */
export const work: WorkItem[] = [
  {
    from: 'Mar 2025',
    to: 'Present',
    company: 'TikTok',
    role: 'Software Engineer II',
    location: 'Dublin, Ireland',
    summary:
      'Distributed storage infrastructure for the video platform: object caching, edge storage and cache addressing, in Go, Python and Redis.',
    highlights: [
      'Distributed object cache optimisation — improved large-scale video frame delivery with multi-level cache routing across local cache, remote peer cache, RDMA cache and origin fallback, plus asynchronous write-back, capacity-aware eviction and runtime feature gates to cut origin load and raise cache availability.',
      'Edge storage service — built a large-scale edge redundancy system for 12k+ QPS of edge video uploads, using local object writes, dual-replica async replication, automatic peer discovery, WAL-based retry and disk-health governance across multi-PiB edge infrastructure.',
      'Decentralised cache addressing — designed and implemented a consistent-hashing addressing architecture with virtual nodes and Gossip-based topology discovery, replacing centralised metadata lookup with direct client-to-node routing to reduce lookup latency and improve read/write throughput.',
      'On-call AI Agent — built a supervisor-based multi-agent system with specialised MCP tools for automated root cause analysis and self-recovery across five video platform products, and published reusable Grafana MCP tools to TikTok\u2019s internal marketplace.',
    ],
  },
  {
    from: 'Nov 2023',
    to: 'Mar 2025',
    company: 'TikTok',
    role: 'Software Engineer I',
    location: 'Dublin, Ireland',
    summary:
      'Built and ran the object cache and cache addressing services behind video frame delivery.',
    highlights: [
      'Object cache service — developed and maintained a high-throughput object cache for video frame downloads with local cache reads, origin fallback, asynchronous write-back and cache prewarming, serving 10M+ QPS at an 82%+ hit rate across the video platform.',
      'Centralised cache addressing service — developed and maintained a high-throughput addressing service backed by in-memory indexing and Redis, giving reliable object-to-cache-node lookup for small-object video caching at scale.',
    ],
  },
  {
    from: 'Jun 2023',
    to: 'Oct 2023',
    company: 'Trinity College Dublin — Gillan Lab',
    role: 'Software Engineer, Research Assistant',
    location: 'Dublin, Ireland',
    summary:
      'Web applications and services for neuroscience research staff, against fast-moving research requirements. JavaScript, React, MongoDB.',
    highlights: [
      'Research web applications — developed and tested React/JavaScript applications and MongoDB-backed services for lab staff to view, analyse and export neuroscience research data.',
      'Data retrieval optimisation — improved retrieval performance by 30% by removing redundant data processing and tuning streaming pipelines and Gzip compression.',
      "Participant data access control — built a permission-management application and backend services so researchers could manage and enforce access to participants' experimental data.",
      'Developer tooling and documentation — documented the web server API endpoints and exposed them through a web interface so developers could inspect the services behind the lab\u2019s applications.',
    ],
  },
  {
    from: 'Mar 2023',
    to: 'Jun 2023',
    company: 'GrabVoice',
    role: 'Software Engineer Intern',
    location: 'Dublin, Ireland',
    summary:
      'Early-stage startup — built the main service, including its distributed and microservice pieces. Go, Gin, MySQL, MongoDB.',
    highlights: [
      'Implemented authentication and authorisation to control per-user access to the service.',
      'Designed expiry strategies for deals, covering both logical and permanent deletion.',
      'Deployed and operated the project on AWS EC2 and adopted S3 as the primary storage backend.',
    ],
  },
];

export type EducationItem = {
  from: string;
  to: string;
  school: string;
  degree: string;
  location: string;
};

export const education: EducationItem[] = [
  {
    from: 'Sep 2022',
    to: 'Jun 2023',
    school: 'Trinity College Dublin',
    degree: 'MSc in Computer Science',
    location: 'Dublin, Ireland',
  },
  {
    from: 'Sep 2018',
    to: 'Jul 2022',
    school: "Xi'an Jiaotong University",
    degree: 'BEng in Computer Science',
    location: "Xi'an, China",
  },
];

/** Grouped technical skills, rendered on /work/. */
export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['Go', 'Java', 'Python', 'JavaScript', 'C++'] },
  {
    group: 'AI & agent tools',
    items: ['Eino', 'LangGraph', 'LangChain', 'MCP', 'Codex', 'Claude Code'],
  },
  { group: 'Backend frameworks', items: ['Gin', 'Spring Boot', 'Express', 'Kitex', 'Hertz'] },
  {
    group: 'Data & infrastructure',
    items: ['Redis', 'MySQL', 'MongoDB', 'RocketMQ', 'Object Storage', 'Kubernetes'],
  },
];
