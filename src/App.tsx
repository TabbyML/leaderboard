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
import { Tabs, TabsContent } from "@/components/ui/tabs"

import "./App.css";
import { cn } from './lib/utils';

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
  const [value, setValue] = useState<string>(new URLSearchParams(window.location.search.substring(1)).get("kind") || "tabby");
  return (
    <div className="w-screen flex flex-col items-center pt-20 text-center">
      <p className="font-sf text-4xl">Coding LLMs Leaderboard</p>
      <p className="mt-4 font-thin">Curated by <a target="_blank" rel="noreferrer" className='underline decoration-slate-400' href="https://tabbyml.com">TabbyML Team</a> with ❤️ in San Francisco</p>
      <p className="mt-2 text-sm italic">Last Updated: 11/13/2023</p>

      <Tabs className="mt-12" value={value}>
        <TabsContent value="tabby">
          <Leaderboard url="/tabby.yml" />
        </TabsContent>
        <TabsContent value="instruct">
          <Leaderboard url="/instruct.yml" />
        </TabsContent>
        <TabsContent value="cceval">
          <Leaderboard url="/cceval.yml" />
        </TabsContent>
      </Tabs>

      {value === "cceval" && <span className='text-sm mx-4 font-thin lg:w-[500px] mt-4'>
        Numbers provided in this section are sourced from <a target='_blank' rel="noreferrer" className='italic underline decoration-slate-400' href="https://crosscodeeval.github.io/">CrossCodeEval: A Diverse and Multilingual Benchmark for Cross-File Code Completion</a>
      </span>}


      <div className='flex justify-center my-14'>
        <MetricExplanation />
      </div>

      <div className='lg:fixed lg:bottom-0 my-10 flex flex-col gap-4 lg:flex-row'>
        <TabTrigger setValue={setValue} label="tabby" value={value}>Which models plays best in Tabby?</TabTrigger>
        <TabTrigger setValue={setValue} label="instruct" value={value}>Does instruct fine-tuning improve code completion?</TabTrigger>
        <TabTrigger setValue={setValue} label="cceval" value={value}>How do open-source models compare to ChatGPT?</TabTrigger>
      </div>
    </div>
  );
}

function TabTrigger({ label, value, setValue, children }: { label: string, value: string, setValue: (x: string) => void, children: React.ReactNode }) {
  const linkStyle = "text-sm text-zinc-500 cursor-pointer";
  return <div className={cn(linkStyle, { "text-black": value === label })} onClick={() => setValue(label)}>{children}</div>
}

function Leaderboard({ url }: { url: string }) {
  const [models, setModels] = useState<ModelItem[]>([])

  useEffect(() => {
    fetch(url)
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
  }, [url]);

  return <div className="flex flex-col">
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
  </div>

}

function MetricBars({ model }: { model: ModelItem }) {
  const greaterThanMd = useGreater('md');
  const multiplier = greaterThanMd ? 24 : 12;
  return <div className='text-xs py-1 lg:py-0'>
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