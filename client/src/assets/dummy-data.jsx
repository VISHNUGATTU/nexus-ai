import { BrainCircuit, MessageSquare, Zap } from "lucide-react";

export const featuresData = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Natural Conversations",
    desc: "Engage in fluid, human-like dialogue with our advanced language model that remembers your context.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Lightning Fast Responses",
    desc: "Get instant answers, generate code, or draft emails in milliseconds with our highly optimized infrastructure.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "Advanced Reasoning",
    desc: "Tackle complex math, logic puzzles, and deep analytical tasks with our next-generation reasoning engine.",
  },
];

export const plansData = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    desc: "Perfect for everyday tasks and quick questions.",
    credits: "Monthly",
    features: [
      "Access to standard AI model",
      "100 messages per day",
      "Standard response speed",
      "Web search capabilities",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Plus",
    price: "$20",
    desc: "For heavy users and professionals.",
    credits: "Monthly",
    features: [
      "Everything in Basic",
      "Access to our most advanced model",
      "Unlimited messages",
      "Priority response speed during peak hours",
      "Early access to new features",
    ],
    popular: true,
  },
  {
    id: "api",
    name: "Developer",
    price: "Pay-as-you-go",
    desc: "Integrate our AI into your own applications.",
    credits: "Per 1k Tokens",
    features: [
      "Full API access",
      "High rate limits",
      "Fine-tuning capabilities",
      "Detailed usage analytics",
      "Priority technical support",
    ],
  },
];

export const faqData = [
  {
    question: "What exactly can this AI Assistant do for me?",
    answer:
      "Our AI can help you draft emails, write and debug code, translate languages, brainstorm ideas, analyze data, and answer complex questions across a wide variety of subjects.",
  },
  {
    question: "Are my conversations and data kept private?",
    answer:
      "Yes. We take your privacy seriously. Your personal conversations are encrypted and are never used to train our models without your explicit opt-in.",
  },
  {
    question: "What is the difference between the standard and advanced models?",
    answer:
      "The standard model is highly efficient and great for general chat. The advanced model (available on the Plus plan) is capable of deeper reasoning, complex coding, and nuanced creative writing.",
  },
  {
    question: "Do you offer an API for developers?",
    answer:
      "Absolutely! We offer a robust REST API. You can sign up for the Developer tier to get your API keys and start building your own AI-powered applications.",
  },
];

export const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", url: "#" },
      { name: "Pricing", url: "#" },
      { name: "API Documentation", url: "#" },
      { name: "Playground", url: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
      { name: "Data Processing Agreement", url: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "Twitter / X", url: "#" },
      { name: "Discord Community", url: "#" },
      { name: "GitHub", url: "#" },
    ],
  },
];