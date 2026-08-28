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
    'Jiaming Deng — software engineer at TikTok in Dublin, working on video platform storage middleware and Oncall AI Agent services.',
  /** Big heading on the home page. */
  heading: "Hi, I'm Jiaming!",
  /** Absolute URL of the deployed site (also set in astro.config.mjs). */
  url: 'https://djm-xjtu.github.io/homepage/',
  /** Where /cv/ redirects to. Set to null to hide the CV link entirely. */
  cv: '/files/cv.pdf',
};

/** Intro paragraphs on the home page. Plain strings, one per paragraph. */
export const intro: string[] = [
  "I'm a software engineer at TikTok in Dublin, working on the video platform. My day job sits at two ends of the stack: the storage middleware that moves video bytes around, and the Oncall AI Agent services that keep all of it running.",
  "Before TikTok I was a research assistant at Trinity College Dublin, where I also did my MSc in Computer Science. Before that I studied Computer Science at Xi'an Jiaotong University.",
  "I like problems where correctness, latency and scale all pull in different directions — caches, addressing, replication — and lately I've been spending a lot of time teaching agents to debug the systems I used to page myself for.",
];

/** Short, human bullet points. Delete the section by emptying this array. */
export const funFacts: string[] = [
  'I work on caches that serve 10M+ QPS of video frame downloads, which means a bad day is measurable in percent.',
  'I moved from Xi\u2019an to Dublin for grad school in 2022 and never left.',
  'Go is my daily driver; I also write Python, Java, JavaScript and C++ depending on who is asking.',
  'I built an Oncall AI Agent from scratch — a supervisor that routes to specialised sub-agents, each with its own MCP tools and prompts.',
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
    from: 'Nov 2023',
    to: 'Present',
    company: 'TikTok',
    role: 'Software Engineer',
    location: 'Dublin, Ireland',
    summary:
      'Video platform — storage middleware and Oncall AI Agent services. Go, Python, MySQL, MongoDB, Redis, object storage, RocketMQ, Eino, LangGraph.',
    highlights: [
      'Built and ran a small-object cache storage service serving 10M+ QPS of video frame downloads at an 82%+ hit rate.',
      'Built and ran an edge redundancy storage service handling 12k+ QPS of video uploads across edge clusters.',
      'Designed a decentralised cache addressing architecture — consistent hashing with virtual nodes plus Gossip-based topology discovery — replacing a central lookup service so clients route straight to the target node, cutting metadata lookup latency and lifting read/write throughput.',
      'Built an Oncall AI Agent from scratch: a multi-agent architecture where a supervisor selects specialised sub-agents, each with their own MCP tools and prompts, which improves accuracy and stops tool misuse. Now doing automated RCA and self-recovery for five products on the video platform.',
      'Developed a broad set of MCPs and Skills over TikTok private cloud and internal systems — Kubernetes, configuration centre, metrics, Grafana, object storage, Redis — plus video-platform-specific tooling. The Grafana MCP tools were published to the internal MCP marketplace and picked up widely.',
    ],
  },
  {
    from: 'Jun 2023',
    to: 'Oct 2023',
    company: 'Trinity College Dublin',
    role: 'Software Engineer, Research Assistant',
    location: 'Dublin, Ireland',
    summary:
      'Microservices and fast-moving, research-facing requirements. JavaScript, React, MongoDB.',
    highlights: [
      'Optimised the data-fetching algorithm for researchers by removing redundant data and introducing multiple stream pipelines plus Gzip, a 30% improvement in retrieval.',
      'Built a well-tested web application for researchers to view, analyse and export neuroscientific data, with documented webserver endpoints for developers.',
      "Built a permission-management server and UI so researchers could control access to citizens' experimental data.",
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
  { group: 'LLM services & tools', items: ['Eino', 'LangChain', 'LangGraph', 'Codex', 'Claude Code'] },
  { group: 'Backend frameworks', items: ['Gin', 'Spring Boot', 'Express', 'Kitex', 'Hertz'] },
  { group: 'Data & storage', items: ['Redis', 'MySQL', 'MongoDB', 'RocketMQ', 'Object Storage'] },
];
