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
    <div className="w-screen flex flex-col items-center pt-20 text-center">
      <p className="font-sf text-4xl">Coding LLMs Leaderboard</p>
      <p className="mt-4 font-thin">Curated by <a target="_blank" className='underline' href="https://tabbyml.com">TabbyML Team</a> with ❤️ in San Francisco</p>

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
            <div key={model.name} className="flex flex-col md:flex-row text-sm metric-item items-start md:items-center">
              <p className="font-semibold font-sf tracking-wide md:w-48 md:mr-6 md:text-right">{model.name}</p>
              <Metrics model={model} />
            </div>
          )
        })}

        <div className='flex justify-center my-14'>
          <MetricExplanation />
        </div>
      </div>
    </div>
  );
}

function Metrics({ model }: { model: ModelItem }) {
  const multiplier = 12;
  return <div>
    <div className='toggle-metric flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: model.baseline.average * multiplier, background: 'linear-gradient(90deg, hsla(152, 100%, 60%, 0.5) 0%, hsla(186, 100%, 69%, 0.5) 100%)' }} />
      <span>{model.baseline.average}%</span>
    </div>
    <div className='flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: model.bm25.average * multiplier, background: 'linear-gradient(90deg, hsla(279, 83%, 85%, 1) 0%, hsla(321, 90%, 70%, 1) 100%)' }} />
      <span>{model.bm25.average}%</span>
    </div>
    <div className='toggle-metric flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: model.oracle.average * multiplier, background: 'linear-gradient(90deg, hsla(192, 95%, 70%, 0.6) 0%, hsla(225, 89%, 47%, 0.6) 100%)' }} />
      <span>{model.oracle.average}%</span>
    </div>
  </div>
}

function MetricExplanation() {
  const width = 20;
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