// Single source of truth for all portfolio content.
// Update this file when the CV changes — every section reads from here.

export const profile = {
  name: "Aayash Ahmad",
  shortName: "Aayash Ahmad",
  role: "React.js & React Native Developer",
  location: "Pulwama, Jammu & Kashmir, India",
  email: "aayash.bhat.dev@gmail.com",
  phone: "+91 7006052604",
  photo: `${process.env.PUBLIC_URL}/aayash-profile.jpg`,
  cv: `${process.env.PUBLIC_URL}/aayash_CV.pdf`,
  available: true,
  tagline:
    "I work on the web and mobile apps at Kupos.cl, a bus ticket booking platform in Chile. Most of my days go into booking screens, payment flows, and fixing whatever QA sends back.",
  about: [
    "I'm a frontend developer from Pulwama, Kashmir. For the last year and a bit I've been writing React and React Native code that real customers use every day.",
    "At work I move between the mobile app and the server-rendered website. I build screens, hook them up to APIs, and fix bugs. There have been a lot of bugs: layout issues, translations that don't fit, payment steps that break on one phone and not another. I've learned more from fixing those than from anything else.",
    "In my free time I build small projects with Next.js, Express, and Python. Right now I'm learning Go.",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/aayashahmad", icon: "fab fa-github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aayash-ahmad-185036242", icon: "fab fa-linkedin-in" },
    { label: "Email", href: "mailto:aayash.bhat.dev@gmail.com", icon: "fas fa-envelope" },
  ],
};

export const stats = [
  { value: "1+", label: "Year at Kupos.cl" },
  { value: "100+", label: "Bugs fixed" },
  { value: "20–30%", label: "Less time per new screen" },
  { value: "30+", label: "Public repos" },
];

export const experience = [
  {
    role: "React JS & React Native Developer",
    company: "Kupos.cl",
    href: "https://www.kupos.cl",
    period: "Apr 2025 – Present",
    current: true,
    points: [
      "I work on both the React Native app and the server-rendered React website. They live in separate repos, and paying customers use both.",
      "I built shared components and navigation flows that we now reuse. A new screen takes us roughly 20–30% less time than it used to.",
      "I've fixed more than 100 bugs in the UI, translations, and payment flows, so fewer tickets come back from QA.",
      "I connect the booking, payment, and dashboard screens to our REST APIs.",
      "We work in two-week sprints on Jira. My code goes through review with the backend, QA, and product teams.",
    ],
    tags: ["React", "React Native", "SSR", "REST", "Jira"],
  },
  {
    role: "Web Development Intern",
    company: "OctaNet Services Pvt. Ltd.",
    period: "Dec 2023 – Jan 2024",
    points: [
      "Turned design mockups into responsive pages with HTML, CSS, and JavaScript.",
      "Fixed layouts that looked right in one browser and broken in another.",
      "Helped the senior developers with frontend changes and learned to use Git properly.",
    ],
    tags: ["HTML", "CSS", "JavaScript", "Git"],
  },
];

export const projects = [
  {
    title: "ParkPass",
    kind: "Real-time booking platform",
    description:
      "You can see which tickets are available right now and get yours instantly. Operators get their own admin dashboard to see bookings and usage.",
    stack: ["React.js", "Node.js", "Express"],
    repo: "https://github.com/aayashahmad/frontend-parkpass",
    featured: true,
  },
  {
    title: "Billing App",
    kind: "Cross-platform mobile app",
    description:
      "A billing app made with Expo. You can scan with the camera, make QR codes, and print bills on a Bluetooth printer. The backend is a separate Python API.",
    stack: ["React Native", "Expo", "Formik", "Python"],
    repo: "https://github.com/aayashahmad/frontend-billingApp",
    featured: true,
  },
  {
    title: "AI Security Scanner",
    kind: "AI-assisted security tool",
    description:
      "Give it the URL of a site you own. It crawls the pages, checks HTTPS, certificates, headers, and cookies, and gives you a score plus suggestions on what to fix.",
    stack: ["Node.js", "Express", "Cheerio", "WebSockets"],
    repo: "https://github.com/aayashahmad/AI-Security-Scanner",
    live: "https://ai-security-scanner.vercel.app",
    image: `${process.env.PUBLIC_URL}/projects/ai-security-scanner.jpg`,
  },
  {
    title: "Kashmir Homestays",
    kind: "MCA final-year project",
    description:
      "My MCA final-year project. Guests can search and book homestays in Kashmir, and owners manage their listings from an admin panel. It works on phones and desktops.",
    stack: ["Next.js", "MUI", "i18next"],
    repo: "https://github.com/aayashahmad/kashmir-hmStays",
  },
  {
    title: "Ricky Restaurants",
    kind: "Restaurant website",
    description:
      "A website for a restaurant in Dubai Marina, in English and Arabic, with the menu, catering, and table bookings. Made with the Next.js App Router.",
    stack: ["Next.js", "React 19"],
    repo: "https://github.com/aayashahmad/rickyrestaurants",
    live: "https://rickyrestaurants.vercel.app",
    image: `${process.env.PUBLIC_URL}/projects/ricky-restaurants.jpg`,
  },
  {
    title: "QuizFlow Pro",
    kind: "Quiz web app",
    description: "A small quiz app written in plain JavaScript and CSS, with no framework.",
    stack: ["JavaScript", "CSS"],
    repo: "https://github.com/aayashahmad/QuizFlow-Pro",
  },
];

// Work projects live in private company repos, so there are no links here.
export const privateWork = [
  {
    title: "Kupos.cl website",
    kind: "Work · Private repo",
    description:
      "The main Kupos booking site. It has two server-rendered React builds, one for desktop and one for mobile browsers, and I work on both.",
    stack: ["React", "SSR", "REST APIs"],
  },
  {
    title: "Kupos mobile app",
    kind: "Work · Private repo",
    description:
      "The React Native app people use to search for bus trips, book tickets, and pay. I build screens and fix bugs in the booking and payment steps.",
    stack: ["React Native", "REST APIs"],
  },
  {
    title: "Bus operator sites and apps",
    kind: "Work · Private repos",
    description:
      "Kupos also runs branded booking websites and apps for bus companies in Chile and Peru. There are more than 20 of these repos, and a fix in one often has to go into the others too.",
    stack: ["React", "React Native", "SSR"],
  },
];

export const skills = [
  {
    group: "Frontend",
    icon: "fas fa-layer-group",
    items: ["React.js", "Next.js", "JavaScript (ES6+)", "HTML5", "CSS3", "Responsive UI", "Component Architecture"],
  },
  {
    group: "Mobile",
    icon: "fas fa-mobile-screen",
    items: ["React Native", "Expo", "React Navigation", "Cross-Platform Debugging"],
  },
  {
    group: "State & Data",
    icon: "fas fa-diagram-project",
    items: ["Redux", "Context API", "REST APIs", "Axios", "Formik"],
  },
  {
    group: "Workflow",
    icon: "fas fa-code-branch",
    items: ["Git & GitHub", "Agile / Scrum", "Jira", "Code Review", "Performance Optimization"],
  },
  {
    group: "Learning",
    icon: "fas fa-seedling",
    items: ["Node.js / Express", "Python", "Go", "AI tooling"],
  },
];

export const education = [
  { title: "Master of Computer Applications (MCA)", place: "Islamic University of Science and Technology" },
  { title: "Bachelor of Computer Applications (BCA)", place: "Degree College Pulwama, Kashmir University" },
  { title: "AI Tools & ChatGPT Workshop", place: "be10x · July 2026", cert: true },
];
