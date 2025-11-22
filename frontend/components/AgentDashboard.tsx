'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'exhausted';
}

export function AgentDashboard({ compact = false }: { compact?: boolean }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { getApiUrl } = await import('@/lib/api-config');
      const apiUrl = getApiUrl();
      // Auth is currently bypassed, so no token needed
      const headers: HeadersInit = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/agents`, {
        headers,
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
      const { getApiUrl } = await import('@/lib/api-config');
      const apiUrl = getApiUrl();
      // Auth is currently bypassed, so no token needed
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/agents/deploy`, {
        method: 'POST',
        headers,
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0d6efd] border-t-transparent mx-auto"></div>
        <p className="mt-4 text-[#6c757d]">Loading agents...</p>
      </div>
    );
  }

  if (compact) {
    // Compact view for side-by-side windows
    return (
      <div className="animate-fade-in">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0d6efd] border-t-transparent mx-auto"></div>
            <p className="mt-2 text-[#6c757d] text-sm">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-[#6c757d] text-sm mb-4">No agents deployed</p>
            <button
              onClick={() => setShowDeployModal(true)}
              className="retro-button retro-button-primary px-4 py-2 rounded-lg font-semibold text-sm w-full"
            >
              Deploy Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="retro-card rounded-lg p-3 border border-[#e9ecef] hover:border-[#0d6efd] transition-all"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🤖</div>
                  <h3 className="text-xs font-semibold text-[#212529] mb-1 truncate">{agent.name}</h3>
                  <p className="text-xs text-[#6c757d] mb-2">{agent.status}</p>
                  <div className="w-full bg-[#e9ecef] rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full ${
                        (agent.spent / agent.budget) * 100 > 90
                          ? 'bg-red-500'
                          : (agent.spent / agent.budget) * 100 > 70
                          ? 'bg-[#ffc107]'
                          : 'bg-[#198754]'
                      }`}
                      style={{ width: `${Math.min((agent.spent / agent.budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowDeployModal(true)}
              className="retro-card rounded-lg p-3 border-2 border-dashed border-[#e9ecef] hover:border-[#0d6efd] transition-all flex items-center justify-center cursor-pointer"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">+</div>
                <p className="text-xs font-semibold text-[#6c757d]">Deploy</p>
              </div>
            </button>
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

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2 sm:mb-3">AI Agents</h2>
          <p className="text-[#6c757d] text-sm sm:text-base">
            Deploy AI agents that can autonomously use APIs with your authorization
          </p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="retro-button retro-button-primary px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
        >
          Deploy Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16 sm:py-20 retro-card rounded-lg border-2 border-dashed border-[#e9ecef]">
          <div className="mx-auto w-20 h-20 sm:w-28 sm:h-28 retro-card rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-[#6c757d]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#212529] mb-2 sm:mb-3">No agents deployed yet</h3>
          <p className="text-[#6c757d] text-sm sm:text-base mb-6 sm:mb-8">
            Deploy your first AI agent to start automating API calls
          </p>
          <button
            onClick={() => setShowDeployModal(true)}
            className="retro-button retro-button-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg w-full sm:w-auto"
          >
            Deploy Your First Agent
          </button>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="retro-card rounded-lg p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[#6c757d] mb-1 sm:mb-2">Total Agents</p>
              <p className="text-xl sm:text-3xl font-bold text-[#212529]">{agents.length}</p>
            </div>
            <div className="retro-card rounded-lg p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[#6c757d] mb-1 sm:mb-2">Total Budget</p>
              <p className="text-xl sm:text-3xl font-bold text-[#212529]">
                ${agents.reduce((sum, a) => sum + a.budget, 0).toFixed(2)} USDC
              </p>
            </div>
            <div className="retro-card rounded-lg p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-[#6c757d] mb-1 sm:mb-2">Active</p>
              <p className="text-xl sm:text-3xl font-bold text-[#198754]">
                {agents.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {agents.map((agent) => {
              const budgetUsed = (agent.spent / agent.budget) * 100;
              const remaining = agent.budget - agent.spent;
              
              return (
                <div
                  key={agent.id}
                  className="retro-card rounded-lg p-4 sm:p-6 transition-all duration-200 hover:shadow-md animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-4 sm:mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 retro-card rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 sm:w-7 sm:h-7 text-[#0d6efd]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-[#212529] truncate">{agent.name}</h3>
                          <p className="text-xs text-[#6c757d]">ID: {agent.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[#6c757d] mt-2 leading-relaxed">{agent.description}</p>
                    </div>
                    <span className="retro-badge px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs font-semibold flex-shrink-0 ml-2">
                      {agent.status}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-5">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#6c757d]">Budget:</span>
                      <span className="font-semibold text-[#212529]">${agent.budget.toFixed(4)} USDC</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#6c757d]">Spent:</span>
                      <span className="font-semibold text-red-600">${agent.spent.toFixed(4)} USDC</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#6c757d]">Remaining:</span>
                      <span className="font-semibold text-[#198754]">${remaining.toFixed(4)} USDC</span>
                    </div>
                    <div className="w-full bg-[#e9ecef] rounded-full h-2 sm:h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          budgetUsed > 90
                            ? 'bg-red-500'
                            : budgetUsed > 70
                            ? 'bg-[#ffc107]'
                            : 'bg-[#198754]'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#6c757d] text-center">
                      {budgetUsed.toFixed(1)}% of budget used
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 retro-divider flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      className="flex-1 retro-button px-4 py-2 text-sm font-semibold"
                      onClick={() => {
                        // TODO: Pause/resume agent
                        alert('Agent controls coming soon!');
                      }}
                    >
                      {agent.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      className="flex-1 px-4 py-2 text-sm font-semibold text-red-600 retro-card border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      onClick={() => {
                        // TODO: Delete agent
                        if (confirm('Are you sure you want to delete this agent?')) {
                          alert('Agent deletion coming soon!');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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

