import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI } from '../../constants';
import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

interface TeamMember {
  address: `0x${string}`;
  level: number;
  directCount: number;
  isActive: boolean;
}

interface TeamTreeProps {
  address?: `0x${string}`;
}

export const TeamTree = ({ address }: TeamTreeProps) => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const toast = useToast();
  const userAddress = address || connectedAddress;
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<number[]>([1, 2, 3, 4]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // ====== Get Total Team Count (All Levels) ======
  const { data: totalTeamCount, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getTotalTeamCount',
    args: [userAddress as `0x${string}`],
    query: { enabled: !!userAddress },
  });

  // ====== Get Direct Referrals (Level 1) ======
  const { data: directReferrals, refetch: refetchDirect } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getDirectReferralsList',
    args: [userAddress as `0x${string}`],
    query: { enabled: !!userAddress },
  });

  // ====== Copy address handler ======
  const handleCopyAddress = async (addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddress(addr);
      toast.success('Copied!', 'Address copied to clipboard');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy address');
    }
  };

  // ====== Check if user is active ======
  const checkUserActive = async (addr: `0x${string}`): Promise<boolean> => {
    try {
      if (!publicClient) return false;
      
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PLP_ABI,
        functionName: 'isActive',
        args: [addr],
      }) as boolean;
      
      return result || false;
    } catch (error) {
      console.error(`Error checking active status for ${addr}:`, error);
      return false;
    }
  };

  // ====== Fetch referrals of a specific address (for levels 2, 3, 4) ======
  const fetchReferralsOf = async (addr: `0x${string}`): Promise<{ address: `0x${string}`, isActive: boolean }[]> => {
    try {
      if (!publicClient) return [];
      
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PLP_ABI,
        functionName: 'getDirectReferralsList',
        args: [addr],
      }) as `0x${string}`[];
      
      // Check active status for each referral
      const membersWithStatus = await Promise.all(
        result.map(async (ref) => ({
          address: ref,
          isActive: await checkUserActive(ref),
        }))
      );
      
      return membersWithStatus;
    } catch (error) {
      console.error(`Error fetching referrals for ${addr}:`, error);
      return [];
    }
  };

  // ====== Build complete team tree (Levels 1-4) ======
  useEffect(() => {
    const buildTeamTree = async () => {
      if (!userAddress || !directReferrals || !publicClient) return;
      
      setLoading(true);
      const allMembers: TeamMember[] = [];
      
      // Level 1: Direct referrals with active status
      const level1 = (directReferrals as `0x${string}`[]) || [];
      
      // Check active status for level 1 members
      for (const member of level1) {
        const isActive = await checkUserActive(member);
        allMembers.push({
          address: member,
          level: 1,
          directCount: 0,
          isActive: isActive,
        });
      }
      
      // Level 2: Get referrals of each level 1 member
      const level2Promises = level1.map(async (member) => {
        const refs = await fetchReferralsOf(member);
        return refs.map(ref => ({
          address: ref.address,
          level: 2,
          directCount: 0,
          isActive: ref.isActive,
        }));
      });
      
      const level2Results = await Promise.all(level2Promises);
      const level2 = level2Results.flat();
      
      // Add level 2 members
      for (const member of level2) {
        allMembers.push(member);
      }
      
      // Level 3: Get referrals of each level 2 member
      const level3Promises = level2.map(async (member) => {
        const refs = await fetchReferralsOf(member.address);
        return refs.map(ref => ({
          address: ref.address,
          level: 3,
          directCount: 0,
          isActive: ref.isActive,
        }));
      });
      
      const level3Results = await Promise.all(level3Promises);
      const level3 = level3Results.flat();
      
      // Add level 3 members
      for (const member of level3) {
        allMembers.push(member);
      }
      
      // Level 4: Get referrals of each level 3 member
      const level4Promises = level3.map(async (member) => {
        const refs = await fetchReferralsOf(member.address);
        return refs.map(ref => ({
          address: ref.address,
          level: 4,
          directCount: 0,
          isActive: ref.isActive,
        }));
      });
      
      const level4Results = await Promise.all(level4Promises);
      const level4 = level4Results.flat();
      
      // Add level 4 members
      for (const member of level4) {
        allMembers.push(member);
      }
      
      setTeamMembers(allMembers);
      setLoading(false);
    };

    buildTeamTree();
  }, [directReferrals, userAddress, publicClient]);

  // ====== Toggle level expansion ======
  const toggleLevel = (level: number) => {
    setExpandedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  // ====== Format address ======
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // ====== Get level count ======
  const getLevelCount = (level: number) => {
    return teamMembers.filter(m => m.level === level).length;
  };

  // ====== Get level members ======
  const getLevelMembers = (level: number) => {
    return teamMembers.filter(m => m.level === level);
  };

  const levelColors = {
    1: 'from-emerald-400 to-teal-500',
    2: 'from-blue-400 to-indigo-500',
    3: 'from-purple-400 to-pink-500',
    4: 'from-amber-400 to-orange-500',
  };

  const levelLabels = {
    1: '👤 Level 1 (Direct)',
    2: '👥 Level 2',
    3: '👥 Level 3',
    4: '👥 Level 4',
  };

  const levelEmojis = {
    1: '🌟',
    2: '⭐',
    3: '✨',
    4: '💫',
  };

  if (!userAddress) return null;

  const total = totalTeamCount ? Number(totalTeamCount) : teamMembers.length;

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm">🌳</span>
          <h3 className="text-lg font-semibold text-slate-800">Team Tree</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
            Total: {total}
          </span>
          <button
            onClick={() => {
              refetchTotal();
              refetchDirect();
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <svg className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-indigo-50/50 rounded-xl p-8 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-200"></div>
            <div className="h-4 w-32 bg-indigo-200 rounded"></div>
            <div className="h-3 w-24 bg-indigo-100 rounded"></div>
          </div>
          <p className="text-slate-500 text-sm mt-3">Building team tree across all levels...</p>
        </div>
      )}

      {/* No members */}
      {!loading && teamMembers.length === 0 && (
        <div className="bg-indigo-50/50 rounded-xl p-8 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-slate-500 text-sm font-medium">No team members yet</p>
          <p className="text-slate-400 text-xs mt-1">Share your referral link to grow your team!</p>
        </div>
      )}

      {/* Team Tree - All Levels */}
      {!loading && teamMembers.length > 0 && (
        <div className="space-y-3">
          {/* Level Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {[1, 2, 3, 4].map((level) => {
              const count = getLevelCount(level);
              return (
                <div key={level} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400">Level {level}</p>
                  <p className="text-lg font-bold text-slate-700">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Level-wise Tree */}
          {[1, 2, 3, 4].map((level) => {
            const members = getLevelMembers(level);
            if (members.length === 0 && level > 1) {
              return (
                <div key={level} className="border border-slate-100 rounded-xl overflow-hidden opacity-60">
                  <div className="w-full flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full bg-gradient-to-r ${levelColors[level as keyof typeof levelColors]} flex items-center justify-center text-white text-xs font-bold`}>
                        {level}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {levelLabels[level as keyof typeof levelLabels]}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                        0
                      </span>
                    </div>
                  </div>
                  <div className="p-3 text-center text-sm text-slate-400 bg-white">
                    No members at this level yet
                  </div>
                </div>
              );
            }
            if (members.length === 0) return null;

            return (
              <div key={level} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Level Header */}
                <button
                  onClick={() => toggleLevel(level)}
                  className="w-full flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-white hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-6 w-6 rounded-full bg-gradient-to-r ${levelColors[level as keyof typeof levelColors]} flex items-center justify-center text-white text-xs font-bold`}>
                      {level}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {levelEmojis[level as keyof typeof levelEmojis]} {levelLabels[level as keyof typeof levelLabels]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                      {members.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {expandedLevels.includes(level) ? 'Hide' : 'Show'}
                    </span>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        expandedLevels.includes(level) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Level Members */}
                {expandedLevels.includes(level) && (
                  <div className="p-3 space-y-1.5 bg-white max-h-96 overflow-y-auto">
                    {members.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-indigo-50/30 border border-indigo-50 rounded-lg px-3 py-2 hover:bg-indigo-50 transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs text-slate-400 font-medium w-6 shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-slate-700 truncate">
                              {formatAddress(member.address)}
                            </span>
                            <button
                              onClick={(e) => handleCopyAddress(member.address, e)}
                              className="p-1 rounded hover:bg-indigo-100 transition opacity-0 group-hover:opacity-100"
                              title="Copy address"
                            >
                              <svg className="h-3 w-3 text-slate-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            {copiedAddress === member.address && (
                              <span className="text-emerald-500 text-[10px] font-medium animate-pulse">✓ Copied!</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {member.address.slice(0, 10)}...{member.address.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* ✅ Active/Inactive Status */}
                          {member.isActive ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-slate-300"></span>
                              </span>
                              Inactive
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            L{level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Total Team Footer */}
      {!loading && teamMembers.length > 0 && (
        <div className="pt-3 border-t border-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap gap-3">
            <span>Total Members: <strong className="text-indigo-600">{teamMembers.length}</strong></span>
            <span>Levels: <strong className="text-indigo-600">
              {[1, 2, 3, 4].filter(l => getLevelCount(l) > 0).length}
            </strong></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(level => {
              const count = getLevelCount(level);
              if (count === 0) return null;
              return (
                <span key={level} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  L{level}: {count}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTree;