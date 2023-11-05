import { useEffect, useState } from'react';
import jsyaml from 'js-yaml';

import './App.css';

type Metrics = {
  baseline: {
    average?: number,
    python?: number,
    java?: number,
    typescript?: number,
    "c#"?: number
  },
  oracle: {
    average?: number,
    python?: number,
    java?: number,
    typescript?: number,
    "c#"?: number
  },
  bm25: {
    average: number,
    python: number,
    java: number,
    typescript: number,
    "c#": number
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

function App() {
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
            return  b.bm25.average - a.bm25.average
          })
        setModels(models)
      }); 
  }, []);

  return (
    <div className="w-screen flex flex-col items-center pt-20">
      <p className="font-sf text-4xl">CCEval Leaderboard</p>
      <p className="mt-1 text-gray-700">A Diverse and Multilingual Benchmark for Cross-File Code Completion</p>

      <p>Baseline: only current file context</p>
      <p>BM25: cross-file context retrieval</p>
      <p>Oracle: upper bound cross-file context retrieval</p>

      <div className="mt-10">
        {models.map(model => {
          const width = model.bm25.average * 30
          const baselineLeft = model.baseline.average ? model.baseline.average * 30 : 0
          const oracleLeft = model.oracle.average ? model.oracle.average * 30 : 0
          return (
            <div className="flex items-center py-4 model-item">
              <p className="text-xl w-48 text-right mr-6 font-sf tracking-wide">{model.name}</p>
              <div className="flex-1 relative ">
                <div className="metric-number text-sm absolute flex flex-col items-center -ml-5 bottom-full" style={{ left: `${baselineLeft}px` }}>
                  <p className='leading-none'>baseline</p>
                  <p className='leading-none'>{model.baseline.average}</p>
                </div>
                <div className="metric-number text-sm absolute flex flex-col items-center -ml-5 bottom-full" style={{ left: `${width}px` }}>
                  <p className='leading-none'>bm25</p>
                  <p className='leading-none'>{model.bm25.average}</p>
                </div>
                <div className="metric-number text-sm absolute flex flex-col items-center -ml-5 bottom-full" style={{ left: `${oracleLeft}px` }}>
                  <p className='leading-none'>oracle</p>
                  <p className='leading-none'>{model.oracle.average}</p>
                </div>

                <div className="rounded-full h-3" style={{ width: `${width}px`, background: 'linear-gradient(90deg, rgba(66,164,235,1) 0%, rgba(162,119,255,1) 100%)' }} />
              </div>
            </div>
          )
        })}
      </div>
      
    </div>
  );
}

export default App;
