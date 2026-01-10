
import React, { useState, useEffect, useRef } from 'react';
import { generateMindMap, generateMindMapFromImage } from '../services/geminiService';
import { MindMapData } from '../types';
import { Search, Loader2, RefreshCw, GitBranch, Camera, Info, MousePointer2, X, BookOpen, Sparkles } from 'lucide-react';
import * as d3 from 'd3';
import FormattedContent from '../components/FormattedContent';

interface MindMapVisualizerProps {
  onApiError?: (err: any) => void;
}

const MindMapVisualizer: React.FC<MindMapVisualizerProps> = ({ onApiError }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<MindMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoomRef = useRef<any>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setSelectedNode(null);
    try {
      const result = await generateMindMap(topic);
      setData(result);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("403") || err.message?.includes("permission") || err.message?.includes("not found")) {
        onApiError?.(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSelectedNode(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const result = await generateMindMapFromImage(base64, file.type);
        setData(result);
        if (result.nodes.length > 0) setTopic(result.nodes[0].label);
      } catch (err: any) {
        console.error("Vision error", err);
        if (err.message?.includes("403") || err.message?.includes("permission") || err.message?.includes("not found")) {
          onApiError?.(err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetView = () => {
    if (svgRef.current && zoomRef.current) {
      const width = svgRef.current.clientWidth || 800;
      const height = svgRef.current.clientHeight || 600;
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const colorScale = d3.scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3, 4])
      .range(['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']);

    const container = svg.append('g').attr('class', 'mindmap-container');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    
    zoomRef.current = zoom;
    svg.call(zoom as any);
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('collision', d3.forceCollide().radius(d => (d as any).label.length * 5 + 50))
      .force('x', d3.forceX(0).strength(0.05))
      .force('y', d3.forceY(0).strength(0.05));

    const link = container.append('g')
      .selectAll('path')
      .data(data.links)
      .enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)
      .attr('class', 'link');

    const node = container.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
      })
      .on('mouseenter', function(event, d: any) {
        const connectedNodes = new Set();
        connectedNodes.add(d.id);
        
        link.transition().duration(200)
          .attr('stroke', (l: any) => {
            if (l.source.id === d.id || l.target.id === d.id) {
              connectedNodes.add(l.source.id);
              connectedNodes.add(l.target.id);
              return colorScale(d.group);
            }
            return '#f1f5f9';
          })
          .attr('stroke-width', (l: any) => (l.source.id === d.id || l.target.id === d.id) ? 3 : 1);

        node.transition().duration(200)
          .style('opacity', (n: any) => connectedNodes.has(n.id) ? 1 : 0.3);
      })
      .on('mouseleave', function() {
        link.transition().duration(200)
          .attr('stroke', '#e2e8f0')
          .attr('stroke-width', 2);
        
        node.transition().duration(200)
          .style('opacity', 1);
      })
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('rect')
      .attr('width', d => d.label.length * 10 + 40)
      .attr('height', 44)
      .attr('x', d => -(d.label.length * 10 + 40) / 2)
      .attr('y', -22)
      .attr('rx', 22)
      .attr('fill', d => d.group === 0 ? colorScale(0) : '#fff')
      .attr('stroke', d => colorScale(d.group))
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))');

    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', d => d.group === 0 ? '#fff' : '#1e293b')
      .attr('font-size', d => d.group === 0 ? '16px' : '14px')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .style('font-family', 'Poppins, sans-serif');

    simulation.on('tick', () => {
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [data]);

  return (
    <div className="space-y-6 relative h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-xl font-bold flex items-center">
                  <GitBranch className="text-blue-600 mr-2" size={24} />
                  Academic Concept Engine
                </h3>
                <p className="text-gray-500 text-sm">Now with detailed definitions and examples for every topic.</p>
            </div>
            <div className="flex space-x-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-100">
                    <Camera size={16} className="mr-2" /> Scan Notes
                </button>
                <button onClick={resetView} className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200">
                    <RefreshCw size={16} className="mr-2" /> Reset View
                </button>
            </div>
        </div>
        
        <form onSubmit={handleGenerate} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic for deep mapping..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
          </div>
          <button type="submit" disabled={isLoading || !topic.trim()} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-blue-200 flex items-center">
            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Sparkles size={20} className="mr-2" />} Generate Map
          </button>
        </form>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden flex">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-12">
             <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <GitBranch className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
             </div>
             <h4 className="text-xl font-bold text-gray-800">Analyzing Subject Context</h4>
             <p className="text-gray-500 mt-2 max-w-xs">Fetching definitions and exam-focused examples...</p>
          </div>
        )}

        <div className="flex-1 relative">
          <div className="absolute bottom-4 left-4 p-2 bg-white/80 backdrop-blur rounded-lg border border-gray-200 text-[10px] text-gray-400 font-bold uppercase flex items-center pointer-events-none z-10">
            <MousePointer2 size={12} className="mr-1" /> Click nodes for insights
          </div>
          {data ? (
            <svg ref={svgRef} className="w-full h-full bg-gray-50/30"></svg>
          ) : !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <GitBranch size={64} className="text-blue-100 mb-6" />
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Build Your Knowledge Base</h4>
              <p className="max-w-md text-gray-500">Every concept mapped here includes its own specialized study material.</p>
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl z-20">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Concept Insights</h4>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20}/></button>
            </div>
            
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-4">
                <BookOpen size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedNode.label}</h2>
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <FormattedContent content={selectedNode.details || "Generating details..."} />
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center text-indigo-700 font-bold text-xs uppercase mb-2">
                  <Sparkles size={14} className="mr-2" /> Exam Tip
                </div>
                <p className="text-xs text-indigo-900">This concept is frequently tested in {topic} related questions. Focus on the examples provided above.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapVisualizer;
