import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Gift, Wallet, Package, CheckCircle, Settings } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import Toast from '../components/Toast.js';
import { formatCurrency, formatPhone } from '../utils/format.js';
import type { Member } from '../../shared/types/index.js';

export default function Points() {
  const { members, pointsRules, fetchMembers, fetchConfig, exchangePoints, loading } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [exchangeType, setExchangeType] = useState<'cash' | 'product'>('cash');
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [productName, setProductName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchConfig();
  }, [fetchMembers, fetchConfig]);

  const filteredMembers = members.filter(m =>
    m.name.includes(searchKeyword) || m.phone.includes(searchKeyword)
  ).slice(0, 5);

  const minPoints = pointsRules?.minPoints || 100;
  const exchangeRate = pointsRules?.exchangeRate || 100;
  const cashValue = exchangeType === 'cash' ? Math.floor(pointsToUse / exchangeRate) * 100 : 0;

  const canExchange = selectedMember && selectedMember.points >= pointsToUse && pointsToUse >= minPoints;

  const handleQuickPoints = (points: number) => {
    if (selectedMember && points <= selectedMember.points) {
      setPointsToUse(points);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      setToast({ message: '请选择会员', type: 'error' });
      return;
    }
    if (pointsToUse < minPoints) {
      setToast({ message: `积分不足最低兑换要求 ${minPoints} 分`, type: 'error' });
      return;
    }
    if (pointsToUse > selectedMember.points) {
      setToast({ message: '会员积分不足', type: 'error' });
      return;
    }
    if (exchangeType === 'product' && !productName.trim()) {
      setToast({ message: '请输入兑换商品名称', type: 'error' });
      return;
    }

    try {
      await exchangePoints({
        memberId: selectedMember.id,
        pointsUsed: pointsToUse,
        exchangeType,
        productName: exchangeType === 'product' ? productName : undefined,
      });
      setShowSuccess(true);
      setToast({ message: '积分兑换成功！', type: 'success' });
      
      setTimeout(() => {
        setShowSuccess(false);
        setPointsToUse(0);
        setProductName('');
        fetchMembers();
      }, 2000);
    } catch (err) {
      console.error('Failed to exchange points:', err);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-bounce">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-primary-800 mb-2">兑换成功</h2>
          <p className="text-primary-500">
            {selectedMember?.name} 使用 {pointsToUse} 积分
          </p>
          <p className="text-accent-600 mt-1">
            {exchangeType === 'cash' 
              ? `兑换 ${formatCurrency(cashValue)} 充值到余额`
              : `兑换 ${productName}`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary-800">积分管理</h2>
          <p className="text-primary-500 mt-1">积分兑换，提升会员粘性</p>
        </div>
        <Link to="/points/rules" className="btn-outline flex items-center gap-2">
          <Settings size={18} />
          积分规则
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">选择会员</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索会员姓名或手机号..."
                className="input-field pl-12"
              />
            </div>

            {selectedMember ? (
              <div className="p-4 bg-primary-50 rounded-xl border-2 border-primary-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-serif text-xl font-bold">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-800">{selectedMember.name}</h4>
                    <p className="text-sm text-primary-500">{formatPhone(selectedMember.phone)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary-500">可用积分</p>
                    <p className="font-bold text-primary-800">{selectedMember.points} 分</p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-primary-400 hover:text-primary-600 text-sm"
                  >
                    更换
                  </button>
                </div>
              </div>
            ) : searchKeyword && filteredMembers.length > 0 ? (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setPointsToUse(0);
                    }}
                    className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-800">{member.name}</p>
                      <p className="text-sm text-primary-500">{formatPhone(member.phone)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-800">{member.points} 分</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchKeyword ? (
              <div className="text-center py-8 text-primary-400">
                <User size={40} className="mx-auto mb-2 opacity-50" />
                <p>未找到匹配的会员</p>
              </div>
            ) : (
              <div className="text-center py-8 text-primary-400">
                <User size={40} className="mx-auto mb-2 opacity-50" />
                <p>输入会员姓名或手机号进行搜索</p>
              </div>
            )}
          </div>

          {pointsRules && (
            <div className="card">
              <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">兑换规则</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-accent-50 rounded-xl">
                  <p className="text-sm text-primary-500 mb-1">积分比例</p>
                  <p className="text-lg font-bold text-primary-800">消费 1 元 = {pointsRules.pointsPerYuan} 积分</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-primary-500 mb-1">兑换比例</p>
                  <p className="text-lg font-bold text-primary-800">{pointsRules.exchangeRate} 积分 = 1 元</p>
                </div>
              </div>
              <p className="text-sm text-primary-500 mt-4">
                最低兑换积分：{pointsRules.minPoints} 分
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card sticky top-24">
            <h3 className="font-serif text-lg font-semibold text-primary-800 mb-4">积分兑换</h3>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-primary-700 mb-3">兑换方式</p>
              <div className="space-y-2">
                <button
                  onClick={() => setExchangeType('cash')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    exchangeType === 'cash'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-primary-100 bg-white hover:border-primary-300'
                  }`}
                >
                  <Wallet size={20} className={exchangeType === 'cash' ? 'text-primary-600' : 'text-primary-400'} />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-primary-800">兑换余额</p>
                    <p className="text-xs text-primary-500">积分直接充值到会员余额</p>
                  </div>
                  {exchangeType === 'cash' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setExchangeType('product')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    exchangeType === 'product'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-primary-100 bg-white hover:border-primary-300'
                  }`}
                >
                  <Package size={20} className={exchangeType === 'product' ? 'text-primary-600' : 'text-primary-400'} />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-primary-800">兑换商品</p>
                    <p className="text-xs text-primary-500">兑换实物商品或服务</p>
                  </div>
                  {exchangeType === 'product' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {selectedMember && (
              <div className="mb-6">
                <p className="text-sm font-medium text-primary-700 mb-3">快捷选择</p>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000, 2000, 5000, 10000].filter(p => p <= selectedMember.points && p >= minPoints).map((points) => (
                    <button
                      key={points}
                      onClick={() => handleQuickPoints(points)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        pointsToUse === points
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-primary-200 bg-white hover:border-accent-300'
                      }`}
                    >
                      <p className="font-bold text-sm">{points}</p>
                      <p className="text-xs text-primary-400">分</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  使用积分
                </label>
                <input
                  type="number"
                  value={pointsToUse || ''}
                  onChange={(e) => setPointsToUse(Number(e.target.value))}
                  placeholder="请输入积分数量"
                  className="input-field"
                  min={minPoints}
                  max={selectedMember?.points || 0}
                />
                {selectedMember && (
                  <p className="text-xs text-primary-500 mt-1">
                    可用积分：{selectedMember.points} 分
                  </p>
                )}
              </div>

              {exchangeType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    商品名称
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="请输入兑换商品名称"
                    className="input-field"
                  />
                </div>
              )}

              {pointsToUse > 0 && exchangeType === 'cash' && (
                <div className="p-4 bg-accent-50 rounded-xl border-2 border-accent-200">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600">可兑换余额</span>
                    <span className="text-xl font-bold text-accent-600">
                      {formatCurrency(cashValue)}
                    </span>
                  </div>
                </div>
              )}

              {pointsToUse > 0 && pointsToUse < minPoints && (
                <p className="text-sm text-red-500">
                  最低兑换 {minPoints} 积分
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-primary-100">
              <button
                onClick={handleSubmit}
                disabled={loading || !canExchange || (exchangeType === 'product' && !productName.trim())}
                className="w-full btn-accent text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Gift size={20} />
                {loading ? '处理中...' : '确认兑换'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
