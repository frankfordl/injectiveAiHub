"use client"

import { Button, Card, CardBody, Chip, Avatar } from "@heroui/react"
import { Users, Target, Lightbulb, Globe, Shield, Twitter, Linkedin } from "lucide-react"

interface AboutPageProps {
  onNavigate?: (page: string) => void
}

export function AboutPage({ onNavigate = () => {} }: AboutPageProps) {
  const values = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Decentralization",
      description: "We believe in distributed power and democratic access to AI training resources.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Transparency",
      description: "Open-source approach with full visibility into training processes and reward distribution.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Building a global community of AI enthusiasts, researchers, and contributors.",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "Pushing the boundaries of what's possible with distributed AI training.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              About <span className="text-green-400">injectiveAIHub</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're building the world's largest decentralized AI training network, democratizing access to cutting-edge
              AI model development for everyone.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">5,000+</div>
              <div className="text-gray-400">Active Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">100M+</div>
              <div className="text-gray-400">Compute Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">25+</div>
              <div className="text-gray-400">Models Trained</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardBody className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-green-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To democratize AI training by creating a global, decentralized network where anyone can contribute
                  compute power and participate in training the next generation of AI models. We believe that AI
                  development should be accessible, transparent, and community-driven.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardBody className="p-8">
                <div className="flex items-center mb-4">
                  <Lightbulb className="w-8 h-8 text-blue-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Our Vision</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  A future where AI training is no longer limited by centralized resources or corporate gatekeepers.
                  Where researchers, developers, and enthusiasts worldwide can collaborate to create powerful AI models
                  that benefit humanity as a whole.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700" isHoverable>
                <CardBody className="p-6 text-center">
                  <div className="text-green-400 mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join Our Mission</h2>
          <p className="text-xl text-gray-400 mb-8">
            Be part of the revolution in decentralized AI training. Start contributing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onPress={() => onNavigate("terminal")}
              color="success"
              size="lg"
              className="text-white px-8 py-3"
            >
              Start Contributing
            </Button>
            <Button
              onPress={() => onNavigate("training")}
              variant="bordered"
              size="lg"
              className="border-gray-600 text-gray-300 px-8 py-3"
            >
              View Training Projects
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
