import { useLayoutEffect, useRef, useState } from 'react';
import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radius,
  transition,
} from '@lib/theme';
import type { CardNetwork } from 'types';
import {
  SvgChevronLeft,
  SvgClose,
  SvgEyeClosed,
  SvgEyeOpen,
  SvgLock,
} from '@components/Icons';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { CARD_COLOR_KEYS, CARD_THEMES, STEP_TITLES } from '../const';
import { BaseCard, CardTopRow, CardMetaRow } from './BaseCard';
import { useAddCardModal, type FormData } from '../hooks/useAddCardModal';
import { formatExpiry, formatPan, luhn, validateExpiry } from '../helpers';

export const AddCardModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const {
    dialogRef,
    mounted,
    step,
    form,
    setForm,
    touched,
    setTouched,
    loading,
    network,
    step1Valid,
    step2Valid,
    handleNext,
    handleBack,
    handleConfirm,
    isVisible,
  } = useAddCardModal(isOpen, onClose);

  const isDesktop = useMediaQuery();

  if (!isOpen && !mounted) return null;

  const renderHeader = () => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              style={{
                background: colors.surfaceDefault,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radius.md,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SvgChevronLeft size={14} color={colors.textSecondary} />
            </button>
          )}
          <div>
            <h2
              id="add-card-modal-title"
              style={{
                fontSize: fontSize['2xl'],
                fontWeight: fontWeight.bold,
                color: colors.textPrimary,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {STEP_TITLES[step]}
            </h2>
            <p
              style={{
                fontSize: fontSize.sm,
                color: colors.textSecondary,
                margin: 0,
                marginTop: 2,
              }}
            >
              Step {step} of 3
            </p>
          </div>
        </div>
        <button
          data-testid="close-btn"
          onClick={onClose}
          aria-label="Close"
          style={{
            background: colors.surfaceDefault,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radius.md,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <SvgClose size={10} color={colors.textSecondary} />
        </button>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <>
        {step === 1 && (
          <Step1
            form={form}
            setForm={setForm}
            touched={touched}
            setTouched={setTouched}
          />
        )}
        {step === 2 && <Step2 form={form} setForm={setForm} />}
        {step === 3 && <Step3 form={form} network={network} />}
      </>
    );
  };

  const renderFooter = () => {
    return (
      <>
        <ActionButton
          handleConfirm={handleConfirm}
          handleNext={handleNext}
          loading={loading}
          step={step}
          valid={{ '1': step1Valid, '2': step2Valid, '3': true }}
        />

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <SvgLock size={11} color={colors.textMuted} />
          <span style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
            256-bit encrypted · PCI DSS compliant
          </span>
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: isDesktop ? '16px' : 0,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: `opacity ${transition.default}`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2,2,14,0.75)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal
        aria-labelledby="add-card-modal-title"
        tabIndex={-1}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isDesktop ? 420 : '100%',
          background: '#0f1023',
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: isDesktop
            ? radius.card
            : `${radius.card}px ${radius.card}px 0 0`,
          boxShadow: isDesktop
            ? '0 24px 80px rgba(0,0,0,0.7)'
            : '0 -8px 48px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: isDesktop ? 'calc(100dvh - 32px)' : '90dvh',
          overflow: 'hidden',
          transform: isVisible
            ? 'translateY(0) scale(1)'
            : isDesktop
              ? 'translateY(16px) scale(0.97)'
              : 'translateY(100%)',
          transition: `transform ${transition.slow} cubic-bezier(0.34,1.2,0.64,1)`,
        }}
      >
        <ProgressBar step={step} />

        <div
          aria-hidden
          className="modal-scroll"
          style={{ padding: '20px 22px 24px', overflowY: 'auto', flex: 1 }}
        >
          {renderHeader()}

          <div aria-hidden>
            <CardPreview form={form} network={network} />
          </div>

          {renderContent()}
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

const CardPreview = ({
  form,
  network,
}: {
  form: FormData;
  network: CardNetwork;
}) => {
  const theme = CARD_THEMES[form.cardColor];
  const [showBalance, setShowBalance] = useState(false);
  const rawDigits = form.pan.replace(/\s/g, '');

  const previewPan = Array.from({ length: 4 }, (_, i) => {
    const chunk = rawDigits.slice(i * 4, i * 4 + 4);
    return chunk.length === 0 ? '••••' : chunk.padEnd(4, '•');
  }).join('  ');

  return (
    <BaseCard theme={theme} style={{ marginBottom: 20 }}>
      <CardTopRow label="External Card" />

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: fontSize.xs,
              fontWeight: fontWeight.semibold,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Balance
          </span>
          <button
            onClick={() => setShowBalance((v) => !v)}
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showBalance ? <SvgEyeOpen /> : <SvgEyeClosed />}
          </button>
        </div>
        <p
          style={{
            fontSize: fontSize['5xl'],
            fontWeight: fontWeight.extrabold,
            color: colors.textPrimary,
            letterSpacing: letterSpacing.tighter,
            lineHeight: 1,
            margin: 0,
          }}
        >
          {showBalance ? (
            '$0.00'
          ) : (
            <span style={{ letterSpacing: '0.2em', fontSize: 20 }}>••••••</span>
          )}
        </p>
      </div>

      <span
        style={{
          fontSize: fontSize.base,
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.22em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {previewPan}
      </span>

      <CardMetaRow
        holderName={form.holderName.toUpperCase() || 'YOUR NAME'}
        expiry={form.expiry || 'MM/YY'}
        cardNetwork={network}
      />
    </BaseCard>
  );
};

const ProgressBar = ({ step }: { step: 1 | 2 | 3 }) => (
  <div
    style={{
      height: 3,
      background: colors.surfaceDefault,
      borderRadius: 0,
    }}
  >
    <div
      style={{
        height: '100%',
        width: `${(step / 3) * 100}%`,
        background: colors.income,
        borderRadius: 0,
        transition: `width ${transition.slow} ease`,
      }}
    />
  </div>
);

const Step1 = ({
  form,
  setForm,
  touched,
  setTouched,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  touched: Set<string>;
  setTouched: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const rawDigits = form.pan.replace(/\s/g, '');

  const panError =
    touched.has('pan') && rawDigits.length === 16 && !luhn(form.pan);

  const expiryError =
    touched.has('expiry') &&
    form.expiry.length >= 5 &&
    !validateExpiry(form.expiry);

  const touch = (field: string) => setTouched((s) => new Set(s).add(field));

  const panRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursor.current !== null && panRef.current) {
      panRef.current.setSelectionRange(
        pendingCursor.current,
        pendingCursor.current,
      );

      pendingCursor.current = null;
    }
  }, [form.pan]);

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPos = e.target.selectionStart ?? 0;
    const digitsBeforeCursor = e.target.value
      .slice(0, cursorPos)
      .replace(/\D/g, '').length;

    const formatted = formatPan(e.target.value);

    let digitsSeen = 0;
    let newCursor = formatted.length;

    for (let i = 0; i < formatted.length; i++) {
      if (digitsSeen === digitsBeforeCursor) {
        newCursor = i;
        break;
      }
      if (/\d/.test(formatted[i])) digitsSeen++;
    }

    pendingCursor.current = newCursor;
    setForm((f) => ({ ...f, pan: formatted }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label htmlFor="add-card-pan" style={labelStyle}>
          Card Number
        </label>
        <input
          id="add-card-pan"
          ref={panRef}
          inputMode="numeric"
          value={form.pan}
          onBlur={() => touch('pan')}
          onChange={handlePanChange}
          aria-invalid={panError}
          aria-describedby={panError ? 'add-card-pan-error' : undefined}
          style={{
            ...inputBase,
            borderColor: panError ? colors.spending : colors.borderDefault,
          }}
        />
        {panError && (
          <span
            id="add-card-pan-error"
            role="alert"
            style={{
              fontSize: fontSize.xs,
              color: colors.spending,
              marginTop: 4,
              display: 'block',
            }}
          >
            Invalid card number
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label htmlFor="add-card-expiry" style={labelStyle}>
            Expiry
          </label>
          <input
            id="add-card-expiry"
            inputMode="numeric"
            placeholder="MM/YY"
            value={form.expiry}
            onBlur={() => touch('expiry')}
            onChange={(e) =>
              setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))
            }
            aria-invalid={expiryError}
            aria-describedby={expiryError ? 'add-card-expiry-error' : undefined}
            style={{
              ...inputBase,
              borderColor: expiryError ? colors.spending : colors.borderDefault,
            }}
          />
          {expiryError && (
            <span
              id="add-card-expiry-error"
              role="alert"
              style={{
                fontSize: fontSize.xs,
                color: colors.spending,
                marginTop: 4,
                display: 'block',
              }}
            >
              Card expired
            </span>
          )}
        </div>
        <div>
          <label htmlFor="add-card-cvv" style={labelStyle}>
            CVV
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="add-card-cvv"
              type="password"
              inputMode="numeric"
              placeholder="···"
              maxLength={4}
              value={form.cvv}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                }))
              }
              style={{ ...inputBase, paddingRight: 40 }}
            />
            <div
              style={{
                position: 'absolute',
                right: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <SvgLock />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Card Color</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
          {CARD_COLOR_KEYS.map((color) => {
            const isSelected = form.cardColor === color;
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                onClick={() => setForm((f) => ({ ...f, cardColor: color }))}
                className="focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.full,
                  background: CARD_THEMES[color].dot,
                  border: 'none',
                  cursor: 'pointer',
                  outline: isSelected
                    ? `2px solid ${CARD_THEMES[color].dot}`
                    : '2px solid transparent',
                  outlineOffset: 3,
                  transition: `outline ${transition.default}`,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Step2 = ({
  form,
  setForm,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div>
      <label htmlFor="add-card-holder" style={labelStyle}>
        Cardholder Name
      </label>
      <input
        id="add-card-holder"
        placeholder="As printed on card"
        value={form.holderName}
        onChange={(e) => setForm((f) => ({ ...f, holderName: e.target.value }))}
        style={inputBase}
        autoFocus
      />
    </div>
    <div>
      <label htmlFor="add-card-nickname" style={labelStyle}>
        Nickname{' '}
        <span
          style={{
            color: colors.textMuted,
            textTransform: 'none',
            letterSpacing: 0,
          }}
        >
          (optional)
        </span>
      </label>
      <input
        id="add-card-nickname"
        placeholder="e.g. Travel card, Backup"
        value={form.nickname}
        onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
        style={inputBase}
      />
    </div>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px solid ${colors.borderFaint}`,
    }}
  >
    <span style={{ fontSize: fontSize.base, color: colors.textSecondary }}>
      {label}
    </span>
    <span
      style={{
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
      }}
    >
      {value}
    </span>
  </div>
);

const Step3 = ({ form, network }: { form: FormData; network: CardNetwork }) => {
  const rawDigits = form.pan.replace(/\s/g, '');
  const masked = `···· ···· ···· ${rawDigits.slice(-4)}`;

  return (
    <div
      style={{
        background: colors.surfaceBare,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: radius.lg,
        padding: '0 14px',
      }}
    >
      <SummaryRow
        label="Network"
        value={network.charAt(0).toUpperCase() + network.slice(1)}
      />
      <SummaryRow label="Card number" value={masked} />
      <SummaryRow label="Cardholder" value={form.holderName.toUpperCase()} />
      <SummaryRow label="Expires" value={form.expiry} />
      <SummaryRow label="Nickname" value={form.nickname || '—'} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
        }}
      >
        <span style={{ fontSize: fontSize.base, color: colors.textSecondary }}>
          Color
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: radius.full,
              background: CARD_THEMES[form.cardColor].dot,
            }}
          />
          <span
            style={{
              fontSize: fontSize.base,
              fontWeight: fontWeight.semibold,
              color: colors.textPrimary,
            }}
          >
            {form.cardColor.charAt(0).toUpperCase() + form.cardColor.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({
  step,
  valid,
  handleNext,
  handleConfirm,
  loading,
}: {
  step: number;
  valid: { [P: string]: boolean };
  handleNext: () => void;
  loading: boolean;
  handleConfirm: () => void;
}) => {
  return (
    <div style={{ marginTop: 20 }}>
      {step < 3 ? (
        <button
          disabled={!valid[step]}
          aria-disabled={!valid[step]}
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: radius.xl,
            background: valid[step]
              ? colors.surfaceDefault
              : colors.surfaceFaint,
            color: valid[step] ? colors.textPrimary : colors.textMuted,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            cursor: valid[step] ? 'pointer' : 'not-allowed',
            letterSpacing: letterSpacing.wide,
            transition: `background ${transition.default}, color ${transition.default}`,
            border: `1px solid ${colors.borderDefault}`,
          }}
        >
          Continue &rsaquo;
        </button>
      ) : (
        <button
          disabled={loading}
          aria-disabled={loading}
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: radius.xl,
            border: 'none',
            background: loading ? colors.surfaceDefault : colors.income,
            color: loading ? colors.textMuted : colors.bg,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: letterSpacing.wide,
            transition: `background ${transition.default}`,
          }}
        >
          {loading ? 'Processing…' : 'Confirm & Add Card'}
        </button>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: fontSize.xs,
  fontWeight: fontWeight.semibold,
  color: colors.textSecondary,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

const inputBase: React.CSSProperties = {
  width: '100%',
  background: colors.surfaceDefault,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: radius.lg,
  padding: '11px 14px',
  fontSize: fontSize.base,
  color: colors.textPrimary,
  outline: 'none',
  boxSizing: 'border-box',
};
