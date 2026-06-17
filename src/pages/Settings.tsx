import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Scissors,
  Cake,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Save,
} from 'lucide-react';
import { useAppStore } from '../store/index.js';
import { formatCurrency } from '../utils/format.js';
import type { ServiceItem, BirthdayConfig } from '../../shared/types/index.js';

export default function Settings() {
  const { services, birthdayConfig, fetchConfig, updateServices, updateBirthdayConfig, loading, error } = useAppStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'birthday'>('services');

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [newService, setNewService] = useState<{ name: string; price: string; category: ServiceItem['category'] }>({
    name: '', price: '', category: 'haircut'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const [birthdayForm, setBirthdayForm] = useState<BirthdayConfig>({
    remindDays: 7,
    couponAmount: 0,
  });

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (birthdayConfig) {
      setBirthdayForm(birthdayConfig);
    }
  }, [birthdayConfig]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  const tabs = [
    { key: 'services' as const, label: '服务项目', icon: Scissors },
    { key: 'birthday' as const, label: '生日提醒', icon: Cake },
  ];

  const categoryLabels: Record<ServiceItem['category'], string> = {
    haircut: '理发',
    perm: '烫染',
    treatment: '护理',
    other: '其他',
  };

  const categoryColors: Record<ServiceItem['category'], string> = {
    haircut: 'bg-primary-100 text-primary-700',
    perm: 'bg-accent-100 text-accent-700',
    treatment: 'bg-green-100 text-green-700',
    other: 'bg-purple-100 text-purple-700',
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      setToast({ message: '请输入服务名称', type: 'error' });
      return;
    }
    const price = parseFloat(newService.price);
    if (isNaN(price) || price <= 0) {
      setToast({ message: '请输入有效价格', type: 'error' });
      return;
    }

    const newItem: ServiceItem = {
      id: Date.now().toString(),
      name: newService.name.trim(),
      price: Math.round(price * 100),
      category: newService.category,
    };

    try {
      await updateServices([...services, newItem]);
      setNewService({ name: '', price: '', category: 'haircut' });
      setShowAddForm(false);
      setToast({ message: '服务项目添加成功', type: 'success' });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    if (!editingService.name.trim()) {
      setToast({ message: '请输入服务名称', type: 'error' });
      return;
    }
    if (editingService.price <= 0) {
      setToast({ message: '请输入有效价格', type: 'error' });
      return;
    }

    try {
      const updatedServices = services.map(s =>
        s.id === editingService.id ? editingService : s
      );
      await updateServices(updatedServices);
      setEditingService(null);
      setToast({ message: '服务项目更新成功', type: 'success' });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('确定要删除这个服务项目吗？')) return;
    try {
      const updatedServices = services.filter(s => s.id !== id);
      await updateServices(updatedServices);
      setToast({ message: '服务项目删除成功', type: 'success' });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleSaveBirthdayConfig = async () => {
    if (birthdayForm.remindDays <= 0) {
      setToast({ message: '提醒天数必须大于0', type: 'error' });
      return;
    }
    if (birthdayForm.couponAmount < 0) {
      setToast({ message: '优惠券金额不能为负数', type: 'error' });
      return;
    }

    try {
      await updateBirthdayConfig(birthdayForm);
      setToast({ message: '生日提醒配置保存成功', type: 'success' });
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 p-1 bg-primary-50 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-primary-700 shadow-md'
                    : 'text-primary-500 hover:text-primary-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'services' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Scissors size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-primary-800">服务项目管理</h3>
                <p className="text-sm text-primary-500">管理理发店的服务项目和价格</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              添加项目
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <h4 className="font-medium text-primary-700 mb-4">添加新服务</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  服务名称
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="input-field"
                  placeholder="例如：男士剪发"
                />
              </div>
                <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  价格（元）
                </label>
                <input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
                <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  分类
                </label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value as ServiceItem['category'] })}
                  className="input-field"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleAddService}
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    确认
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 bg-primary-50/50 rounded-xl hover:bg-primary-50 transition-colors"
            >
              {editingService?.id === service.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                  <input
                    type="text"
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={(editingService.price / 100).toFixed(2)}
                    onChange={(e) => setEditingService({ ...editingService, price: Math.round(parseFloat(e.target.value) * 100) })}
                    className="input-field"
                    step="0.01"
                  />
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as ServiceItem['category'] })}
                    className="input-field"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateService}
                      disabled={loading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${categoryColors[service.category]}`}>
                      {categoryLabels[service.category]}
                    </span>
                    <div>
                      <p className="font-medium text-primary-800">{service.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-accent-600">
                      {formatCurrency(service.price)}
                    </span>
                    <button
                      onClick={() => setEditingService(service)}
                      className="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12 text-primary-400">
              <Scissors size={48} className="mx-auto mb-3 opacity-50" />
              <p>暂无服务项目</p>
              <p className="text-sm mt-1">点击上方按钮添加第一个服务项目</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'birthday' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Cake size={20} className="text-pink-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-primary-800">生日提醒设置</h3>
              <p className="text-sm text-primary-500">设置生日会员提醒和优惠券配置</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                提前提醒天数
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={birthdayForm.remindDays}
                  onChange={(e) => setBirthdayForm({ ...birthdayForm, remindDays: parseInt(e.target.value) || 0 })}
                  className="input-field pr-12"
                  min="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500">
                  天
                </span>
              </div>
              <p className="text-xs text-primary-500 mt-1">
                会员生日前多少天开始提醒
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                生日优惠券金额
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  ¥
                </span>
                <input
                  type="number"
                  value={(birthdayForm.couponAmount / 100).toFixed(2)}
                  onChange={(e) => setBirthdayForm({ ...birthdayForm, couponAmount: Math.round(parseFloat(e.target.value) * 100) })}
                  className="input-field pl-10"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-primary-500 mt-1">
                给生日会员发送的优惠券金额
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
            <h4 className="font-medium text-primary-700 mb-2">配置说明</h4>
            <ul className="text-sm text-primary-600 space-y-1">
              <li>• 系统会自动识别未来 {birthdayForm.remindDays} 天内生日的会员</li>
              <li>• 生日会员会显示在首页的「近期生日会员」列表中</li>
              <li>• 优惠券金额仅作为提示，实际赠送需手动操作</li>
              <li>• 可以为生日会员赠送 {formatCurrency(birthdayForm.couponAmount)} 优惠券</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveBirthdayConfig}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              保存配置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
