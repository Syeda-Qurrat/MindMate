import {
  Heart,
  MessageCircle,
  Brain,
  Activity,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react'

import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

function Landing() {

  const features = [
    {
      icon: MessageCircle,
      title: 'AI Companion',
      description: 'A supportive AI companion that listens and responds with care.'
    },
    {
      icon: Activity,
      title: 'Mood Tracking',
      description: 'Understand your emotional patterns through daily mood check-ins.'
    },
    {
      icon: Users,
      title: 'Peer Support',
      description: 'Connect with others and share experiences in supportive communities.'
    },
    {
      icon: Brain,
      title: 'Wellness Activities',
      description: 'Explore breathing exercises, mindfulness and relaxation activities.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 md:px-16 py-20 md:py-28">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">

          <div>
            <div className="inline-flex items-center gap-2 bg-[#eee6fc] text-[#7955b5] px-4 py-2 rounded-full text-sm mb-7">
              <Sparkles size={16} />
              Your personal wellness companion
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[#302747] leading-tight">
              Your feelings
              <br />
              matter. Your
              <br />
              <span className="text-[#9878d4]">
                wellness matters.
              </span>
            </h1>

            <p className="mt-6 text-[#827991] text-lg leading-8 max-w-lg">
              A safe space to express yourself, understand your emotions
              and take small steps towards a healthier, happier you.
            </p>

            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] text-white px-7 py-4 rounded-xl font-semibold transition"
              >
                Get Started
                <ArrowRight size={19} />
              </Link>

              <a
                href="#about"
                className="border border-[#e3d9f1] text-[#5c4b76] px-7 py-4 rounded-xl font-semibold hover:bg-white transition"
              >
                Learn More
              </a>
            </div>

            <div className="flex items-center gap-2 mt-8 text-sm text-[#827991]">
              <ShieldCheck size={18} className="text-[#9878d4]" />
              A supportive space designed with privacy in mind
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#eee6fc] to-[#e2d5fa] rounded-[40px] p-8 md:p-12 min-h-[390px] flex items-center justify-center">

              <div className="bg-white rounded-3xl shadow-xl p-7 w-full max-w-sm">

                <div className="flex items-center gap-3 mb-7">
                  <div className="bg-[#eee6fc] p-3 rounded-2xl">
                    <Heart className="text-[#9878d4]" size={25} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#302747]">
                      MindMate AI
                    </h3>
                    <p className="text-xs text-[#64a98a]">
                      Here to listen
                    </p>
                  </div>
                </div>

                <div className="bg-[#f5f0fc] p-4 rounded-2xl rounded-tl-none text-sm text-[#5c4b76] leading-6">
                  Hey! It's okay to take things one step at a time.
                  How are you feeling today?
                </div>

                <div className="flex justify-end mt-5">
                  <div className="bg-[#9878d4] text-white p-4 rounded-2xl rounded-tr-none text-sm">
                    I've had a stressful day.
                  </div>
                </div>

                <div className="bg-[#f5f0fc] p-4 rounded-2xl rounded-tl-none text-sm text-[#5c4b76] mt-5">
                  I'm here to listen. Would you like to talk about it?
                </div>

                <div className="mt-7 border border-[#eee8f5] rounded-xl p-3 text-sm text-[#b0a6bd]">
                  Share what's on your mind...
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 md:px-16 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#9878d4] font-semibold text-sm uppercase tracking-wider">
            About MindMate
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-[#302747] mt-4">
            A little support can make a big difference.
          </h2>

          <p className="text-[#827991] leading-8 mt-6">
            MindMate brings together AI-powered conversations, mood
            tracking and supportive communities to help you make
            emotional well-being a part of your everyday life.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-16 py-20">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-[#9878d4] font-semibold text-sm uppercase tracking-wider">
              What we offer
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-[#302747] mt-4">
              Your wellness, all in one place.
            </h2>

            <p className="text-[#827991] mt-4">
              Tools and support to help you feel a little better every day.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <div
                  key={index}
                  className="bg-white p-7 rounded-3xl border border-[#eee8f5] hover:shadow-lg hover:-translate-y-1 transition duration-300"
                >
                  <div className="bg-[#eee6fc] w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="text-[#9878d4]" size={26} />
                  </div>

                  <h3 className="text-lg font-bold text-[#302747]">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-[#827991] leading-7 mt-3">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#302747]">
            Your journey starts with a conversation.
          </h2>

          <p className="text-[#827991] mt-4 leading-7">
            Express yourself, explore your emotions and discover
            small ways to care for your well-being.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 bg-[#9878d4] text-white px-7 py-4 rounded-xl font-semibold hover:bg-[#7955b5] transition"
          >
            Start Your Journey
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#302747] text-white px-6 md:px-16 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 text-xl font-bold">
              <Heart size={22} />
              mindmate.
            </div>

            <p className="text-sm text-purple-200 mt-3">
              A little space for your well-being.
            </p>
          </div>

          <p className="text-sm text-purple-200">
            © 2026 MindMate. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  )
}

export default Landing