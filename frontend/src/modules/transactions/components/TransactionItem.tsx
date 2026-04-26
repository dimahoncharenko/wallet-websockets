import { Transaction } from 'types';
import { formatTransactionDate } from '../helpers';

type Props = {
  isIncome: boolean;
  transaction: Transaction;
};

export const TransactionItem = ({ isIncome, transaction }: Props) => {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/[0.07] rounded-2xl px-4 py-3 hover:bg-white/[0.08] transition-colors lg:border-white/[0.05]">
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-base flex-shrink-0">
        {isIncome ? '↑' : '↓'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate">
          {transaction.description}
        </p>
        <p className="text-[10px] text-white/40 uppercase tracking-wider">
          {formatTransactionDate(transaction.date)} · {transaction.category}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`text-[13px] font-bold ${isIncome ? 'text-emerald-400' : 'text-white'}`}
        >
          {isIncome ? '+' : '-'}
          {transaction.amount}
          {transaction.currency}
        </p>
      </div>
    </div>
  );
};
