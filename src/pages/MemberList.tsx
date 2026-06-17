import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import MemberCard from '../components/MemberCard.js';

export default function MemberList() {
  const { members, fetchMembers, loading } = useAppStore();
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary-800">会员管理</h2>
          <p className="text-primary-500 mt-1">共 {members.length} 位会员</p>
        </div>
        <Link
          to="/members/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          新增会员
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索会员姓名或手机号..."
              className="input-field pl-12"
            />
          </div>
          <button type="submit" className="btn-outline">
            搜索
          </button>
          <button
            type="button"
            onClick={() => { setSearchInput(''); fetchMembers(); }}
            className="btn-ghost flex items-center gap-2"
          >
            <Filter size={18} />
            重置
          </button>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-primary-100 rounded w-1/2" />
                    <div className="h-4 bg-primary-100 rounded w-1/3" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 bg-primary-50 rounded-lg" />
                      <div className="h-12 bg-primary-50 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-primary-400">
            <p className="text-lg">暂无会员数据</p>
            <Link to="/members/new" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus size={18} />
              添加第一位会员
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
