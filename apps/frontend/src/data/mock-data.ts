import type { Contributor, TrainingOption, NetworkStats } from "../types/cotrain"

// Data generation utilities
const generateRandomId = () => Math.floor(Math.random() * 10000) + 1

const generateRandomDate = (startYear = 2024) => {
  const start = new Date(startYear, 0, 1)
  const end = new Date()
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(randomTime).toISOString().split('T')[0]
}

const getRandomElement = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// Configuration data
const LOCATIONS = [
  "San Francisco, CA", "London, UK", "Tokyo, JP", "Berlin, DE", "Sydney, AU",
  "New York, NY", "Toronto, CA", "Singapore, SG", "Amsterdam, NL", "Seoul, KR"
]

const GPU_TYPES = ["RTX 4090", "RTX 4080", "RTX 3080", "RTX 3070", "H100", "A100"]
const MEMORY_SIZES = ["16GB", "32GB", "64GB", "128GB"]
const CORE_COUNTS = [8, 12, 16, 24, 32]
const STATUSES = ["ONLINE", "TRAINING", "OFFLINE", "CONNECTING"] as const

// Data generation functions
export const generateContributor = (id?: number): Contributor => ({
  id: id || generateRandomId(),
  name: `node-${getRandomElement(['gpu', 'cpu', 'tpu'])}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}.cotrain.ai`,
  contributions: Math.floor(Math.random() * 5000) + 500,
  status: getRandomElement(STATUSES),
  location: getRandomElement(LOCATIONS),
  joinDate: generateRandomDate(),
  hardware: {
    gpu: getRandomElement(GPU_TYPES),
    memory: getRandomElement(MEMORY_SIZES),
    cores: getRandomElement(CORE_COUNTS),
  },
})

export const generateContributors = (count = 5): Contributor[] => {
  return Array.from({ length: count }, (_, i) => generateContributor(i + 1))
}

// Default mock data
export const mockContributors: Contributor[] = generateContributors(5)

// Training option templates
const TRAINING_TEMPLATES = [
  {
    id: "llm-foundation",
    title: "LLM Foundation Model",
    description: "Large language model training with 70B parameters using distributed compute across global nodes",
    iconName: "Brain",
    difficulty: "Advanced",
    baseRewards: { tokens: 5000, reputation: 200, nfts: 1 },
    requirements: { minGPU: "RTX 3080", minRAM: "32GB", bandwidth: "100 Mbps" },
  },
  {
    id: "multimodal-vision",
    title: "Multimodal Vision-Language",
    description: "Vision-language model combining image and text understanding capabilities for next-gen AI applications",
    iconName: "ImageIcon",
    difficulty: "Intermediate",
    baseRewards: { tokens: 3000, reputation: 150 },
    requirements: { minGPU: "RTX 3070", minRAM: "16GB", bandwidth: "50 Mbps" },
  },
  {
    id: "code-generation",
    title: "Code Generation Model",
    description: "Specialized model for code completion and generation across multiple programming languages",
    iconName: "Code",
    difficulty: "Intermediate",
    baseRewards: { tokens: 2500, reputation: 120 },
    requirements: { minGPU: "GTX 1080", minRAM: "16GB", bandwidth: "25 Mbps" },
  },
  {
    id: "synthetic-data",
    title: "Synthetic Data Generation",
    description: "Generate high-quality synthetic training data for various AI applications and research purposes",
    iconName: "Database",
    difficulty: "Advanced",
    baseRewards: { tokens: 4000, reputation: 180, nfts: 1 },
    requirements: { minGPU: "RTX 3080", minRAM: "32GB", bandwidth: "100 Mbps" },
  },
  {
    id: "conversational-ai",
    title: "Conversational AI Agent",
    description: "Advanced conversational AI with reasoning and tool-use capabilities for enterprise applications",
    iconName: "MessageSquare",
    difficulty: "Advanced",
    baseRewards: { tokens: 6000, reputation: 250, nfts: 2 },
    requirements: { minGPU: "RTX 4080", minRAM: "64GB", bandwidth: "200 Mbps" },
  },
  {
    id: "scientific-reasoning",
    title: "Scientific Reasoning Model",
    description: "Specialized model for scientific research and mathematical reasoning in academic environments",
    iconName: "Zap",
    difficulty: "Advanced",
    baseRewards: { tokens: 7000, reputation: 300, nfts: 2 },
    requirements: { minGPU: "H100", minRAM: "128GB", bandwidth: "500 Mbps" },
  },
]

const TRAINING_STATUSES = ["available", "training", "completed", "coming-soon"]
const DURATIONS = ["20 days", "25 days", "30 days", "40 days", "45 days", "50 days", "60 days"]

export const generateTrainingOption = (template: any, customStatus?: string): TrainingOption => {
  const status = customStatus || getRandomElement(TRAINING_STATUSES)
  const participants = status === "coming-soon" ? undefined : Math.floor(Math.random() * 400) + 50
  const progress = status === "training" ? Math.floor(Math.random() * 80) + 10 :
                  status === "completed" ? 100 : undefined
  
  return {
    ...template,
    status,
    participants,
    progress,
    estimatedDuration: getRandomElement(DURATIONS),
    rewards: template.baseRewards,
  }
}

export const generateTrainingOptions = (): TrainingOption[] => {
  return [
    generateTrainingOption(TRAINING_TEMPLATES[0], "training"),
    generateTrainingOption(TRAINING_TEMPLATES[1], "available"),
    generateTrainingOption(TRAINING_TEMPLATES[2], "available"),
    generateTrainingOption(TRAINING_TEMPLATES[3], "completed"),
    generateTrainingOption(TRAINING_TEMPLATES[4], "coming-soon"),
    generateTrainingOption(TRAINING_TEMPLATES[5], "coming-soon"),
  ]
}

export const mockTrainingOptions: TrainingOption[] = generateTrainingOptions()

// Network stats generation
export const generateNetworkStats = (): NetworkStats => ({
  totalNodes: Math.floor(Math.random() * 2000) + 1000,
  activeNodes: Math.floor(Math.random() * 1000) + 500,
  totalComputeHours: Math.floor(Math.random() * 100000) + 50000,
  modelsTraining: Math.floor(Math.random() * 20) + 5,
  totalContributors: Math.floor(Math.random() * 10000) + 3000,
  networkHealth: Math.round((Math.random() * 20 + 80) * 10) / 10, // 80-100%
})

export const mockNetworkStats: NetworkStats = generateNetworkStats()

// Chart data generation
export const generateChartData = (months = 10) => {
  const data = []
  const startDate = new Date(2024, 2, 1) // March 2024
  
  for (let i = 0; i < months; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)
    
    const baseValue = i * 20 + Math.random() * 50
    data.push({
      date: date.toISOString().split('T')[0],
      computeHours: Math.round((baseValue + Math.random() * 100) * 10) / 10,
      tokens: Math.floor(baseValue * 10 + Math.random() * 500),
      reputation: Math.floor(baseValue * 5 + Math.random() * 200),
      rank: Math.floor(Math.random() * 15) + 5,
    })
  }
  
  return data
}

export const mockChartData = generateChartData()

export const mockFAQs = [
  {
    question: "What is CoTrain?",
    answer:
      "CoTrain is a decentralized AI training platform that allows anyone to contribute compute power and participate in training state-of-the-art AI models while earning rewards.",
  },
  {
    question: "How do I start contributing?",
    answer:
      "Simply download our client software, connect your GPU-enabled device to the network, and start participating in training projects. You'll earn tokens and reputation based on your contributions.",
  },
  {
    question: "What hardware do I need?",
    answer:
      "Minimum requirements include a modern GPU with at least 6GB VRAM, 8GB system RAM, and a stable internet connection. Better hardware means higher rewards.",
  },
  {
    question: "How are rewards calculated?",
    answer:
      "Rewards are based on compute contribution, training efficiency, uptime, and network participation. The more you contribute, the more you earn.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, all training is done using federated learning principles. Your local data never leaves your device, and all communications are encrypted.",
  },
]

export const mockTeamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former AI researcher at Google DeepMind with 10+ years in distributed systems",
    avatar: "/placeholder.svg?height=100&width=100",
    social: { twitter: "@sarahchen", linkedin: "sarahchen" },
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-founder",
    bio: "Ex-Tesla Autopilot engineer, expert in large-scale ML infrastructure",
    avatar: "/placeholder.svg?height=100&width=100",
    social: { twitter: "@marcusrod", linkedin: "marcusrodriguez" },
  },
  {
    name: "Dr. Alex Kim",
    role: "Head of Research",
    bio: "PhD in Computer Science from Stanford, published 50+ papers on federated learning",
    avatar: "/placeholder.svg?height=100&width=100",
    social: { twitter: "@alexkim", linkedin: "alexkim" },
  },
]
