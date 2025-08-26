import {
  Globe,
  BarChart3,
  Search,
  FolderOpen,
  Mail,
  Brain,
  Zap,
  Target,
  Users,
  TrendingUp,
  Link,
  FileText,
  Rocket,
  Eye,
  MousePointer,
  Star,
  Settings,
  Layers,
  Shield,
  PenTool,
  Send,
} from "lucide-react"

export default function Features() {
  return (
    <div className="flex flex-col items-center mt-20 relative [background:radial-gradient(125%_100%_at_50%_0%,_#FFF_6.32%,_#EOFOFF_29.28%,_#E7EFFD_68.68%,_FFF_100%)]">
      <div className=" mx-auto absolute inset-0 left-1/2 transform -translate-x-1/2 w-full h-full">
        <div className="absolute inset-y-0 left-0 h-full w-px bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 h-full w-px bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent"></div>
      </div>

      <div className="relative z-10  mx-auto px-4 py-16">
        <div className="space-y-24">
          <section>
            <div className="text-center mb-12">
              <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Create unlimited blog sites</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Create as many blog sites as you'd like. We don't charge you for creating additional sites.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Layers className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Unlimited blog sites</h3>
                <p className="text-gray-600 text-sm">No limits on the number of sites you can create</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Link className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Custom domain for each site</h3>
                <p className="text-gray-600 text-sm">Use your own domain for professional branding</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Pricing based on page views</h3>
                <p className="text-gray-600 text-sm">Fair pricing that scales with your success</p>
              </div>
            </div>
          </section>

          {/* Analytics */}
          <section>
            <div className="text-center mb-12">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">View detailed blog analytics</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See your page views, visitors, referrers, clicks, and much more for all of your blogs.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Inbuilt analytics</h3>
                <p className="text-gray-600 text-sm">Built-in analytics for all your sites</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Traffic sources</h3>
                <p className="text-gray-600 text-sm">Find out where people are finding your blog</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <MousePointer className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Click tracking</h3>
                <p className="text-gray-600 text-sm">See which links people are clicking the most</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Popular posts</h3>
                <p className="text-gray-600 text-sm">Find out which of your posts are popular</p>
              </div>
            </div>
          </section>

          <section>
            <div className="text-center mb-12">
              <Search className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Optimized for SEO</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                All you have to do is to write good content that satisfies the needs of your readers. We take care of
                the rest.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Meta tags</h3>
                <p className="text-gray-600 text-sm">Proper meta tags and canonical links</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Schema markup</h3>
                <p className="text-gray-600 text-sm">Structured Schema markup for all posts</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Edge delivery</h3>
                <p className="text-gray-600 text-sm">Served from the edge for super fast loading</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">SEO controls</h3>
                <p className="text-gray-600 text-sm">Easy controls to override SEO settings</p>
              </div>
            </div>
          </section>

          <section>
            <div className="text-center mb-12">
              <FolderOpen className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Add your blog on the sub folder</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You can optionally choose to have your blog on a subfolder. This is really good for SEO.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Globe className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Sub-domain</h3>
                <p className="text-gray-600 text-sm">blog.example.com</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Main domain</h3>
                <p className="text-gray-600 text-sm">example.com</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <FolderOpen className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Subfolder</h3>
                <p className="text-gray-600 text-sm">example.com/blog</p>
              </div>
            </div>
          </section>

          <section>
            <div className="text-center mb-12">
              <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Reach new inboxes</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Turn your Notion posts into email newsletters that wow your subscribers. With a single click, you can
                extend your content's impact.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Send className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Beautiful newsletters</h3>
                <p className="text-gray-600 text-sm">Instantly generate beautiful newsletters</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Users className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Subscriber management</h3>
                <p className="text-gray-600 text-sm">Manage your subscriber lists in one place</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Eye className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email dashboard</h3>
                <p className="text-gray-600 text-sm">View all the emails in your dashboard</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Star className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Brand consistency</h3>
                <p className="text-gray-600 text-sm">Maintain a consistent brand experience</p>
              </div>
            </div>
          </section>

          <section>
            <div className="text-center mb-12">
              <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Blog smarter</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Let our AI-powered research and expert writers handle content creation, so you can focus on growing your
                business. SEO-optimized, conversion-focused posts.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Search className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Keyword research</h3>
                <p className="text-gray-600 text-sm">Discover high-impact keywords</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <PenTool className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Expert writers</h3>
                <p className="text-gray-600 text-sm">Benefit from professional writing talent</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Rocket className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">SEO optimization</h3>
                <p className="text-gray-600 text-sm">Rank higher in search with expert SEO</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                <Target className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Customer connection</h3>
                <p className="text-gray-600 text-sm">Connect with your ideal customers</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className="mt-24 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Feather</h3>
              <p className="text-gray-600 text-sm">
                Create superfast blogs with Channel. Simple, powerful, and built for creators.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© 2024 Feather. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
