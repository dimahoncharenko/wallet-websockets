export const Empty = () => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '32px 0',
        opacity: 0.4,
      }}
    >
      <span role="img" aria-hidden style={{ fontSize: 32 }}>
        💳
      </span>
      <div
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 500,
        }}
      >
        No transactions yet
      </div>
    </div>
  );
};
