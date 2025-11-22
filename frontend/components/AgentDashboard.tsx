'use client';

import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface Agent {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'exhausted';
}

interface AgentDashboardProps {
  minikit: MiniKit | null;
}

export function AgentDashboard({ minikit }: AgentDashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployAgent = async (formData: { name: string; description: string; budget: number }) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/agents/deploy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowDeployModal(false);
        fetchAgents();
      } else {
        throw new Error('Failed to deploy agent');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading agents...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Agents</h2>
          <p className="text-gray-600">
            Deploy AI agents that can autonomously use APIs with your authorization
          </p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Deploy Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No agents deployed yet.</p>
          <button
            onClick={() => setShowDeployModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Deploy your first agent →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    agent.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : agent.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">${agent.budget.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-medium">${agent.spent.toFixed(4)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(agent.spent / agent.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeployModal && (
        <DeployAgentModal
          onClose={() => setShowDeployModal(false)}
          onDeploy={handleDeployAgent}
        />
      )}
    </div>
  );
}

function DeployAgentModal({
  onClose,
  onDeploy,
}: {
  onClose: () => void;
  onDeploy: (data: { name: string; description: string; budget: number }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDeploy({
      name,
      description,
      budget: parseFloat(budget),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Deploy AI Agent</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (USDC)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Deploy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

