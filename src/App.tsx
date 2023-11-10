import { BreakPointHooks, breakpointsTailwind } from '@react-hooks-library/core'
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

const { useGreater } =
  BreakPointHooks(breakpointsTailwind);

type Metric = {
  "C#": number,
  "Java": number,
  "Python": number,
  "TypeScript": number,
  Average: number
};

type Metrics = {
  Baseline: Metric,
  Oracle: Metric,
  BM25: Metric
}

type Models = {
  [key: string]: Metrics
}

type ModelItem = {
  name: string
} & Metrics

function addAverage(x: any) {
  const average = (array: Array<number>) => array.reduce((a, b) => a + b) / array.length;
  x['Average'] = Math.round(average(Object.values(x)) * 100) / 100;
}

export default function App() {
  const [title, setTitle] = useState<String>("");
  const [models, setModels] = useState<ModelItem[]>([])

  useEffect(() => {
    let filename;
    if (window.location.href.includes("kind=instruct")) {
      setTitle("Does instruct fine-tuning improve code completion?");
      filename = "/instruct.yml"
    } else {
      setTitle("How do open-source models compare to ChatGPT?");
      filename = "/cceval.yml";
    }
    fetch(filename)
      .then(res => res.text())
      .then(yaml => {
        const data = jsyaml.load(yaml) as Models;
        const models = Object.entries(data)
          .map(([modelName, modelData]) => {
            addAverage(modelData.Baseline);
            addAverage(modelData.BM25);
            addAverage(modelData.Oracle);
            return { name: modelName, ...modelData }
          })
          .sort((a, b) => {
            return b.BM25.Average - a.BM25.Average
          })
        setModels(models)
      });
  }, []);

  return (
    <div className="w-screen flex flex-col items-center pt-20 text-center">
      <p className="font-sf text-4xl">Coding LLMs Leaderboard</p>
      <p className="mt-4 font-thin">Curated by <a target="_blank" rel="noreferrer" className='underline decoration-slate-400' href="https://tabbyml.com">TabbyML Team</a> with ❤️ in San Francisco</p>
      <p className="mt-2 text-sm italic">Last Updated: 11/09/2023</p>

      <div className="flex flex-col mt-12">
        {title && <span className='italic font-semibold mb-4'>{title}</span>}
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
              <p className="font-sf tracking-wide md:w-48 md:mr-6 md:text-right">{model.name}</p>
              <MetricBars model={model} />
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

function MetricBars({ model }: { model: ModelItem }) {
  const greaterThanMd = useGreater('md');
  const multiplier = greaterThanMd ? 24 : 12;
  return <div className='text-xs'>
    <div className='toggle-metric flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: model.Baseline.Average * multiplier, background: 'linear-gradient(90deg, hsla(152, 100%, 60%, 0.5) 0%, hsla(186, 100%, 69%, 0.5) 100%)' }} />
      <span>{model.Baseline.Average}%</span>
    </div>
    <div className='flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: model.BM25.Average * multiplier, background: 'linear-gradient(90deg, hsla(279, 83%, 85%, 1) 0%, hsla(321, 90%, 70%, 1) 100%)' }} />
      <span>{model.BM25.Average}%</span>
    </div>
    <div className='toggle-metric flex items-center gap-2'>
      <div className="rounded-full h-2" style={{ width: model.Oracle.Average * multiplier, background: 'linear-gradient(90deg, hsla(192, 95%, 70%, 0.6) 0%, hsla(225, 89%, 47%, 0.6) 100%)' }} />
      <span>{model.Oracle.Average}%</span>
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