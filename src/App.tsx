import { useEffect, useState } from 'react';
import jsyaml from 'js-yaml';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import "./App.css";

type Metrics = {
  baseline: {
    average: number,
  },
  oracle: {
    average: number,
  },
  bm25: {
    average: number,
  }
}

type Leaderboard = {
  models: {
    [key: string]: Metrics
  }
}

type ModelItem = {
  name: string
} & Metrics

export default function App() {
  const [models, setModels] = useState<ModelItem[]>([])

  useEffect(() => {
    fetch('/leaderboard.yml')
      .then(res => res.text())
      .then(yaml => {
        const data = jsyaml.load(yaml) as Leaderboard;
        const models = Object.entries(data.models)
          .map(([modelName, modelData]) => {
            return { name: modelName, ...modelData }
          })
          .sort((a, b) => {
            return b.bm25.average - a.bm25.average
          })
        setModels(models)
      });
  }, []);

  return (
    <div className="w-screen flex flex-col items-center pt-20">
      <p className="font-sf text-4xl">Coding LLMs Leaderboard</p>
      <p className="mt-4 font-thin">Curated by <a target="_blank" className='underline decoration-slate-400' href="https://tabbyml.com">TabbyML team</a> with ❤️ in San Francisco</p>
      <p className="mt-2 text-sm italic text-center mb-4">Last updated: 11/05/2023</p>

      <div className="mt-8">
        {false && <div className='flex justify-center mt-2 mb-6'>
          <Select>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Next Line Accuracy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="average">Next Line Accuracy</SelectItem>
            </SelectContent>
          </Select>
        </div>}

        {models.map(model => {
          return (
            <div key={model.name} className="flex items-center text-sm metric-item">
              <p className="font-semibold w-48 text-right mr-6 font-sf tracking-wide">{model.name}</p>
              <Metrics model={model} />
            </div>
          )
        })}

        <div className='flex justify-center mt-14'>
          <MetricExplanation />
        </div>
      </div>
    </div>
  );
}

function Metrics({ model }: { model: ModelItem }) {
  return <div>
    <div className='toggle-metric flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: `${model.baseline.average * 30}px`, background: 'linear-gradient(90deg, hsla(152, 100%, 60%, 0.5) 0%, hsla(186, 100%, 69%, 0.5) 100%)' }} />
      <span>{model.baseline.average}%</span>
    </div>
    <div className='flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: `${model.bm25.average * 30}px`, background: 'linear-gradient(90deg, hsla(279, 83%, 85%, 1) 0%, hsla(321, 90%, 70%, 1) 100%)' }} />
      <span>{model.bm25.average}%</span>
    </div>
    <div className='toggle-metric flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: `${model.oracle.average * 30}px`, background: 'linear-gradient(90deg, hsla(192, 95%, 70%, 0.6) 0%, hsla(225, 89%, 47%, 0.6) 100%)' }} />
      <span>{model.oracle.average}%</span>
    </div>
  </div>
}

function MetricExplanation() {
  const width = 40;
  return <div className='flex flex-col font-thin'>
    <div className='flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width, background: 'linear-gradient(90deg, hsla(152, 100%, 60%, 0.5) 0%, hsla(186, 100%, 69%, 0.5) 100%)' }} />
      <span>Baseline</span>
    </div>
    <div className='flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width, background: 'linear-gradient(90deg, hsla(279, 83%, 85%, 1) 0%, hsla(321, 90%, 70%, 1) 100%)' }} />
      <span>with Repository Context ( BM25 )</span>
    </div>
    <div className='flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width, background: 'linear-gradient(90deg, hsla(192, 95%, 70%, 0.6) 0%, hsla(225, 89%, 47%, 0.6) 100%)' }} />
      <span>with Repository Context ( Oracle )</span>
    </div>
  </div>
}
