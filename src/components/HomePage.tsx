import { Map, Target, Users, BarChart, Sparkles, Trophy, BookOpen } from 'lucide-react';

interface HomePageProps {
  onStartAdventure: () => void;
}

export function HomePage({ onStartAdventure }: HomePageProps) {
  const features = [
    {
      icon: Map,
      title: '100+ Math Puzzles',
      description: 'Explore 4 unique zones filled with engaging challenges',
    },
    {
      icon: Target,
      title: 'Adaptive Difficulty',
      description: 'Puzzles adjust to your skill level for optimal learning',
    },
    {
      icon: BarChart,
      title: 'Progress Tracking',
      description: 'Watch your math skills grow with detailed analytics',
    },
    {
      icon: Users,
      title: 'Multiplayer Challenges',
      description: 'Team up with friends to solve complex problems',
    },
    {
      icon: Sparkles,
      title: 'Avatar Customization',
      description: 'Unlock gear and items as you master concepts',
    },
    {
      icon: Trophy,
      title: 'Achievements',
      description: 'Earn badges and gems for your accomplishments',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-16 pt-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-4 mb-6">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Math Mystery Island
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn math learning into an epic adventure. Solve puzzles, unlock zones, and master
            mathematical concepts through exploration and discovery.
          </p>
          <button
            onClick={onStartAdventure}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Your Adventure
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Map className="w-24 h-24 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Interactive Island Map Preview</p>
              <p className="text-sm text-gray-500 mt-2">Explore zones by solving math puzzles</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            What Makes It Special
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students mastering math through adventure
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm opacity-90">Puzzles</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">4</div>
              <div className="text-sm opacity-90">Unique Zones</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-90">Hours of Content</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm opacity-90">Grade Levels</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
