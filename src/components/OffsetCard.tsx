import { ExternalLink, ShieldCheck } from 'lucide-react';

export interface OffsetProject {
  id: string;
  name: string;
  location: string;
  costPerTonne: number; // USD
  certification: string; // Gold Standard or VCS
  desc: string;
  link: string;
}

export const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: '1',
    name: 'Andean Forest Reforestation',
    location: 'Andes Range, Ecuador',
    costPerTonne: 14.50,
    certification: 'Gold Standard',
    desc: 'Restoring native biodiverse tree canopies in high-altitude slopes. Prevents soil erosion and re-establishes wildlife runaways.',
    link: 'https://www.goldstandard.org',
  },
  {
    id: '2',
    name: 'Clean Cookstove Replacement Initiative',
    location: 'Rural Communities, Kenya',
    costPerTonne: 11.00,
    certification: 'Gold Standard (GS)',
    desc: 'Replacing inefficient firewood logs with high-efficiency burning chambers, drastically lowering household smoke inhalation and direct carbon output.',
    link: 'https://www.goldstandard.org',
  },
  {
    id: '3',
    name: 'Thar Renewable Wind Farm',
    location: 'Rajasthan, India',
    costPerTonne: 8.50,
    certification: 'VCS - Verified Carbon Standard',
    desc: 'Constructing modern turbine configurations to feed clean electricity directly to regional grid lines, displacing legacy coal production.',
    link: 'https://verra.org',
  },
  {
    id: '4',
    name: 'Mekong Mangrove Blue Carbon',
    location: 'Mekong Delta, Vietnam',
    costPerTonne: 18.00,
    certification: 'VCS + CCB Gold',
    desc: 'Restoring marine mangrove wetlands that suck up carbon up to 10x faster than traditional forests. Helps secure flood protection for coastline communities.',
    link: 'https://verra.org',
  },
  {
    id: '5',
    name: 'Local Grid Solar Cooperative',
    location: 'California, USA',
    costPerTonne: 24.00,
    certification: 'Gold Standard',
    desc: 'Installing clean solar cells over public buildings. Increases community resiliency and supplies clean energy directly to low-income neighborhoods.',
    link: 'https://www.goldstandard.org',
  },
];

interface OffsetCardProps {
  project: OffsetProject;
  userMonthlyAverageKg: number; // e.g. 15.0 kg/day -> 450kg/month -> 0.45 tonnes
}

export default function OffsetCard({ project, userMonthlyAverageKg }: OffsetCardProps) {
  // Compute user delta (30 days of daily emissions = monthly kg)
  const monthlyTonnes = (userMonthlyAverageKg * 30) / 1000;
  const priceToOffset = Number((monthlyTonnes * project.costPerTonne).toFixed(2));

  return (
    <div key={project.id} className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div>
        {/* Header Metadata */}
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-normal tracking-wide text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>{project.certification}</span>
          </span>
          <span className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
            ${project.costPerTonne.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">/ t</span>
          </span>
        </div>

        {/* Name and Description */}
        <h4 className="mt-3.5 font-sans text-base font-semibold text-slate-800 group-hover:text-green-600 transition-colors">
          {project.name}
        </h4>
        <span className="text-xs text-slate-400 font-medium tracking-wide">
          {project.location}
        </span>
        
        <p className="mt-2.5 font-sans text-xs leading-relaxed text-slate-500">
          {project.desc}
        </p>
      </div>

      {/* Carbon Offset Quote Calculator */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-slate-400">Your monthly average:</span>
          <span className="font-sans font-medium text-slate-600 tabular-nums">
            {(userMonthlyAverageKg * 30).toFixed(0)} kg CO₂ ({(monthlyTonnes).toFixed(2)}t)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 tracking-wider">Offset Cost</span>
            <span className="font-mono text-lg font-semibold text-slate-800 tabular-nums">
              ${priceToOffset > 0 ? priceToOffset.toFixed(2) : '0.00'}
            </span>
          </div>

          <a
            href={project.link}
            target="_blank"
            referrerPolicy="no-referrer"
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all font-medium active:scale-95"
          >
            <span>Invest</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
