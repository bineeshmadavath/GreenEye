import { Link } from 'react-router-dom';
import { Camera, Activity, Trophy, Calendar, Newspaper, Leaf, MapPin, Gift, Store, Star, Copy, Globe, Heart, Share2, Send, ChevronRight } from 'lucide-react';

export default function DesktopHome() {
  return (
    <div className="hidden md:flex flex-col w-full bg-white">
      {/* Desktop Hero */}
      <div className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="relative w-full h-[450px] bg-emerald-50 rounded-[32px] overflow-hidden flex shadow-sm border border-emerald-100">
          {/* Illustration background */}
          <div className="absolute inset-0 right-0 left-auto w-[65%] h-full flex items-end justify-end overflow-hidden">
            <img 
              src="/banner.png" 
              alt="Green cityscape" 
              className="w-full h-full object-cover object-left-bottom"
            />
          </div>
          
          {/* Dark Card */}
          <div className="relative z-10 bg-[#1e293b] text-white p-12 w-full md:w-[45%] max-w-lg shadow-2xl skew-x-3 -ml-8 flex flex-col justify-center border-r-[8px] border-emerald-500">
            <div className="-skew-x-3 pl-8">
              <h1 className="text-5xl lg:text-6xl font-extrabold mb-3 tracking-tight">Green eye</h1>
              <p className="text-sm tracking-widest uppercase text-emerald-400 mb-8 font-bold">Watch. Expose. Change.</p>
              <p className="text-lg lg:text-xl mb-12 text-slate-300 leading-relaxed font-medium">Report litter instantly, track your impact, & keep your surroundings clean.</p>
              <Link to="/report" className="bg-white text-slate-800 px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-4 hover:scale-105 hover:bg-slate-50 transition-all shadow-xl group">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <Camera className="text-emerald-600" size={24} />
                </div>
                <span>Report Litter Today</span>
                <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform ml-2" size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sections Container */}
      <div className="w-full max-w-5xl mx-auto px-6 py-16 flex flex-col gap-32">
        
        {/* Our Values */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Leaf className="text-emerald-600" size={36} />
            <h2 className="text-3xl font-bold text-slate-800">Our Values</h2>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            This platform empowers you to take swift action against litter in your surroundings. Capture, report, and track cleanup efforts in real time. Join a community committed to creating cleaner, healthier public spaces—one report at a time.
          </p>
        </section>

        {/* My Activities */}
        <section id="activities" className="flex flex-col items-center scroll-mt-24">
          <div className="flex items-center gap-4 mb-12">
            <Activity className="text-emerald-600" size={36} />
            <h2 className="text-3xl font-bold text-slate-800">My Activities</h2>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-2 rounded-full shrink-0">
                    <MapPin className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Ernakulam</h3>
                    <p className="text-xs text-slate-500 mb-3">29-04-2025 | 02:30 PM</p>
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">Resolved</span>
                    <p className="text-sm text-slate-600 leading-relaxed">Garbage spotted near North Railway Station, primarily plastic waste.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards */}
        <section id="rewards" className="flex flex-col items-center scroll-mt-24">
          <div className="flex items-center gap-4 mb-6">
            <Trophy className="text-emerald-600" size={36} />
            <h2 className="text-3xl font-bold text-slate-800">Rewards</h2>
          </div>
          <h3 className="text-2xl font-medium text-slate-800 mb-12">You earned <span className="font-bold text-emerald-600 text-3xl">60</span> Points</h3>
          
          <div className="grid grid-cols-2 gap-12 w-full">
            {/* Left: Point History */}
            <div className="flex flex-col gap-2">
              {[
                { id: 1, loc: 'Ernakulam', pts: 10 },
                { id: 2, loc: 'Trivandrum', pts: 10 },
                { id: 3, loc: 'Malappuram', pts: 10 },
                { id: 4, loc: 'Calicut', pts: 10 },
                { id: 5, loc: 'Trissur', pts: 10 },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.loc}</h4>
                      <p className="text-xs text-slate-500 mt-1">05-01-2025</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">{item.pts}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Points</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right: How to Redeem */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm h-fit">
              <h4 className="font-bold text-slate-800 text-xl mb-8">How to Redeem Points</h4>
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-6">
                  <div className="text-emerald-600 bg-emerald-50 p-3 rounded-xl"><Store size={24} /></div>
                  <span className="text-slate-700 font-medium text-lg">Select a store</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-emerald-600 bg-emerald-50 p-3 rounded-xl"><Star size={24} /></div>
                  <span className="text-slate-700 font-medium text-lg">Enter number of points</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-emerald-600 bg-emerald-50 p-3 rounded-xl"><Copy size={24} /></div>
                  <span className="text-slate-700 font-medium text-lg">Copy the coupon code</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-emerald-600 bg-emerald-50 p-3 rounded-xl"><Globe size={24} /></div>
                  <span className="text-slate-700 font-medium text-lg">Go to stores website</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events */}
        <section id="events" className="flex flex-col items-center scroll-mt-24">
          <div className="flex items-center gap-4 mb-12">
            <Calendar className="text-emerald-600" size={36} />
            <h2 className="text-3xl font-bold text-slate-800">Events</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-12 w-full items-start">
            {/* Left: List */}
            <div>
              <div className="flex gap-8 border-b border-slate-200 mb-6">
                <button className="pb-3 border-b-2 border-emerald-600 font-bold text-emerald-700 text-lg">Upcoming</button>
                <button className="pb-3 text-slate-500 font-medium text-lg hover:text-slate-800 transition-colors">Completed</button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { id: 1, loc: 'Ernakulam', active: true },
                  { id: 2, loc: 'Calicut', active: false },
                  { id: 3, loc: 'Malappuram', active: false },
                  { id: 4, loc: 'Trivandrum', active: false },
                  { id: 5, loc: 'Trissur', active: false },
                ].map(item => (
                  <div key={item.id} className={`p-5 rounded-2xl flex justify-between items-start transition-colors cursor-pointer ${item.active ? 'bg-slate-100' : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}>
                     <div>
                       <h4 className="font-bold text-slate-800 text-lg">{item.loc}</h4>
                       <p className="text-xs text-slate-500 mt-1 mb-2">05-01-2025 | 10:00AM - 12PM</p>
                       <p className="text-sm text-slate-700">Cleaning Gov. High school Kakkanad</p>
                     </div>
                     <Heart className={item.active ? "fill-emerald-500 text-emerald-500" : "text-slate-300"} size={24} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right: Details */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm sticky top-32">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Cleaning Gov. High School Kakkanad</h3>
              <p className="text-slate-500 mb-8 font-medium">05-01-2025 | 10:00AM - 12PM</p>
              
              <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
                <button className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl hover:bg-emerald-100 transition-colors"><Heart className="fill-emerald-500" size={24}/></button>
                <button className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-100 transition-colors"><Share2 size={24}/></button>
              </div>
              
              <h4 className="font-bold text-slate-800 mb-6 text-lg">Things to Bring</h4>
              <ul className="flex flex-col gap-4 mb-10">
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">🧢</span> Hat / Cap (for sun protection)</li>
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">😷</span> Face mask (for dust)</li>
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">🧤</span> Reusable gloves</li>
              </ul>
              
              <h4 className="font-bold text-slate-800 mb-6 text-lg">Things Provided</h4>
              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">👕</span> Event-branded t-shirts</li>
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">🧹</span> Brooms / dustpans</li>
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">🧴</span> Hand sanitizer</li>
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">🥤</span> Refreshments</li>
                <li className="flex items-center gap-4 text-slate-600"><span className="text-2xl bg-slate-50 p-2 rounded-xl">📜</span> Participation certificates</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Articles */}
        <section id="articles" className="flex flex-col items-center scroll-mt-24">
          <div className="flex items-center gap-4 mb-12">
            <Newspaper className="text-emerald-600" size={36} />
            <h2 className="text-3xl font-bold text-slate-800">Articles</h2>
          </div>
          
          <div className="flex flex-col gap-8 w-full max-w-4xl">
            {[
              { id: 1, title: 'World Environment Day', icon: '🌍', color: '#dcfce7' },
              { id: 2, title: '10 Simple Ways to Live a More Sustainable Lifestyle', icon: '♻️', color: '#fef3c7' },
              { id: 3, title: 'The Future of Green energy', icon: '⚡', color: '#dbeafe' },
              { id: 4, title: 'Climate Change - Understanding the Global Crisis', icon: '🏭', color: '#ffedd5' },
            ].map(article => (
              <div key={article.id} className="flex gap-8 items-center border-b border-slate-100 pb-8 last:border-0">
                <div className="w-32 h-40 rounded-2xl flex items-center justify-center text-5xl shrink-0 shadow-sm border border-slate-200" style={{ backgroundColor: article.color }}>
                  {article.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{article.title}</h3>
                  <p className="text-sm text-emerald-600 font-bold mb-3">1st April 2025</p>
                  <p className="text-slate-600 leading-relaxed">World Environment Day is celebrated every year on June 5th to raise awareness and encourage action for the protection of our environment.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer / Contact Us */}
      <footer id="contact" className="bg-[#1e293b] text-white py-20 px-6 mt-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-bold mb-10">Contact Us</h3>
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-slate-400 mb-2 text-sm uppercase tracking-wider font-semibold">Phone:</p>
                <p className="font-medium text-lg">+91 9496750374</p>
              </div>
              <div>
                <p className="text-slate-400 mb-2 text-sm uppercase tracking-wider font-semibold">Email:</p>
                <p className="font-medium text-lg">greeneye.gmail.com</p>
              </div>
              <div>
                <p className="text-slate-400 mb-2 text-sm uppercase tracking-wider font-semibold">Address:</p>
                <p className="font-medium text-lg leading-relaxed">Green eye Foundation, Future Tower, Ernakulam, Kerala, India</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-10">Contact Form</h3>
            <form className="flex flex-col gap-5">
              <div className="flex gap-5">
                <input type="text" placeholder="Name" className="flex-1 bg-white rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="email" placeholder="Email" className="flex-1 bg-white rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <input type="text" placeholder="Subject" className="w-full bg-white rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <textarea placeholder="Message" rows={5} className="w-full bg-white rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
              <button type="button" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold self-end flex items-center gap-3 hover:bg-emerald-500 transition-colors mt-2">
                <Send size={20} />
                Send
              </button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
