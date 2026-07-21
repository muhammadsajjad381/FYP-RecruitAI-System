// import React from 'react';

// export default function FilterSidebar() {
//   const categories = ["Frontend", "Backend", "AI/ML", "Data Science", "Mobile App"];
  
//   return (
//     <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit sticky top-24">
//       <h3 className="text-white font-bold mb-6 text-lg">Filters</h3>
      
//       {/* Category Filter */}
//       <div className="mb-8">
//         <p className="text-indigo-400 text-sm font-semibold mb-3 uppercase tracking-wider">Category</p>
//         <div className="space-y-3">
//           {categories.map((cat) => (
//             <label key={cat} className="flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer group">
//               <input type="checkbox" className="w-4 h-4 accent-indigo-600 rounded bg-slate-800 border-slate-700" />
//               <span className="text-sm group-hover:translate-x-1 transition-transform">{cat}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Experience Level */}
//       <div className="mb-8">
//         <p className="text-indigo-400 text-sm font-semibold mb-3 uppercase tracking-wider">Experience</p>
//         <select className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg p-2 text-sm outline-none focus:border-indigo-500">
//           <option>Entry Level</option>
//           <option>Intermediate</option>
//           <option>Expert</option>
//         </select>
//       </div>

//       <button className="w-full py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/30 rounded-lg hover:bg-indigo-600 hover:text-white transition font-medium">
//         Clear All Filters
//       </button>
//     </div>
//   );
// }