import UploadForm from "./UploadForm";
import AuthButtons from "./components/AuthButtons";
import { ArrowRight, Layers, Zap, ShieldCheck, PlayCircle, BarChart3, Globe } from "lucide-react";

export const metadata = {
  title: "MediaStack | Professional Cloud Transcoding",
  description: "Fast, reliable, and scalable media transcoding API and application.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 scroll-smooth">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-black flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Layers size={18} className="text-white" />
            </div>
            MediaStack
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">FAQ</a>
          </div>
          <AuthButtons />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white pt-28 pb-24 px-4 border-b border-gray-200 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
            Media processing at <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              cloud scale.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            The fastest, easiest way to process, transcode, and resize your videos and photos. 
            No infrastructure to manage, just API calls or a clean UI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#upload-section" className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center gap-2">
              Try the Converter <ArrowRight size={18} />
            </a>
            <a href="#pricing" className="bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Trusted By / Logos */}
      <section className="py-12 bg-gray-50 border-b border-gray-200 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            {/* Placeholders for logos */}
            <div className="flex items-center gap-2 font-bold text-xl"><Globe size={24}/> GlobalTech</div>
            <div className="flex items-center gap-2 font-bold text-xl"><BarChart3 size={24}/> DataScale</div>
            <div className="flex items-center gap-2 font-bold text-xl"><PlayCircle size={24}/> StreamLine</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to process media</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Our infrastructure abstracts away the complexities of FFmpeg, queuing, and storage.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast Compute</h3>
            <p className="text-gray-500 leading-relaxed">
              Our on-demand container architecture provisions resources instantly via AWS Fargate. Your media is converted in seconds, not hours.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Layers size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Universal Formats</h3>
            <p className="text-gray-500 leading-relaxed">
              Supports everything from MP4, WebM, and MOV to complex photo resizing options. We handle the codecs so you don't have to.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Direct Storage</h3>
            <p className="text-gray-500 leading-relaxed">
              Direct-to-S3 uploads with Pre-signed URLs ensure your raw files never pass through intermediate servers. Your data stays yours.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Tool Section */}
      <section id="upload-section" className="bg-white py-24 px-4 border-y border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-5/12">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-6">Live Demo</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Test the Engine</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Experience the power of MediaStack directly in your browser. 
              Upload a sample video or photo, select your target resolutions, and watch our cloud orchestrator go to work.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-3 font-medium text-gray-800">
                <CheckIcon /> No credit card required to test.
              </li>
              <li className="flex items-center gap-3 font-medium text-gray-800">
                <CheckIcon /> Up to 3 files (Max 20MB each) for free.
              </li>
              <li className="flex items-center gap-3 font-medium text-gray-800">
                <CheckIcon /> Immediate high-speed S3 download links.
              </li>
            </ul>
          </div>
          <div className="lg:w-7/12 w-full">
            <UploadForm />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Start for free, upgrade when you need production scale.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Developer</h3>
            <p className="text-gray-500 mb-6">Perfect for testing and side projects.</p>
            <div className="text-5xl font-extrabold mb-8">$0<span className="text-xl text-gray-500 font-medium">/mo</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3"><CheckIcon /> 3 jobs per month</li>
              <li className="flex gap-3"><CheckIcon /> 20MB max file size</li>
              <li className="flex gap-3"><CheckIcon /> Standard queue priority</li>
            </ul>
            <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition">Current Plan</button>
          </div>

          {/* Pro Tier */}
          <div className="bg-black text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-400 mb-6">For production applications and heavy workloads.</p>
            <div className="text-5xl font-extrabold mb-8">$49<span className="text-xl text-gray-400 font-medium">/mo</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3"><CheckIcon /> Unlimited jobs</li>
              <li className="flex gap-3"><CheckIcon /> 2GB max file size</li>
              <li className="flex gap-3"><CheckIcon /> Highest queue priority</li>
              <li className="flex gap-3"><CheckIcon /> 4K and 8K support</li>
            </ul>
            <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">Upgrade to Pro</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-bold mb-2">How long are my files stored?</h4>
              <p className="text-gray-600">On the free tier, files are deleted after 24 hours. Pro users can retain files for up to 30 days in our secure S3 buckets.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Do you support webhooks?</h4>
              <p className="text-gray-600">Yes! Pro users can configure webhooks to receive HTTP POST requests when a transcoding job completes or fails.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">What happens if I exceed my 20MB limit on the free plan?</h4>
              <p className="text-gray-600">The upload will be rejected immediately before consuming your bandwidth. You can upgrade to Pro to unlock 2GB limits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            MediaStack
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Contact Sales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="bg-blue-100 p-1 rounded-full shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  );
}
