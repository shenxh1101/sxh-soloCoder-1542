import { Link } from 'react-router-dom';
import { User, Phone, Calendar, Wallet, Gift, Clock } from 'lucide-react';
import { formatCurrency, formatPhone, formatDate, getAge } from '../utils/format.js';
import type { Member } from '../../shared/types/index.js';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  const initial = member.name.charAt(0);
  
  return (
    <Link
      to={`/members/${member.id}`}
      className="card-hover block group"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-serif text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-lg font-semibold text-primary-800 truncate">
              {member.name}
            </h3>
            {member.birthday && (
              <span className="text-xs text-primary-500 flex items-center gap-1">
                <Calendar size={12} />
                {getAge(member.birthday)}岁
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-600 mb-3">
            <Phone size={14} />
            <span>{formatPhone(member.phone)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-accent-50 rounded-lg">
              <Wallet size={16} className="text-accent-600" />
              <div>
                <p className="text-xs text-primary-500">余额</p>
                <p className="font-semibold text-primary-800">{formatCurrency(member.balance)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
              <Gift size={16} className="text-primary-600" />
              <div>
                <p className="text-xs text-primary-500">积分</p>
                <p className="font-semibold text-primary-800">{member.points}</p>
              </div>
            </div>
          </div>
          {member.lastVisitAt && (
            <div className="mt-3 flex items-center gap-1 text-xs text-primary-500">
              <Clock size={12} />
              <span>上次消费: {formatDate(member.lastVisitAt)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
