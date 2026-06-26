import type { LucideIcon } from "lucide-react";
import {
  Search,
  Megaphone,
  MessageCircle,
  Star,
  Brain,
  Dumbbell,
  Stethoscope,
  Cake,
  Scissors,
  UtensilsCrossed,
  Bug,
  Car,
  Plane,
  Flower2,
  Wrench,
} from "lucide-react";

export type Agent = {
  id: string;
  badge: string;
  name: string;
  role: string;
  color: string; // tailwind gradient classes
  points: string[];
  icon: LucideIcon;
};

export const AGENTS: Agent[] = [
  {
    id: "gbp",
    badge: "Google Business Profile",
    name: "GBP Growth Agent",
    role: "AI Agent to get you more leads from Google",
    color: "from-blue-500 to-indigo-500",
    icon: Search,
    points: [
      "Finds the best SEO keywords for your business",
      "Rewrites SEO-optimised GBP content and services",
      "Auto-publishes SEO-powered Google posts",
      "Crafts SEO-rich replies to all Google reviews",
      "Generates authentic Google reviews from paid customers",
    ],
  },
  {
    id: "chat",
    badge: "WhatsApp Chat",
    name: "Customer Chat Agent",
    role: "Your personal assistant who chats with customers 24/7",
    color: "from-emerald-500 to-teal-500",
    icon: MessageCircle,
    points: [
      "Exclusively trained for your business",
      "Knows your offerings, pricing and testimonials",
      "Remembers every customer's purchase history",
      "Captures leads from every conversation",
      "Answers instantly, day or night",
    ],
  },
  {
    id: "marketing",
    badge: "WhatsApp Marketing",
    name: "Repeat Sales Agent",
    role: "AI Agent to increase repeat sales & Google reviews",
    color: "from-fuchsia-500 to-purple-500",
    icon: Megaphone,
    points: [
      "Creates offers, visuals & messaging",
      "Analyses purchase data to pick the right customers",
      "Spots repeat-purchase opportunities from conversations",
      "Sends offers & reminders directly on WhatsApp",
      "Answers all promotion-related customer queries",
    ],
  },
];

export const ENGINE = {
  name: "Data Intelligence Engine",
  tagline: "The shared brain of all 3 AI agents",
  points: [
    "Captures and stores leads, customer and sales data",
    "Provides real-time data intelligence to all 3 AI agents",
    "Analyses WhatsApp chats to identify potential leads",
    "Segments high-potential customers for promotions",
    "Tracks & displays key business performance in one app",
  ],
  icon: Brain,
};

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect in minutes",
    body: "Link your Google Business Profile and WhatsApp. No tech skills needed — if you can use WhatsApp, you can use Grovia.",
    icon: MessageCircle,
  },
  {
    step: "02",
    title: "We train your AI team",
    body: "Your agents learn everything about your business — services, pricing, offers and testimonials — so they sound just like you.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Watch revenue grow",
    body: "Rank higher on Google, reply to every customer instantly, and bring back past buyers with smart WhatsApp campaigns.",
    icon: Star,
  },
];

export type Industry = { name: string; href: string; icon: LucideIcon };

export const INDUSTRIES: Industry[] = [
  { name: "Gym & Fitness Centres", href: "#", icon: Dumbbell },
  { name: "Doctors & Health Clinics", href: "#", icon: Stethoscope },
  { name: "Bakers & Cake Shops", href: "#", icon: Cake },
  { name: "Salon Owners", href: "#", icon: Scissors },
  { name: "Restaurants & Bars", href: "#", icon: UtensilsCrossed },
  { name: "Pest Control Businesses", href: "#", icon: Bug },
  { name: "Car Garages & Mechanics", href: "#", icon: Car },
  { name: "Tours & Travels", href: "#", icon: Plane },
  { name: "Yoga & Wellness", href: "#", icon: Flower2 },
  { name: "Handyman Services", href: "#", icon: Wrench },
];

export type Testimonial = {
  quote: string;
  name: string;
  business: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Before Grovia, we barely got 2–3 leads a month. Now we rank on the first page of Google and generate 20+ leads every week. Our website is no longer just a brochure — it's a lead engine.",
    name: "Shubham M.",
    business: "Founder, Calisthenics Studio",
  },
  {
    quote:
      "Despite being a 17-year-old brand, we struggled online. After Grovia we started ranking locally, saw a 60% jump in new footfall, and now get 20–25 client calls every week.",
    name: "Priti & Jayesh",
    business: "Owners, Peacock Salon",
  },
  {
    quote:
      "In just 3 months our new presence saw a 2X jump in revenue. The WhatsApp agent answers customers at midnight and books appointments while we sleep.",
    name: "Meha M.",
    business: "Trichologist Clinic",
  },
  {
    quote:
      "The repeat-sales agent brought back customers we'd completely lost touch with. One WhatsApp campaign paid for the whole year.",
    name: "Rahul D.",
    business: "Auto Garage Owner",
  },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Will it work if I'm not tech-savvy?",
    a: "Absolutely. Grovia is simple and intuitive. If you can use WhatsApp, you can use Grovia with ease.",
  },
  {
    q: "How soon will I see results?",
    a: "Most users start seeing more leads and bookings within 7–14 days of setup.",
  },
  {
    q: "Is my customer data secure?",
    a: "100%. We follow strict data privacy protocols and encryption to protect your customer information.",
  },
  {
    q: "Is there someone to help me if I get stuck?",
    a: "Of course. Our support and onboarding team is always just a call or WhatsApp away.",
  },
  {
    q: "Does Grovia work for all types of businesses?",
    a: "Yes. Whether you're a salon, doctor, gym or travel agency, Grovia is built for local business growth.",
  },
];

export const STATS = [
  { value: "60,000+", label: "Business owners" },
  { value: "3.2x", label: "Avg. revenue lift" },
  { value: "20+", label: "Leads / week" },
  { value: "24/7", label: "Customer replies" },
];
