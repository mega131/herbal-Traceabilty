import React from "react";
import { Leaf, MapPin, Shield, Award, Clock, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="w-10 h-10 text-white bg-green-600 rounded-full p-2" />,
      title: "Geo-Tagged Herbs",
      description: "Track each herb with exact farm location for transparency."
    },
    {
      icon: <Shield className="w-10 h-10 text-white bg-green-600 rounded-full p-2" />,
      title: "Blockchain Secured",
      description: "Immutable records ensure authenticity and trust."
    },
    {
      icon: <Award className="w-10 h-10 text-white bg-green-600 rounded-full p-2" />,
      title: "Quality Certified",
      description: "Laboratories certify the quality of herbs digitally."
    },
    {
      icon: <Clock className="w-10 h-10 text-white bg-green-600 rounded-full p-2" />,
      title: "Real-Time Updates",
      description: "Monitor your herb supply chain at every stage."
    },
  ];

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Ayurvedic Practitioner",
      content: "HerbTrace ensures complete transparency in sourcing and verifying herbs.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Organic Farmer",
      content: "It makes recording herb collection and certification simple and reliable.",
      rating: 5
    },
    {
      name: "Lab Director",
      role: "Quality Testing Laboratory",
      content: "Integration with our testing processes is seamless and efficient.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:p-6">
          <div className="flex items-center space-x-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="font-bold text-2xl md:text-3xl">AyurTrace</span>
          </div>
          <div className="flex space-x-4 items-center">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-green-600 font-medium hover:text-green-700 transition">
              Home
            </button>
            <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} className="text-green-600 font-medium hover:text-green-700 transition">
              About
            </button>
            <button onClick={() => navigate("/demo")} className="text-blue-600 font-medium hover:text-blue-700 transition">
              📱 Demo
            </button>
            <button onClick={() => navigate("/login")} className="text-green-600 font-medium hover:text-green-700 transition">
              Login
            </button>
            <button onClick={() => navigate("/signup")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Signup
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Trace Your Herbs. Ensure Authenticity.</h1>
          <p className="text-gray-700 mb-8 text-lg md:text-xl">
            Blockchain-based Ayurvedic herb traceability for farmers, laboratories, and processors.
            Supported by the Ministry of AYUSH to strengthen the Ayurvedic ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button onClick={() => navigate("/signup")} className="bg-green-600 text-white px-8 py-4 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({behavior:'smooth'})} className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg hover:bg-green-600 hover:text-white transition">
              Learn More
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0">
          <img src="/herb-plant.jpeg" alt="Herbs" className="rounded-xl shadow-xl w-full h-auto md:h-[400px] object-cover" />
        </div>
      </section>

      {/* AYUSH Info Section */}
      <section id="about" className="py-16 px-6 md:px-12 bg-green-50 text-center">
        <img src="/ayush-logo.png" alt="AYUSH Logo" className="mx-auto w-40 md:w-52 object-contain mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported by Ministry of AYUSH</h2>
        <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto">
          HerbTrace is an initiative under the Government of India’s Ministry of AYUSH to ensure quality, transparency, and authenticity in Ayurvedic herbs. 
          Our platform enables farmers, labs, and processors to maintain complete traceability, promoting a reliable and trustworthy Ayurvedic supply chain.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 bg-white/50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="bg-green-100 p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-gray-700">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((t,i)=>(
            <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex items-center mb-4">
                {[...Array(t.rating)].map((_,i)=>(
                  <Star key={i} className="w-5 h-5 text-yellow-400"/>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{t.content}"</p>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 bg-green-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the HerbTrace Ecosystem</h2>
        <p className="mb-8 text-lg md:text-xl">Ensure complete transparency, quality, and authenticity in Ayurvedic herbs across India.</p>
        <button onClick={() => navigate('/signup')} className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center mx-auto space-x-2">
          <span>Start Your Journey</span>
          <ArrowRight className="w-5 h-5"/>
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} HerbTrace. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
