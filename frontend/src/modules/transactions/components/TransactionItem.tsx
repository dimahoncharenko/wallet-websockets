import { Transaction } from 'types';
import { formatTransactionDate } from '../helpers';
import { colors } from '@lib/theme';

type Props = {
  isIncome: boolean;
  transaction: Transaction;
};

const CATEGORY_EMOJI: Record<string, string> = {
  music: '🎵',
  deposit: '💼',
  shopping: '📦',
  travel: '🏠',
  media: '🎬',
  food: '🍔',
  transfer: '💸',
};

function getEmoji(category: string): string {
  return (
    CATEGORY_EMOJI[category?.toLowerCase()] ??
    (category?.toLowerCase().includes('transfer') ? '💸' : '💳')
  );
}

export const TransactionItem = ({ isIncome, transaction }: Props) => {
  const emoji = getEmoji(transaction.category);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          flexShrink: 0,
          background: colors.surfaceDefault,
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {transaction.description}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
          {formatTransactionDate(transaction.date)} · {transaction.category}
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: isIncome ? '#30e8a0' : 'rgba(255,255,255,0.7)',
          flexShrink: 0,
        }}
      >
        {isIncome ? '+' : '-'}
        {transaction.amount}
        {transaction.currency}
      </div>
    </div>
  );
};
